/**
 * The application server: one evaluation endpoint that calls the engine and a
 * config endpoint for the privacy panel. In production it also serves the
 * built app.
 *
 * Privacy rules (PROMPT.md Section 4) enforced here:
 * - nothing is written to disk; draft text lives only in the request
 * - logs carry request kinds, hashed request ids, domains and status codes,
 *   never draft text, response bodies, URL paths or fetched content
 * - no analytics, no telemetry, no fallback provider
 *
 * Robustness rules:
 * - no request, however malformed, can take the process down: the address
 *   is parsed defensively and every handler runs inside one safety net
 * - on shutdown (every deploy) the server stops taking new work and lets
 *   the reviews already running finish before it exits
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { EngineError } from "../engine/client.js";
import { getEngineConfig } from "../engine/config.js";
import { FEATURES } from "../app/features.js";
import { evaluateDraft } from "../engine/evaluate.js";
import { compareWithSaved } from "../engine/compare.js";
import { findPublicContext } from "../engine/publicContext.js";
import { settingsDrift, type SavedReview } from "../engine/savedReview.js";
import type { EvaluationResult } from "../engine/evaluate.js";
import { loadEnvFile } from "./env.js";
import { parseEvaluationRequest, RequestValidationError } from "./requestSchema.js";
import {
  chargeOne,
  clearLoginFailures,
  refundOne,
  clearedCookie,
  GATE_ENABLED,
  isAuthorized,
  loginAllowed,
  passwordMatches,
  PER_VISITOR_DAILY,
  recordLoginFailure,
  sessionCookie,
  TOO_MANY_ATTEMPTS,
  TOTAL_DAILY,
  usageToday,
} from "./access.js";

loadEnvFile();
const PORT = Number(process.env.PORT ?? 8787);
const DIST = join(process.cwd(), "dist");
const SERVE_STATIC = process.env.ACR_SERVE_STATIC === "1" || process.env.NODE_ENV === "production";
const MAX_BODY = 1_000_000;


/**
 * Headers every response carries. The page may not be framed by another site,
 * may load scripts, styles, fonts and data only from this server, and over
 * HTTPS tells the browser to keep using HTTPS. Inline style attributes are
 * allowed because the app sets a few; inline scripts are not. Blob and data
 * URLs cover the PDF download, the PDF reader's worker and pasted images.
 *
 * 'unsafe-eval' is there for one reason: the validator (ajv) turns each
 * schema into code when the page loads, and without it the app does not
 * start. Scripts still come only from this server.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export function securityHeaders(secure: boolean): Record<string, string> {
  return {
    "content-security-policy": CONTENT_SECURITY_POLICY,
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    ...(secure ? { "strict-transport-security": "max-age=31536000" } : {}),
  };
}

/** True when the deployment is behind HTTPS, so the session cookie can be marked Secure. */
function isSecure(req: IncomingMessage): boolean {
  return (req.headers["x-forwarded-proto"] as string | undefined) === "https";
}

function send(res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}): void {
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(status, {
    ...securityHeaders(isSecure(res.req)),
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...(shuttingDown ? { connection: "close" } : {}),
    ...extra,
  });
  res.end(JSON.stringify(body));
}

async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!GATE_ENABLED) return send(res, 200, { ok: true });
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: "bad_request", message: "The request could not be read." });
  }
  // Checked before the password, so a pause cannot be waited out by
  // guessing faster.
  if (!loginAllowed(req)) {
    console.log("login result=paused");
    return send(res, 429, { error: "rate_limited", message: TOO_MANY_ATTEMPTS });
  }
  const supplied = typeof body === "object" && body !== null ? (body as { password?: unknown }).password : undefined;
  if (!passwordMatches(supplied)) {
    recordLoginFailure(req);
    console.log("login result=refused");
    return send(res, 401, { error: "unauthorized", message: "That password is not right." });
  }
  clearLoginFailures(req);
  console.log("login result=accepted");
  send(res, 200, { ok: true }, { "set-cookie": sessionCookie(isSecure(req)) });
}

