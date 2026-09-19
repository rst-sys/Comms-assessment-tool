import { describe, expect, it } from "vitest";
import { canEvaluate, EMPTY_FIELDS, heightenedByDefault, showHighRiskWarning, wordCount, type DraftFields } from "../rules.js";

const full: DraftFields = {
  communication_type: "Employee announcement",
  primary_audience: "All employees",
  setting: "Routine",
  market: "United States",
  goal: "Inform",
  audience_scope: "Internal",
};
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

describe("wordCount", () => {
  it("counts whitespace-separated words", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount("one two\nthree")).toBe(3);
  });
});

describe("heightenedByDefault", () => {
  it("is on for the listed types and settings", () => {
    expect(heightenedByDefault("Layoff or restructuring", "")).toBe(true);
    expect(heightenedByDefault("Apology", "Routine")).toBe(true);
    expect(heightenedByDefault("Employee announcement", "Crisis")).toBe(true);
    expect(heightenedByDefault("Employee announcement", "Material corporate event")).toBe(true);
    expect(heightenedByDefault("Employee announcement", "Routine")).toBe(false);
    expect(heightenedByDefault("", "")).toBe(false);
  });
});

describe("showHighRiskWarning", () => {
  it("shows for the listed types and markets", () => {
    expect(showHighRiskWarning("Investor communication", "United States")).toBe(true);
    expect(showHighRiskWarning("Employee announcement", "Germany")).toBe(true);
    expect(showHighRiskWarning("Employee announcement", "European Union")).toBe(true);
    expect(showHighRiskWarning("Apology", "United States")).toBe(false);
  });
});

describe("canEvaluate", () => {
  it("requires all six fields and a draft in range", () => {
    expect(canEvaluate(words(100), full, false)).toBe(true);
    expect(canEvaluate(words(49), full, false)).toBe(false);
    expect(canEvaluate(words(5001), full, false)).toBe(false);
    expect(canEvaluate(words(100), { ...full, goal: "" }, false)).toBe(false);
    expect(canEvaluate(words(100), EMPTY_FIELDS, false)).toBe(false);
  });
  it("lets a demo draft through under the minimum but not when empty", () => {
    expect(canEvaluate(words(30), full, true)).toBe(true);
    expect(canEvaluate("", full, true)).toBe(false);
  });
});
