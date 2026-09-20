/**
 * The application server: one evaluation endpoint that calls the engine, one
 * stateless fetch-and-extract endpoint for URL import, and a config endpoint
 * for the privacy panel. In production it also serves the built app.
 *
 * Privacy rules (PROMPT.md Section 4) enforced here:
 * - nothing is written to disk; draft text lives only in the request
 * - logs carry request kinds, hashed request ids, domains and status codes,
 *   never draft text, response bodies, URL paths or fetched content
 * - no analytics, no telemetry, no fallback provider
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { EngineError } from "../engine/client.js";
import { getEngineConfig } from "../engine/config.js";
import { evaluateDraft } from "../engine/evaluate.js";
import { compareWithSaved } from "../engine/compare.js";
import { findPublicContext } from "../engine/publicContext.js";
import { settingsDrift, type SavedReview } from "../engine/savedReview.js";
import type { EvaluationResult } from "../engine/evaluate.js";
import { loadEnvFile } from "./env.js";
import { allowedUrl, extractReadable, fetchPage, IMPORT_ERROR } from "./import.js";
import { parseEvaluationRequest, RequestValidationError } from "./requestSchema.js";
import {
  chargeOne,
  clearedCookie,
  GATE_ENABLED,
  isAuthorized,
  passwordMatches,
  PER_VISITOR_DAILY,
  sessionCookie,
  TOTAL_DAILY,
  usageToday,
} from "./access.js";

loadEnvFile();
const PORT = Number(process.env.PORT ?? 8787);
const DIST = join(process.cwd(), "dist");
const SERVE_STATIC = process.env.ACR_SERVE_STATIC === "1" || process.env.NODE_ENV === "production";
const MAX_BODY = 1_000_000;

const FORMAT_ERROR = "The analysis did not return in the expected format. Try again.";

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
}

/** True when the deployment is behind HTTPS, so the session cookie can be marked Secure. */
function isSecure(req: IncomingMessage): boolean {
  return (req.headers["x-forwarded-proto"] as string | undefined) === "https";
}

async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!GATE_ENABLED) return send(res, 200, { ok: true });
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: "bad_request", message: "The request could not be read." });
  }
  const supplied = typeof body === "object" && body !== null ? (body as { password?: unknown }).password : undefined;
  if (!passwordMatches(supplied)) {
    console.log("login result=refused");
    return send(res, 401, { error: "unauthorized", message: "That password is not right." });
  }
  console.log("login result=accepted");
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "set-cookie": sessionCookie(isSecure(req)),
  });
  res.end(JSON.stringify({ ok: true }));
}

function handleLogout(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "set-cookie": clearedCookie(isSecure(req)),
  });
  res.end(JSON.stringify({ ok: true }));
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
    send(res, 400, { error: "bad_request", message: "The request is missing or has an invalid field." });
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
      const message =
        error.kind === "validation" || error.kind === "invalid_json" || error.kind === "truncated" || error.kind === "no_text"
          ? FORMAT_ERROR
          : error.message;
      send(res, status, { error: error.kind, message, request_id: error.requestId });
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
    send(res, 400, { error: "bad_request", message: "The request is missing or has an invalid field." });
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

async function handleImport(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    send(res, 400, { error: "bad_request", message: "The request could not be read." });
    return;
  }
  const raw = typeof body === "object" && body !== null && typeof (body as { url?: unknown }).url === "string" ? (body as { url: string }).url : "";
  const url = allowedUrl(raw);
  if (!url) {
    send(res, 400, { error: "bad_url", message: "Enter a public http or https address." });
    return;
  }
  const domain = url.hostname;
  try {
    const page = await fetchPage(url);
    const extracted = page.html ? extractReadable(page.html, page.finalUrl) : null;
    console.log(`import domain=${domain} status=${page.status} readable=${extracted ? "yes" : "no"}`);
    if (page.status >= 400 || !extracted) {
      send(res, 422, { error: "not_readable", message: IMPORT_ERROR });
      return;
    }
    send(res, 200, extracted);
  } catch {
    console.log(`import domain=${domain} status=fetch_failed`);
    send(res, 422, { error: "not_readable", message: IMPORT_ERROR });
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

function serveStatic(pathname: string, res: ServerResponse): boolean {
  if (!SERVE_STATIC || !existsSync(join(DIST, "index.html"))) return false;
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, safe);
  if (!file.startsWith(DIST)) return false;
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, "index.html");
  const type = MIME[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, { "content-type": type, "cache-control": file.endsWith("index.html") ? "no-store" : "public, max-age=3600" });
  createReadStream(file).pipe(res);
  return true;
}

/** The endpoints that call the provider and therefore cost money. URL import does not. */
const PAID = new Set(["/api/evaluate", "/api/compare", "/api/public-context"]);

export const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";
  if (url.pathname === "/api/config" && method === "GET") return handleConfig(req, res);
  if (url.pathname === "/api/login" && method === "POST") return handleLogin(req, res);
  if (url.pathname === "/api/logout" && method === "POST") return handleLogout(req, res);

  // Everything below spends the owner's provider credit, so it is gated and capped.
  if (url.pathname.startsWith("/api/") && !isAuthorized(req)) {
    return send(res, 401, { error: "unauthorized", message: "Enter the password to use this tool." });
  }
  if (url.pathname === "/api/usage" && method === "GET") return send(res, 200, usageToday());
  if (PAID.has(url.pathname) && method === "POST") {
    const decision = chargeOne(req);
    if (!decision.allowed) return send(res, 429, { error: "rate_limited", message: decision.message });
  }
  if (url.pathname === "/api/evaluate" && method === "POST") return handleEvaluate(req, res);
  if (url.pathname === "/api/import" && method === "POST") return handleImport(req, res);
  if (url.pathname === "/api/public-context" && method === "POST") return handlePublicContext(req, res);
  if (url.pathname === "/api/compare" && method === "POST") return handleCompare(req, res);
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not_found", message: "No such endpoint." });
  if (method === "GET" && serveStatic(url.pathname, res)) return;
  send(res, 404, { error: "not_found", message: "Not found." });
});

if (process.argv[1] && /server\.(ts|js)$/.test(process.argv[1])) {
  server.listen(PORT, () => {
    const c = getEngineConfig();
    console.log(`Trust Assessment Assistant server on http://localhost:${PORT} (provider ${c.provider}, model ${c.model}${SERVE_STATIC ? ", serving dist/" : ""})`);
    console.log(
      GATE_ENABLED
        ? `Access gate on. Limits: ${PER_VISITOR_DAILY} reviews per visitor per day, ${TOTAL_DAILY} in total.`
        : "Access gate OFF (no ACR_ACCESS_PASSWORD set). Correct on your own computer; never deploy to a public address like this.",
    );
  });
}
