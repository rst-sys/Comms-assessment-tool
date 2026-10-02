import { describe, expect, it } from "vitest";
import { privacyPoints, REVIEW_STEPS, WHAT_YOU_GET } from "../overviewContent.js";
import { getEngineConfig } from "../../engine/config.js";

describe("the Tool Overview's claims", () => {
  it("mentions tester access only where the password screen is on, since only there is the cookie kept", () => {
    expect(privacyPoints("Anthropic", null, false).map(([t]) => t)).not.toContain("Tester access");
    expect(privacyPoints("Anthropic", null, true).map(([t]) => t)).toContain("Tester access");
  });

  it("no longer offers a public search, which is switched off", () => {
    const text = privacyPoints("Anthropic", null, true).flat().join(" ");
    expect(text).not.toMatch(/search for public coverage/);
    expect(text).toContain("Your draft is never searched for or sent to a search engine.");
  });

  it("lists the AI summary and the reviewer checklist among what comes back", () => {
    const leads = WHAT_YOU_GET.map(([lead]) => lead);
    expect(leads).toContain("How an AI assistant might summarize it:");
    expect(leads).toContain("A checklist for your reviewers,");
  });

  it("states the 10-word minimum and the counsel box in the steps", () => {
    const steps = REVIEW_STEPS.flat().join(" ");
    expect(steps).toContain("At least 10 words");
    expect(steps).toContain("whether counsel has limited what you can say");
  });
});

describe("the privacy panel's processing mode", () => {
  it("falls back to a neutral label, so a missing setting never claims zero retention", () => {
    expect(getEngineConfig({}).processingMode).toBe("Anthropic API");
    expect(getEngineConfig({ ACR_PROCESSING_MODE: "Zero-retention API" }).processingMode).toBe("Zero-retention API");
  });
});