function handleLogout(req: IncomingMessage, res: ServerResponse): void {
  send(res, 200, { ok: true }, { "set-cookie": clearedCookie(isSecure(req)) });
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "null"));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

async function handleEvaluate(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    send(res, 400, { error: "bad_request", message: "The request could not be read." });
    return;
  }
  let request;
  try {
    request = parseEvaluationRequest(body);
  } catch (error) {
    const path = error instanceof RequestValidationError ? error.path : "/";
    console.log(`evaluate rejected: invalid request at ${path}`);
    send(res, 400, { error: "bad_request", message: "Something in the form wasn't filled in correctly. Check your answers and try again." });
    return;
  }
  try {
    const result = await evaluateDraft(request, { log: (line) => console.log(line) });
    console.log(`[${result.request_id}] evaluated ok (${result.usage.input_tokens} in / ${result.usage.output_tokens} out)`);
    send(res, 200, result);
  } catch (error) {
    if (error instanceof EngineError) {
      console.log(`[${error.requestId}] evaluate failed: ${error.kind} — ${error.message}`);
      const status = error.kind === "auth" ? 503 : error.kind === "refusal" ? 422 : 502;
      // The engine's own message travels to the browser. It names the kind of
      // fault and, for a validation failure, the field — "(at
      // /questions_before_publication)" — and nothing from the draft: every
      // path is a JSON pointer, and the facts beside it are structural
      // ("expected exactly 5 personas"). Replacing all four with one sentence
      // meant a tester could only report a reference number, and every failure
      // cost a trip to the service log before anyone knew what had happened.
      send(res, status, { error: error.kind, message: error.message, request_id: error.requestId });
      return;
    }
    console.log(`evaluate failed: ${error instanceof Error ? error.name : "unknown"}`);
    send(res, 500, { error: "server_error", message: "The evaluation failed. Try again." });
  }
}

async function handleCompare(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    send(res, 400, { error: "bad_request", message: "The request could not be read." });
    return;
  }
  const b = (typeof body === "object" && body !== null ? body : {}) as { saved?: unknown; request?: unknown; fresh?: unknown };
  let request;
  try {
    request = parseEvaluationRequest(b.request);
  } catch (error) {
    const path = error instanceof RequestValidationError ? error.path : "/";
    console.log(`compare rejected: invalid request at ${path}`);
    send(res, 400, { error: "bad_request", message: "Something in the form wasn't filled in correctly. Check your answers and try again." });
    return;
  }
  const saved = b.saved as SavedReview | undefined;
  const fresh = b.fresh as EvaluationResult | undefined;
  if (!saved?.findings || !Array.isArray(saved.dimensions) || !fresh?.analysis) {
    send(res, 400, { error: "bad_request", message: "The saved review or the new review is missing." });
    return;
  }
  try {
    const result = await compareWithSaved(saved, request, fresh, settingsDrift(saved.settings, request), {
      log: (line) => console.log(line),
    });
    console.log(`[${result.request_id}] compare ok (${result.verdicts.length} verdicts)`);
    send(res, 200, result);
  } catch (error) {
    if (error instanceof EngineError) {
      console.log(`[${error.requestId}] compare failed: ${error.kind} — ${error.message}`);
      const status = error.kind === "auth" ? 503 : error.kind === "refusal" ? 422 : 502;
      send(res, status, { error: error.kind, message: error.message, request_id: error.requestId });
      return;
    }
    console.log(`compare failed: ${error instanceof Error ? error.name : "unknown"}`);
    send(res, 500, { error: "server_error", message: "The comparison failed. Try again." });
  }
}

