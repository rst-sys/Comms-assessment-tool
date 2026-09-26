import { describe, expect, it } from "vitest";
import { MAX_FINDINGS, MAX_QUESTIONS, MIN_QUESTIONS } from "../limits.js";
import { normalizeAnalysis } from "../normalize.js";
import { buildSystemBlocks } from "../prompt.js";
import { DEMO_1 } from "../fixtures.js";
import { validateAnalysis } from "../validate.js";
import { SAMPLE_DRAFT, sampleAnalysis, sampleFinding } from "./helpers.js";

/**
 * The output budget (step 3 of the protocol architecture).
 *
 * A protocol tells the engine what to look for. It must never be able to make
 * the engine write more, because output is what costs the reader time: roughly
 * a second for every forty words on this build. Thirteen protocols with no
 * ceiling would mean a slower wait and a longer page with every one added.
 */
describe("the output budget", () => {
  it("trims findings past the cap, keeping the most material and reporting the trim", () => {
    const many = sampleAnalysis({
      findings: Array.from({ length: MAX_FINDINGS + 4 }, (_, i) =>
        sampleFinding({
          id: `F-${String(i + 1).padStart(3, "0")}`,
          // Ordered by materiality already, so the trim takes the least material.
          severity: i < 3 ? "High" : i < 8 ? "Moderate" : "Low",
          excerpt: null,
          omission: `Gap number ${i + 1}.`,
        }),
      ),
    });

    const { analysis, adjustments } = validateAnalysis(many, SAMPLE_DRAFT, "");
    expect(analysis.findings).toHaveLength(MAX_FINDINGS);
    expect(adjustments.trimmed_findings).toBe(4);
    expect(analysis.findings.map((f) => f.id)).toEqual(
      Array.from({ length: MAX_FINDINGS }, (_, i) => `F-${String(i + 1).padStart(3, "0")}`),
    );
    // Every High survived; only the tail went.
    expect(analysis.findings.filter((f) => f.severity === "High")).toHaveLength(3);
  });

  it("leaves a review under the cap alone", () => {
    const { analysis, adjustments } = validateAnalysis(sampleAnalysis(), SAMPLE_DRAFT, "");
    expect(analysis.findings).toHaveLength(1);
    expect(adjustments.trimmed_findings).toBe(0);
  });

  it("names no specialist review that a trimmed finding took with it", () => {
    const many = sampleAnalysis({
      findings: Array.from({ length: MAX_FINDINGS + 1 }, (_, i) =>
        sampleFinding({
          id: `F-${String(i + 1).padStart(3, "0")}`,
          excerpt: null,
          omission: `Gap ${i + 1}.`,
          // Only the finding that gets trimmed asks for this review.
          specialist_review_needed: true,
          specialist_review_type: i === MAX_FINDINGS ? "Investor relations" : "HR",
        }),
      ),
      specialist_review_summary: [],
    });

    const { analysis } = validateAnalysis(many, SAMPLE_DRAFT, "");
    expect(analysis.specialist_review_summary).not.toContain("Investor relations");
    expect(analysis.specialist_review_summary).toContain("HR");
  });

  it("caps questions in the normalizer, whatever the model returns", () => {
    const out = normalizeAnalysis({
      questions_before_publication: Array.from({ length: 20 }, (_, i) => `Question ${i + 1}?`),
    }) as { questions_before_publication: string[] };
    expect(out.questions_before_publication).toHaveLength(MAX_QUESTIONS);
    expect(out.questions_before_publication[0]).toBe("Question 1?");
  });

  it("asks for the same numbers in the prompt that the code enforces", () => {
    const blocks = buildSystemBlocks(DEMO_1.request).map((b) => b.text).join("\n");
    expect(blocks).toContain(`findings contains at most ${MAX_FINDINGS} entries`);
    expect(blocks).toContain(`at most ${MAX_QUESTIONS} questions`);
    expect(blocks).toContain("Every one of them is about THIS draft");
    expect(blocks).toContain(`Aim for ${MIN_QUESTIONS}; if the draft is short, fewer is fine.`);
    expect(blocks).not.toContain("not obligations");

    // There is no floor any more, and the reason is worth keeping written down.
    //
    // The floor was added because a sparing rule elsewhere pulled reviews
    // under it; four cyber reviews died that way. It then collided with the
    // instruction to leave the checklist's standard questions alone: on a
    // short, formulaic leadership announcement the model could satisfy one
    // only by breaking the other, and returned nothing. Three live reviews
    // died that way, each after two full attempts.
    //
    // So the floor is an aim, the suppression is a preference, and an empty
    // list is no longer fatal. All three have to hold together, or the next
    // change reintroduces the collision.
    expect(blocks).not.toContain("is a floor, not a target");
    expect(blocks).not.toContain("do not produce questions of that kind");
    expect(blocks).not.toContain(`at least ${MIN_QUESTIONS}`);
    expect(blocks).toContain("it never raises the ceiling");
  });
});
