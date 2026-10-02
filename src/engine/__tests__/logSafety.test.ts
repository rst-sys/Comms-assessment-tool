import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { providerErrorSummary } from "../client.js";
import { safePointer } from "../safePointer.js";
import { ANALYSIS_SCHEMA } from "../schema.js";
import { parseEvaluationRequest, RequestValidationError } from "../../server/requestSchema.js";
import { DEMO_1 } from "../fixtures.js";

/**
 * The owner's rule for the service log: codes, field names, status numbers
 * and the reference number only. Never draft text, context text, or anything
 * the model or the provider wrote.
 */
describe("what the log may say", () => {
  const secret = "Our Leeds site closes on 4 March";

  it("keeps declared field names and list positions in a field path, and nothing else", () => {
    expect(safePointer("/findings/3/excerpt", ANALYSIS_SCHEMA)).toBe("/findings/3/excerpt");
    expect(safePointer(`/findings/${encodeURIComponent(secret)}/excerpt`, ANALYSIS_SCHEMA)).toBe("/findings/*/excerpt");
    expect(safePointer(`/${secret}`, ANALYSIS_SCHEMA)).toBe("/*");
    expect(safePointer("", ANALYSIS_SCHEMA)).toBe("/");
  });

  it("never logs a request key the browser made up", () => {
    try {
      parseEvaluationRequest({ ...DEMO_1.request, audiences: { [secret]: 1 } });
      expect.unreachable("expected the request to be refused");
    } catch (error) {
      expect(error).toBeInstanceOf(RequestValidationError);
      expect((error as RequestValidationError).path).not.toContain("Leeds");
    }
  });

  it("reduces a provider error to status, code, a fixed label and the provider's reference", () => {
    const error = new Anthropic.APIError(
      400,
      { type: "error", error: { type: "invalid_request_error", message: `Your credit balance is too low. You sent: ${secret}` } },
      "400",
      new Headers({ "request-id": "req_011CabcDEF" }),
    );
    const line = providerErrorSummary(error);
    expect(line).toBe("provider error 400 invalid_request_error (low_credit), provider ref req_011CabcDEF");
    expect(line).not.toContain("Leeds");
  });

  it("drops a code or reference that doesn't look like one", () => {
    const error = new Anthropic.APIError(500, { type: "error", error: { type: secret, message: secret } }, "500", undefined);
    expect(providerErrorSummary(error)).toBe("provider error 500 no_code");
  });
});