async function handlePublicContext(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    send(res, 400, { error: "bad_request", message: "The request could not be read." });
    return;
  }
  const query = typeof body === "object" && body !== null && typeof (body as { query?: unknown }).query === "string" ? (body as { query: string }).query.trim() : "";
  if (query.length < 3 || query.length > 300) {
    send(res, 400, { error: "bad_request", message: "Enter a topic of 3 to 300 characters." });
    return;
  }
  try {
    const result = await findPublicContext(query);
    console.log(`[${result.request_id}] public-context ok (${result.items.length} items)`);
    send(res, 200, result);
  } catch (error) {
    if (error instanceof EngineError) {
      console.log(`[${error.requestId}] public-context failed: ${error.kind} — ${error.message}`);
      const status = error.kind === "auth" ? 503 : error.kind === "refusal" ? 422 : 502;
      send(res, status, { error: error.kind, message: error.message, request_id: error.requestId });
      return;
    }
    console.log(`public-context failed: ${error instanceof Error ? error.name : "unknown"}`);
    send(res, 500, { error: "server_error", message: "The search failed. Try again." });
  }
}

function handleConfig(req: IncomingMessage, res: ServerResponse): void {
  const c = getEngineConfig();
  send(res, 200, {
    provider: c.provider,
    model: c.model,
    processing_mode: c.processingMode,
    training_term: c.trainingTerm,
    gate_enabled: GATE_ENABLED,
    signed_in: isAuthorized(req),
    daily_limit_per_visitor: PER_VISITOR_DAILY,
    daily_limit_total: TOTAL_DAILY,
  });
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function serveStatic(pathname: string, req: IncomingMessage, res: ServerResponse): boolean {
  if (!SERVE_STATIC || !existsSync(join(DIST, "index.html"))) return false;
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, safe);
  if (!file.startsWith(DIST)) return false;
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, "index.html");
  const type = MIME[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, {
    ...securityHeaders(isSecure(req)),
    "content-type": type,
    "cache-control": file.endsWith("index.html") ? "no-store" : "public, max-age=3600",
  });
  // A file that vanishes mid-read (a deploy replacing dist/) ends this
  // response, not the process.
  createReadStream(file)
    .on("error", () => res.destroy())
    .pipe(res);
  return true;
}

/** The endpoints that call the provider and therefore cost money. */
const PAID = new Set(["/api/evaluate", "/api/compare", "/api/public-context"]);

/**
 * Paid endpoints behind a feature switched off in the app. The screen hides
 * them; the server must refuse them too, or anyone with the password could
 * still spend money on, and send text to, a feature nobody is testing.
 * Comparing needs a saved review, so it needs both switches.
 */
export function switchedOff(pathname: string): boolean {
  if (pathname === "/api/compare") return !(FEATURES.compareRevisions && FEATURES.saveReview);
  if (pathname === "/api/public-context") return !FEATURES.publicContextSearch;
  return false;
}

const SWITCHED_OFF = "This feature is switched off for this round of testing.";

/** The request's path, or null when the address cannot be read at all. */
function pathOf(req: IncomingMessage): string | null {
  try {
    return new URL(req.url ?? "/", "http://localhost").pathname;
  } catch {
    return null;
  }
}

/** Requests being worked on now, so a shutdown can wait for them. */
let inFlight = 0;
let shuttingDown = false;

