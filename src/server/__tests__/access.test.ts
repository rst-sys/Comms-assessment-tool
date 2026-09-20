import { describe, expect, it, beforeEach } from "vitest";
import type { IncomingMessage } from "node:http";
import {
  accessToken,
  chargeOne,
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

  it("reads the forwarded address a host puts in front, taking the original client", () => {
    const behindProxy = req({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" }, "10.0.0.1");
    expect(visitorKey(behindProxy)).toBe(visitorKey(req({}, "203.0.113.7")));
  });
});

describe("the access token", () => {
  it("is derived from the password and reveals nothing about it", () => {
    expect(accessToken("copper-lantern-marsh")).toBe(accessToken("copper-lantern-marsh"));
    expect(accessToken("copper-lantern-marsh")).not.toBe(accessToken("copper-lantern-marsX"));
    expect(accessToken("copper-lantern-marsh")).not.toContain("copper");
  });
});
