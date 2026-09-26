/**
 * The gate, exercised against a real running server. This is the property the
 * whole hosted deployment rests on: without the password, nothing that spends
 * the owner's provider credit can be reached.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const PASSWORD = "copper-lantern-marsh";

let server: Server;
let base: string;

beforeAll(async () => {
  vi.stubEnv("ACR_ACCESS_PASSWORD", PASSWORD);
  vi.stubEnv("ACR_API_KEY", "sk-ant-not-a-real-key-for-tests");
  vi.resetModules();
  ({ server } = await import("../server.js"));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  vi.unstubAllEnvs();
});

const evaluateBody = JSON.stringify({ draft: "x".repeat(200) });

describe("the access gate on a running server", () => {
  it("refuses every paid endpoint without the password", async () => {
    for (const path of ["/api/evaluate", "/api/compare", "/api/public-context"]) {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: evaluateBody,
      });
      expect(res.status, path).toBe(401);
      expect((await res.json()).message).toMatch(/Enter the password/);
    }
  });

  it("serves the privacy config unauthenticated, so the app can show the password screen", async () => {
    const res = await fetch(`${base}/api/config`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.gate_enabled).toBe(true);
    expect(body.signed_in).toBe(false);
    // The password itself is never sent to the browser.
    expect(JSON.stringify(body)).not.toContain(PASSWORD);
  });

  it("refuses the wrong password and returns no cookie", async () => {
    const res = await fetch(`${base}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "guess" }),
    });
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("accepts the right password, and the cookie then opens the gate", async () => {
    const login = await fetch(`${base}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: PASSWORD }),
    });
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");

    const jar = cookie!.split(";")[0]!;
    const config = await fetch(`${base}/api/config`, { headers: { cookie: jar } });
    expect((await config.json()).signed_in).toBe(true);

    // Past the gate, the request reaches the engine and fails there on the fake
    // key — which is the proof it was no longer blocked at the door.
    const res = await fetch(`${base}/api/evaluate`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: evaluateBody,
    });
    expect(res.status).not.toBe(401);
  });
});