export const server = createServer(async (req, res) => {
  inFlight += 1;
  // While stopping, each reply closes its connection, so a browser holding it
  // open for the next request cannot keep the old server alive.
  if (shuttingDown) res.setHeader("connection", "close");
  res.once("close", () => {
    inFlight -= 1;
    if (shuttingDown) setImmediate(() => server.closeIdleConnections());
  });
  // The safety net. A fault in one request is that request's problem: it gets
  // an error reply and the server keeps serving everyone else.
  try {
    await route(req, res);
  } catch (error) {
    console.log(`request failed: ${error instanceof Error ? error.name : "unknown"}`);
    if (!res.headersSent) send(res, 500, { error: "server_error", message: "Something went wrong. Try again." });
    else res.destroy();
  }
});

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const pathname = pathOf(req);
  if (pathname === null) {
    return send(res, 400, { error: "bad_request", message: "The request could not be read." });
  }
  const url = { pathname };
  const method = req.method ?? "GET";
  if (url.pathname === "/api/config" && method === "GET") return handleConfig(req, res);
  if (url.pathname === "/api/login" && method === "POST") return handleLogin(req, res);
  if (url.pathname === "/api/logout" && method === "POST") return handleLogout(req, res);

  // Everything below spends the owner's provider credit, so it is gated and capped.
  if (url.pathname.startsWith("/api/") && !isAuthorized(req)) {
    return send(res, 401, { error: "unauthorized", message: "Enter the password to use this tool." });
  }
  if (url.pathname === "/api/usage" && method === "GET") return send(res, 200, usageToday());
  if (switchedOff(url.pathname)) return send(res, 404, { error: "switched_off", message: SWITCHED_OFF });
  if (PAID.has(url.pathname) && method === "POST") {
    const decision = chargeOne(req);
    if (!decision.allowed) return send(res, 429, { error: "rate_limited", message: decision.message });
    // Charged up front so two requests at once cannot both slip through, and
    // given back if the request fails. Done here rather than in each handler
    // so no error path can be missed.
    res.once("finish", () => {
      if (res.statusCode >= 400) refundOne(req);
    });
  }
  if (url.pathname === "/api/evaluate" && method === "POST") return handleEvaluate(req, res);
  if (url.pathname === "/api/public-context" && method === "POST") return handlePublicContext(req, res);
  if (url.pathname === "/api/compare" && method === "POST") return handleCompare(req, res);
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not_found", message: "No such endpoint." });
  if (method === "GET" && serveStatic(url.pathname, req, res)) return;
  send(res, 404, { error: "not_found", message: "Not found." });
}

/**
 * How long a shutdown waits for running reviews. A review takes one to two
 * minutes, and two attempts can take four; render.yaml gives Render's own
 * wait the most it allows (maxShutdownDelaySeconds: 300), a little longer
 * than this, so the process finishes on its own terms.
 */
export const SHUTDOWN_GRACE_MS = 290_000;

/**
 * Stop taking new work, let what is running finish, then exit. Render sends
 * SIGTERM on every deploy and restart; without this, a push cut off every
 * review in progress and testers saw "The server could not be reached".
 */
export function shutdown(signal: string, exit: (code: number) => void = (code) => process.exit(code)): void {
  console.log(`${signal} received: finishing ${inFlight} request(s) in progress, then stopping`);
  shuttingDown = true;
  server.close(() => exit(0));
  server.closeIdleConnections();
  const deadline = setTimeout(() => {
    console.log("shutdown grace period over; stopping");
    exit(0);
  }, SHUTDOWN_GRACE_MS);
  deadline.unref();
}

if (process.argv[1] && /server\.(ts|js)$/.test(process.argv[1])) {
  // Settings are checked once, at start. A typo in ACR_EFFORT or ACR_SPEED
  // used to throw inside the health check on every call; now it stops the
  // start with a plain message, and Render keeps the previous version live.
  let c: ReturnType<typeof getEngineConfig>;
  try {
    c = getEngineConfig();
  } catch (error) {
    console.error(`Cannot start: ${error instanceof Error ? error.message : String(error)}. Fix it in the service's environment settings.`);
    process.exit(1);
  }
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
  server.listen(PORT, () => {
    console.log(`Trust Assessment Assistant server on http://localhost:${PORT} (provider ${c.provider}, model ${c.model}${SERVE_STATIC ? ", serving dist/" : ""})`);
    console.log(
      GATE_ENABLED
        ? `Access gate on. Limits: ${PER_VISITOR_DAILY} reviews per visitor per day, ${TOTAL_DAILY} in total.`
        : "Access gate OFF (no ACR_ACCESS_PASSWORD set). Correct on your own computer; never deploy to a public address like this.",
    );
  });
}
