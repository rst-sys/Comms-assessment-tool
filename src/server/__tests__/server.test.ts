import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEMO_1 } from "../../engine/fixtures.js";
import { parseEvaluationRequest, RequestValidationError } from "../requestSchema.js";
import { server } from "../server.js";

describe("parseEvaluationRequest", () => {
  it("accepts a complete request", () => {
    expect(parseEvaluationRequest(DEMO_1.request)).toEqual(DEMO_1.request);
  });
  it("rejects unknown fields, bad enums and a missing draft", () => {
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, extra: 1 })).toThrow(RequestValidationError);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, setting: "Casual" })).toThrow(/setting/);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, draft: "" })).toThrow(/draft/);
    expect(() => parseEvaluationRequest({ ...DEMO_1.request, context: { unknown_key: "x" } })).toThrow(RequestValidationError);
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
    const res = await fetch(`${base}/api/evaluate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft: "secret text", setting: "Nope" }) });
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).not.toContain("secret text");
    expect(JSON.parse(text).error).toBe("bad_request");
  });

  it("rejects a redraft request whose analysis is malformed, without echoing it", async () => {
    const res = await fetch(`${base}/api/redraft`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request: DEMO_1.request, analysis: { schema_version: "1.0", secret: "do not echo" } }) });
    expect(res.status).toBe(400);
    expect(await res.text()).not.toContain("do not echo");
  });

  it("refuses a private import address", async () => {
    const res = await fetch(`${base}/api/import`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "http://127.0.0.1/" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 JSON for unknown api paths", async () => {
    const res = await fetch(`${base}/api/nothing`);
    expect(res.status).toBe(404);
  });
});
