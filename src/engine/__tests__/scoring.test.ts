import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_DRAFT_ONLY,
  CONFIDENCE_WITH_CONTEXT,
  computeScore,
  confidenceLabel,
  dimensionTone,
  DIMENSION_WEIGHTS,
  isValidDimensionScore,
  rankFindings,
  scoreBand,
  WEIGHT_TOTAL,
} from "../scoring.js";
import { DIMENSION_IDS } from "../types.js";

describe("scoring", () => {
  it("weights sum to 100", () => {
    expect(WEIGHT_TOTAL).toBe(100);
    expect(Object.keys(DIMENSION_WEIGHTS).sort()).toEqual([...DIMENSION_IDS].sort());
  });

  it("scores all fives as 100 and all zeros as 0", () => {
    expect(computeScore(DIMENSION_IDS.map((id) => ({ id, score: 5 })))).toBe(100);
    expect(computeScore(DIMENSION_IDS.map((id) => ({ id, score: 0 })))).toBe(0);
  });

  it("applies weights and rounds to the nearest whole number", () => {
    // accountability_agency 4.5/5 * 18 = 16.2; everything else 0.
    const dims = DIMENSION_IDS.map((id) => ({ id, score: id === "accountability_agency" ? 4.5 : 0 }));
    expect(computeScore(dims)).toBe(16);
    // All 2.5 → exactly 50.
    expect(computeScore(DIMENSION_IDS.map((id) => ({ id, score: 2.5 })))).toBe(50);
  });

  it("maps scores to bands at the boundaries", () => {
    expect(scoreBand(100)).toBe("Strongly accountable");
    expect(scoreBand(90)).toBe("Strongly accountable");
    expect(scoreBand(89)).toBe("Credible, with targeted improvements");
    expect(scoreBand(75)).toBe("Credible, with targeted improvements");
    expect(scoreBand(74)).toBe("Material accountability and trust gaps");
    expect(scoreBand(60)).toBe("Material accountability and trust gaps");
    expect(scoreBand(59)).toBe("High risk of evasiveness or stakeholder mistrust");
    expect(scoreBand(40)).toBe("High risk of evasiveness or stakeholder mistrust");
    expect(scoreBand(39)).toBe("Serious clarity, accountability, or ethical-risk concerns");
    expect(scoreBand(0)).toBe("Serious clarity, accountability, or ethical-risk concerns");
  });

  it("maps dimension scores to the color scale", () => {
    expect(dimensionTone(5)).toBe("strong");
    expect(dimensionTone(4)).toBe("strong");
    expect(dimensionTone(3.5)).toBe("sound");
    expect(dimensionTone(3)).toBe("sound");
    expect(dimensionTone(2.5)).toBe("caution");
    expect(dimensionTone(2)).toBe("caution");
    expect(dimensionTone(1.5)).toBe("material");
    expect(dimensionTone(0)).toBe("material");
  });

  it("produces the confidence label from the context flag", () => {
    expect(confidenceLabel(true)).toBe(CONFIDENCE_WITH_CONTEXT);
    expect(confidenceLabel(false)).toBe(CONFIDENCE_DRAFT_ONLY);
  });

  it("accepts only 0.5 steps in range", () => {
    expect(isValidDimensionScore(0)).toBe(true);
    expect(isValidDimensionScore(2.5)).toBe(true);
    expect(isValidDimensionScore(5)).toBe(true);
    expect(isValidDimensionScore(2.25)).toBe(false);
    expect(isValidDimensionScore(5.5)).toBe(false);
    expect(isValidDimensionScore(-0.5)).toBe(false);
    expect(isValidDimensionScore(Number.NaN)).toBe(false);
  });

  it("ranks findings by severity, then id", () => {
    const ranked = rankFindings([
      { id: "F-003", severity: "Low" },
      { id: "F-002", severity: "High" },
      { id: "F-001", severity: "Moderate" },
      { id: "F-004", severity: "High" },
    ]);
    expect(ranked.map((f) => f.id)).toEqual(["F-002", "F-004", "F-001", "F-003"]);
  });
});
