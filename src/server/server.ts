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
import { allowedUrl, extractReadable, fetchPage, IMPORT_ERROR } from "./import.js";
import { parseEvaluationRequest, RequestValidationError } from "./requestSchema.js";

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
      console.log(`[${error.requestId}] evaluate failed: ${error.kind}`);
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

function handleConfig(res: ServerResponse): void {
  const c = getEngineConfig();
  send(res, 200, { provider: c.provider, model: c.model, processing_mode: c.processingMode, training_term: c.trainingTerm });
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

export const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";
  if (url.pathname === "/api/config" && method === "GET") return handleConfig(res);
  if (url.pathname === "/api/evaluate" && method === "POST") return handleEvaluate(req, res);
  if (url.pathname === "/api/import" && method === "POST") return handleImport(req, res);
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not_found", message: "No such endpoint." });
  if (method === "GET" && serveStatic(url.pathname, res)) return;
  send(res, 404, { error: "not_found", message: "Not found." });
});

if (process.argv[1] && /server\.(ts|js)$/.test(process.argv[1])) {
  server.listen(PORT, () => {
    const c = getEngineConfig();
    console.log(`Accountable Communications Review server on http://localhost:${PORT} (provider ${c.provider}, model ${c.model}${SERVE_STATIC ? ", serving dist/" : ""})`);
  });
}
