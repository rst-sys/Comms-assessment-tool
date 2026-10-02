import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEMO_1 } from "../../engine/fixtures.js";
import { parseEvaluationRequest, RequestValidationError } from "../requestSchema.js";
import { MIN_DRAFT_WORDS } from "../../engine/limits.js";
import { server } from "../server.js";
import { FEATURES } from "../../app/features.js";
import { connect } from "node:net";
import { spawnSync } from "node:child_process";

describe("parseEvaluationRequest", () => {
  it("accepts a complete request", () => {
    expect(parseEvaluationRequest(DEMO_1.request)).toEqual(DEMO_1.request);
  });
  it("accepts audience documents within limits and rejects too many, oversized or unknown-kind ones", () => {
    const doc = { kind: "prior_communication", title: "Earlier note", description: "d", delivery: "emailed last week", reach: "all", same_time: false, text: "text" };
    expect(parseEvaluationRequest({ ...DEMO_1.request, audience_documents: [doc] }).audience_documents).toHaveLength(1);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, audience_documents: Array(9).fill(doc) })).toThrow(RequestValidationError);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, audience_documents: [{ ...doc, text: "x".repeat(20_001) }] })).toThrow(RequestValidationError);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, audience_documents: [{ ...doc, kind: "rumor" }] })).toThrow(RequestValidationError);
  });

  it("rejects unknown fields, bad enums and a missing draft", () => {
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, extra: 1 })).toThrow(RequestValidationError);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, situation: "Casual" })).toThrow(/situation/);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, draft: "" })).toThrow(/draft/);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, context: { unknown_key: "x" } as unknown as string })).toThrow(RequestValidationError);
  });

  it("requires the counsel answer as true or false, like the other intake answers", () => {
    expect(parseEvaluationRequest({ ...DEMO_1.request, counsel_limited: true }).counsel_limited).toBe(true);
    const { counsel_limited: _unused, ...without } = DEMO_1.request;
    // A missing field is reported at the top level, as for every required answer.
    expect(() => parseEvaluationRequest(without)).toThrow(RequestValidationError);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, counsel_limited: "yes" })).toThrow(/counsel_limited/);
  });

  it("refuses a draft under the word floor, whatever the browser allowed", () => {
    // The schema counts characters, so this is the only thing standing
    // between a hand-made request and a provider call on nine words.
    const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
    expect(MIN_DRAFT_WORDS).toBe(10);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, draft: words(1) })).toThrow(/draft/);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, draft: words(9) })).toThrow(RequestValidationError);
    // Whitespace is not words: a padded short draft is still short.
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, draft: `   ${words(9)}  \n\n ` })).toThrow(/draft/);
    // Ten is allowed, and so is the band the intake only warns about.
    expect(parseEvaluationRequest({ ...DEMO_1.request, draft: words(10) }).draft).toBe(words(10));
    expect(parseEvaluationRequest({ ...DEMO_1.request, draft: words(30) }).draft).toBe(words(30));
  });
});

describe("server endpoints", () => {
  let base = "";
  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  });
  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("serves the provider and model from config", async () => {
    const res = await fetch(`${base}/api/config`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { provider: string; model: string; processing_mode: string; training_term: string };
    expect(body.provider).toBe("Anthropic");
    expect(body.model.length).toBeGreaterThan(0);
    expect(body.processing_mode.length).toBeGreaterThan(0);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects an invalid evaluation request with a plain message and no echo of the body", async () => {
    const res = await fetch(`${base}/api/evaluate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft: "secret text", situation: "Nope" }) });
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).not.toContain("secret text");
    expect(JSON.parse(text).error).toBe("bad_request");
  });

  it("refuses the public search and the comparison while their features are switched off", async () => {
    expect(FEATURES.publicContextSearch).toBe(false);
    for (const path of ["/api/public-context", "/api/compare"]) {
      const res = await fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: "a real topic" }) });
      expect(res.status, path).toBe(404);
      const body = await res.json();
      expect(body.error, path).toBe("switched_off");
      expect(body.message, path).toBe("This feature is switched off for this round of testing.");
    }
  });

  it("rejects an empty public-context query without calling the provider, when the search is switched on", async () => {
    FEATURES.publicContextSearch = true;
    try {
      const res = await fetch(`${base}/api/public-context`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: "ab" }) });
      expect(res.status).toBe(400);
    } finally {
      FEATURES.publicContextSearch = false;
    }
  });

  it("survives a malformed address: replies bad request and keeps serving", async () => {
    // This one request used to crash the whole process (an unreadable URL threw
    // outside any handler). Sent raw, because fetch refuses to build it.
    const reply = await new Promise<string>((resolve, reject) => {
      const socket = connect(Number(new URL(base).port), "127.0.0.1", () => socket.write("GET http://[ HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n"));
      let data = "";
      socket.on("data", (chunk) => (data += chunk.toString()));
      socket.on("end", () => resolve(data));
      socket.on("error", reject);
    });
    expect(reply.split("\r\n")[0]).toMatch(/^HTTP\/1\.1 400/);
    expect(reply).toContain('"bad_request"');
    const res = await fetch(`${base}/api/config`);
    expect(res.status).toBe(200);
  });

  it("sends the security headers on every reply, and HSTS only over HTTPS", async () => {
    const plain = await fetch(`${base}/api/config`);
    expect(plain.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(plain.headers.get("x-frame-options")).toBe("DENY");
    expect(plain.headers.get("x-content-type-options")).toBe("nosniff");
    expect(plain.headers.get("strict-transport-security")).toBeNull();
    const secure = await fetch(`${base}/api/nothing`, { headers: { "x-forwarded-proto": "https" } });
    expect(secure.headers.get("strict-transport-security")).toContain("max-age=");
  });

  it("returns 404 JSON for the removed import endpoint", async () => {
    const res = await fetch(`${base}/api/import`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "https://example.com/" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 JSON for unknown api paths", async () => {
    const res = await fetch(`${base}/api/nothing`);
    expect(res.status).toBe(404);
  });
});

describe("starting with a mistyped setting", () => {
  it("stops at start with a plain message, instead of crashing on every health check", () => {
    const run = spawnSync(process.execPath, ["--import", "tsx", "src/server/server.ts"], {
      env: { ...process.env, ACR_SPEED: "fastest", PORT: "0" },
      encoding: "utf8",
      timeout: 20_000,
    });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("Cannot start: ACR_SPEED must be one of standard, fast");
  });
});
