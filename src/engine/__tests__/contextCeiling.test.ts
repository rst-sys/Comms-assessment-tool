import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EvaluationResult } from "../evaluate.js";
import { CONTROL, DEMO_1, DEMO_1_WITH_CONTEXT, DEMO_2, DEMO_3 } from "../fixtures.js";
import { ASSERTED_CEILING, CAPPED_WITHOUT_CONTEXT, computeScore, ceilingWithoutContext } from "../scoring.js";
import type { EvaluationRequest } from "../types.js";
import { applyContextCeiling, contextWasSupplied, validateAnalysis } from "../validate.js";
import { sampleAnalysis } from "./helpers.js";

/**
 * The results page says that without context three dimensions are
 * "restricted to 3.5 out of 5". Until now only the prompt asked for that; the
 * code now enforces it, so the page is always true.
 */
describe("the no-context ceiling", () => {
  const draft = "We are eliminating roles to become leaner and more agile.";
  const high = () =>
    sampleAnalysis({ dimensions: sampleAnalysis().dimensions.map((d) => ({ ...d, score: 4.5 })), findings: [] });

  it("brings the three dimensions down to 3.5 when no context was supplied, and leaves the other seven", () => {
    const { analysis, adjustments } = validateAnalysis(high(), draft, "");
    for (const d of analysis.dimensions) {
      expect(d.score, d.id).toBe(CAPPED_WITHOUT_CONTEXT.includes(d.id) ? ASSERTED_CEILING : 4.5);
    }
    expect(adjustments.capped_dimensions).toBe(3);
  });

  it("never lets a no-context score pass the ceiling the page states", () => {
    const top = sampleAnalysis({ dimensions: sampleAnalysis().dimensions.map((d) => ({ ...d, score: 5 })), findings: [] });
    const { analysis } = validateAnalysis(top, draft, "");
    expect(computeScore(analysis.dimensions)).toBe(ceilingWithoutContext());
  });

  it("does nothing when context was supplied", () => {
    const { analysis, adjustments } = validateAnalysis(high(), draft, "The board approved this on 4 September.");
    expect(analysis.dimensions.every((d) => d.score === 4.5)).toBe(true);
    expect(adjustments.capped_dimensions).toBe(0);
  });

  it("changes none of the seven captured reviews", () => {
    const requests: Record<string, EvaluationRequest> = {
      control: CONTROL.request,
      demo1: DEMO_1.request,
      "demo1-context": DEMO_1_WITH_CONTEXT.request,
      demo2: DEMO_2.request,
      "demo2-run2": DEMO_2.request,
      "demo2-run3": DEMO_2.request,
      demo3: DEMO_3.request,
    };
    const files = readdirSync("fixture-reports").filter((f) => f.endsWith(".json"));
    expect(files).toHaveLength(7);
    for (const file of files) {
      const key = file.replace(/-2026.*$/, "");
      const request = requests[key]!;
      const captured = JSON.parse(readFileSync(`fixture-reports/${file}`, "utf8")) as EvaluationResult;
      // The ceiling rule on its own: these reviews predate later changes to
      // the reply format, so the full validator would refuse them as a whole.
      const { dimensions, capped } = applyContextCeiling(captured.analysis.dimensions, contextWasSupplied(request.context));
      expect(capped, key).toBe(0);
      expect(dimensions.map((d) => d.score), key).toEqual(captured.analysis.dimensions.map((d) => d.score));
      expect(computeScore(dimensions), key).toBe(captured.score);
    }
  });
});
