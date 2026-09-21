import { describe, expect, it } from "vitest";
import { canEvaluate, EMPTY_FIELDS, heightenedByDefault, showHighRiskWarning, wordCount, type DraftFields } from "../rules.js";

const full: DraftFields = {
  communication_event: "None of these",
  communication_format: "Employee announcement",
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
  it("is on for the listed events and settings", () => {
    expect(heightenedByDefault("Workforce reduction or major reorganization", "")).toBe(true);
    expect(heightenedByDefault("Cyberattack or data incident", "Routine")).toBe(true);
    expect(heightenedByDefault("None of these", "Crisis")).toBe(true);
    expect(heightenedByDefault("None of these", "Material corporate event")).toBe(true);
    expect(heightenedByDefault("None of these", "Routine")).toBe(false);
    expect(heightenedByDefault("", "")).toBe(false);
  });

  it("is off for a high-stakes event that carries no legal or financial exposure", () => {
    // Every event is serious; the stricter thresholds are for the ones where a
    // misstatement has consequence beyond the reading.
    expect(heightenedByDefault("CEO or senior-leader departure", "Routine")).toBe(false);
    expect(heightenedByDefault("Supply-chain disruption affecting customers or employees", "Routine")).toBe(false);
  });
});

describe("showHighRiskWarning", () => {
  it("shows for the listed events and markets", () => {
    expect(showHighRiskWarning("Poor financial results, site closure or strategic retreat", "United States")).toBe(true);
    expect(showHighRiskWarning("None of these", "Germany")).toBe(true);
    expect(showHighRiskWarning("None of these", "European Union")).toBe(true);
    expect(showHighRiskWarning("None of these", "United States")).toBe(false);
  });
});

describe("canEvaluate", () => {
  it("requires every field and a draft in range", () => {
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
