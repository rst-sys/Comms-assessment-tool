import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EvaluationResult } from "../evaluate.js";
import { DEMO_1 } from "../fixtures.js";
import { buildSavedReview, parseSavedReview, savedReviewFilename, SavedReviewError, settingsDrift } from "../savedReview.js";
import type { AudienceDocument } from "../types.js";
import { APOLOGY_PROTOCOL } from "../protocols.js";

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

const doc: AudienceDocument = {
  kind: "supporting",
  title: "Employee FAQ",
  description: "Questions on selection",
  delivery: "Linked from the email",
  reach: "all",
  same_time: true,
  text: "CONFIDENTIAL FAQ CONTENTS that must never be written to the file.",
};

describe("buildSavedReview", () => {
  const result = load("demo1");
  const request = { ...DEMO_1.request, audience_documents: [doc], context: { known_facts: "The executive team decided." } };

  it("never writes the whole draft or a document's contents into the file", () => {
    const saved = buildSavedReview(result, request);
    const text = JSON.stringify(saved);
    // The draft is never stored as a field, and no document text is stored at all.
    expect(text).not.toContain(request.draft);
    expect(Object.keys(saved)).not.toContain("draft");
    expect(text).not.toContain("CONFIDENTIAL FAQ CONTENTS");
    expect(saved.documents.every((d) => !("text" in d))).toBe(true);
    expect(saved.documents).toEqual([{ kind: "supporting", title: "Employee FAQ", description: "Questions on selection", delivery: "Linked from the email", reach: "all", same_time: true }]);
  });

  it("keeps the score, settings, context and findings so the next review is like-for-like", () => {
    const saved = buildSavedReview(result, request);
    expect(saved.score).toBe(result.score);
    expect(saved.settings.communication_type).toBe("Layoff or restructuring");
    expect(saved.settings.heightened_review).toBe(true);
    expect(saved.context.known_facts).toBe("The executive team decided.");
    expect(saved.dimensions).toHaveLength(10);
    expect(saved.findings.length).toBe(result.analysis.findings.length);
    expect(saved.findings[0]!.recommended_action.length).toBeGreaterThan(0);
  });

  it("keeps the pulled-out quotations by default and blanks those fields on request", () => {
    const withQuotes = buildSavedReview(result, request);
    expect(withQuotes.excerpts_included).toBe(true);
    expect(withQuotes.findings.some((f) => f.excerpt !== null)).toBe(true);
    expect(withQuotes.agency_scan.some((s) => s.phrase !== null)).toBe(true);

    const without = buildSavedReview(result, request, { includeExcerpts: false });
    expect(without.excerpts_included).toBe(false);
    expect(without.findings.every((f) => f.excerpt === null)).toBe(true);
    expect(without.agency_scan.every((s) => s.phrase === null)).toBe(true);
    // Honest limit: the review's own prose still quotes the draft, so this is a
    // reduction, not a guarantee. The whole draft is still never present.
    expect(JSON.stringify(without)).not.toContain(request.draft);
  });

  it("round-trips through the file format and names the file by type and date", () => {
    const saved = buildSavedReview(result, request, { now: new Date("2026-09-20T09:00:00Z") });
    const reloaded = parseSavedReview(JSON.stringify(saved));
    expect(reloaded.score).toBe(saved.score);
    expect(reloaded.findings).toHaveLength(saved.findings.length);
    expect(savedReviewFilename(saved)).toBe("trust-review-layoff-or-restructuring-2026-09-20.json");
  });
});

describe("parseSavedReview", () => {
  it("rejects a file that is not a saved review, and one from a newer version", () => {
    expect(() => parseSavedReview("not json")).toThrow(SavedReviewError);
    expect(() => parseSavedReview(JSON.stringify({ hello: "world" }))).toThrow(SavedReviewError);
    const future = { ...buildSavedReview(load("demo1"), DEMO_1.request), format_version: 99 };
    expect(() => parseSavedReview(JSON.stringify(future))).toThrow(/newer version/);
  });
});

describe("settingsDrift", () => {
  const saved = buildSavedReview(load("demo1"), DEMO_1.request);
  it("is empty when the settings match", () => {
    expect(settingsDrift(saved.settings, DEMO_1.request)).toEqual([]);
  });
  it("names the settings that changed", () => {
    expect(settingsDrift(saved.settings, { ...DEMO_1.request, primary_audience: "Media", heightened_review: false })).toEqual([
      "Primary audience",
      "Heightened review",
    ]);
  });
});

describe("a saved file from before the protocol section was removed", () => {
  it("still parses, ignoring the protocol_review key it carries", () => {
    const old = JSON.parse(JSON.stringify(buildSavedReview(load("demo1"), DEMO_1.request))) as Record<string, unknown>;
    old.protocol_review = { protocol: APOLOGY_PROTOCOL.name, source: APOLOGY_PROTOCOL.source, elements: [] };
    const parsed = parseSavedReview(JSON.stringify(old));
    expect(parsed.score).toBe((old as { score: number }).score);
    expect(parsed).not.toHaveProperty("protocol_review.elements.0");
  });
});
