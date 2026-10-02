import { describe, expect, it } from "vitest";
import { providerDetail } from "../client.js";

/**
 * A 400 from the provider is almost always a fact the operator needs: a credit
 * balance, an unreachable model, a parameter the model no longer takes. The
 * old code reported the SDK's class name instead, which rendered as the word
 * "Error" and told nobody anything.
 */
describe("providerDetail", () => {
  it("pulls the message out of the provider's parsed body", () => {
    const creditError = {
      status: 400,
      error: { type: "error", error: { type: "invalid_request_error", message: "Your credit balance is too low to access the Anthropic API." } },
    };
    expect(providerDetail(creditError)).toBe("Your credit balance is too low to access the Anthropic API.");
  });

  it("falls back to a flat message, then to the Error's own message", () => {
    expect(providerDetail({ error: { message: "model not found" } })).toBe("model not found");
    expect(providerDetail(new Error("socket hang up"))).toBe("socket hang up");
  });

  it("never returns an empty string, whatever it is handed", () => {
    expect(providerDetail(undefined)).toBe("no detail given");
    expect(providerDetail({})).toBe("no detail given");
    expect(providerDetail(new Error("   "))).toBe("no detail given");
  });

  it("collapses newlines and caps the length, so a log line stays one line", () => {
    expect(providerDetail(new Error("a\n\nb   c"))).toBe("a b c");
    const long = providerDetail(new Error("x".repeat(500)));
    expect(long.length).toBe(301);
    expect(long.endsWith("…")).toBe(true);
  });

  it("does not report the SDK class name, which was the whole bug", () => {
    const apiError = Object.assign(new Error("400 status code (no body)"), { name: "Error", status: 400 });
    expect(providerDetail(apiError)).not.toBe("Error");
  });
});
