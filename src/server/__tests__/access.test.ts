import { describe, expect, it, beforeEach } from "vitest";
import type { IncomingMessage } from "node:http";
import { createHash } from "node:crypto";
import {
  accessToken,
  clearLoginFailures,
  clientAddress,
  LOGIN_ATTEMPTS,
  LOGIN_WINDOW_MS,
  loginAllowed,
  recordLoginFailure,
  chargeOne,
  refundOne,
  OVER_TOTAL_LIMIT,
  OVER_VISITOR_LIMIT,
  resetCounters,
  usageToday,
  visitorKey,
} from "../access.js";

/** A request with the given headers and source address. */
function req(headers: Record<string, string> = {}, address = "10.0.0.1"): IncomingMessage {
  return { headers, socket: { remoteAddress: address } } as unknown as IncomingMessage;
}

beforeEach(resetCounters);

describe("the daily spend brakes", () => {
  it("counts each paid call against the visitor's own ceiling", () => {
    const visitor = req({}, "10.0.0.1");
    for (let i = 0; i < 10; i += 1) expect(chargeOne(visitor).allowed).toBe(true);
    const refused = chargeOne(visitor);
    expect(refused.allowed).toBe(false);
    expect(refused.message).toBe(OVER_VISITOR_LIMIT);
  });

  it("does not let one visitor's use block another's", () => {
    const a = req({}, "10.0.0.1");
    for (let i = 0; i < 10; i += 1) chargeOne(a);
    expect(chargeOne(a).allowed).toBe(false);
    expect(chargeOne(req({}, "10.0.0.2")).allowed).toBe(true);
  });

  it("stops everyone at the total ceiling, which is what protects the owner", () => {
    // Six visitors of ten each reaches the total of sixty.
    for (let v = 0; v < 6; v += 1) {
      for (let i = 0; i < 10; i += 1) expect(chargeOne(req({}, `10.0.0.${v}`)).allowed).toBe(true);
    }
    const refused = chargeOne(req({}, "10.0.0.99"));
    expect(refused.allowed).toBe(false);
    expect(refused.message).toBe(OVER_TOTAL_LIMIT);
    expect(usageToday().used).toBe(60);
  });

  it("starts the count again on a new day", () => {
    const visitor = req({}, "10.0.0.1");
    const monday = new Date("2026-09-21T23:00:00Z");
    for (let i = 0; i < 10; i += 1) chargeOne(visitor, monday);
    expect(chargeOne(visitor, monday).allowed).toBe(false);
    expect(chargeOne(visitor, new Date("2026-09-22T01:00:00Z")).allowed).toBe(true);
  });

  it("does not charge a refused call", () => {
    const visitor = req({}, "10.0.0.1");
    for (let i = 0; i < 10; i += 1) chargeOne(visitor);
    chargeOne(visitor);
    chargeOne(visitor);
    expect(usageToday().used).toBe(10);
  });
});

describe("the visitor label", () => {
  it("is stable per address, different between addresses, and not the address itself", () => {
    expect(visitorKey(req({}, "10.0.0.1"))).toBe(visitorKey(req({}, "10.0.0.1")));
    expect(visitorKey(req({}, "10.0.0.1"))).not.toBe(visitorKey(req({}, "10.0.0.2")));
    expect(visitorKey(req({}, "10.0.0.1"))).not.toContain("10.0.0.1");
  });

  it("ignores X-Forwarded-For, which a visitor can write themselves", () => {
    // Render adds to whatever the browser sends rather than replacing it, so a
    // new made-up first entry on every request used to be a new daily allowance.
    const spoofed = req({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" }, "10.0.0.1");
    expect(visitorKey(spoofed)).toBe(visitorKey(req({}, "10.0.0.1")));
    expect(clientAddress(req({ "x-forwarded-for": "1.2.3.4" }, "10.0.0.1"), { RENDER: "true" })).toBe("10.0.0.1");
  });

  it("on Render, reads the address Cloudflare saw, and nowhere else trusts that header", () => {
    const viaCloudflare = req({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "9.9.9.9" }, "10.0.0.1");
    expect(clientAddress(viaCloudflare, { RENDER: "true" })).toBe("203.0.113.7");
    expect(clientAddress(req({ "true-client-ip": "203.0.113.8" }, "10.0.0.1"), { RENDER: "true" })).toBe("203.0.113.8");
    // Off Render nothing sets that header, so a browser could; the connection is used.
    expect(clientAddress(viaCloudflare, {})).toBe("10.0.0.1");
  });
});

describe("the access token", () => {
  it("is not a quick hash of the password, so a copied cookie does not give the password away", () => {
    const quick = createHash("sha256").update("acr:copper-lantern-marsh").digest("hex");
    expect(accessToken("copper-lantern-marsh")).not.toBe(quick);
    expect(accessToken("copper-lantern-marsh")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is derived from the password and reveals nothing about it", () => {
    expect(accessToken("copper-lantern-marsh")).toBe(accessToken("copper-lantern-marsh"));
    expect(accessToken("copper-lantern-marsh")).not.toBe(accessToken("copper-lantern-marsX"));
    expect(accessToken("copper-lantern-marsh")).not.toContain("copper");
  });
});

describe("a failed review gives its charge back", () => {
  it("does not spend a slot on a review that never produced anything", () => {
    const visitor = req();
    chargeOne(visitor);
    chargeOne(visitor);
    expect(usageToday().used).toBe(2);

    refundOne(visitor);
    expect(usageToday().used).toBe(1);
  });

  it("lets a visitor keep trying after a run of failures", () => {
    const visitor = req();
    // Every attempt fails and is refunded, so the allowance is never eaten.
    for (let i = 0; i < 25; i += 1) {
      expect(chargeOne(visitor).allowed, `attempt ${i + 1}`).toBe(true);
      refundOne(visitor);
    }
    expect(usageToday().used).toBe(0);
    expect(chargeOne(visitor).allowed).toBe(true);
  });

  it("never refunds below zero", () => {
    const visitor = req();
    refundOne(visitor);
    refundOne(visitor);
    expect(usageToday().used).toBe(0);
  });

  it("refunds the visitor who was charged, not another", () => {
    const a = req({}, "10.0.0.1");
    const b = req({}, "10.0.0.2");
    chargeOne(a);
    chargeOne(b);
    refundOne(a);
    expect(usageToday().used).toBe(1);
    // b still holds its charge, so its own allowance is one lower than a's.
    for (let i = 0; i < 9; i += 1) expect(chargeOne(b).allowed).toBe(true);
    expect(chargeOne(b).allowed).toBe(false);
  });
});

describe("wrong-password pauses", () => {
  it("allows a few mistakes, pauses after five in a minute, and lifts the pause as the minute passes", () => {
    const visitor = req({}, "10.0.0.9");
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_ATTEMPTS; i += 1) {
      expect(loginAllowed(visitor, t0 + i)).toBe(true);
      recordLoginFailure(visitor, t0 + i);
    }
    expect(loginAllowed(visitor, t0 + 10)).toBe(false);
    // Another visitor is not affected.
    expect(loginAllowed(req({}, "10.0.0.10"), t0 + 10)).toBe(true);
    expect(loginAllowed(visitor, t0 + LOGIN_WINDOW_MS + 1)).toBe(true);
  });

  it("forgets the mistakes after a correct password", () => {
    const visitor = req({}, "10.0.0.11");
    for (let i = 0; i < LOGIN_ATTEMPTS; i += 1) recordLoginFailure(visitor, 5_000 + i);
    expect(loginAllowed(visitor, 5_010)).toBe(false);
    clearLoginFailures(visitor);
    expect(loginAllowed(visitor, 5_011)).toBe(true);
  });
});
