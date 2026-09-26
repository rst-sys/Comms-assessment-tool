import { describe, expect, it } from "vitest";
import type { Finding } from "../../../engine/types.js";
import { matchesFilters, sortFindings, specialistQuestions, topFindings } from "../model.js";

const finding = (overrides: Partial<Finding>): Finding => ({
  id: "F-001",
  dimension: "accountability_agency",
  severity: "High",
  excerpt: null,
  omission: "x",
  claim_status: null,
  finding: "",
  recommended_action: "",
  fact_validation_needed: false,
  specialist_review_needed: false,
  specialist_review_type: null,
  ...overrides,
});

describe("topFindings", () => {
  it("returns the five highest-severity findings", () => {
    const list = [
      finding({ id: "F-001", severity: "Low" }),
      finding({ id: "F-002", severity: "High" }),
      finding({ id: "F-003", severity: "Moderate" }),
      finding({ id: "F-004", severity: "High" }),
      finding({ id: "F-005", severity: "Moderate" }),
      finding({ id: "F-006", severity: "Low" }),
      finding({ id: "F-007", severity: "High" }),
    ];
    expect(topFindings(list).map((f) => f.id)).toEqual(["F-002", "F-004", "F-007", "F-003", "F-005"]);
  });
});

describe("specialistQuestions", () => {
  it("keeps only questions naming a review function", () => {
    const qs = [
      "Has legal counsel reviewed the selection criteria?",
      "What prevents the same layering from returning?",
      "Are works-council or local consultation obligations implicated?",
      "Has HR confirmed the support package?",
    ];
    expect(specialistQuestions(qs)).toEqual([qs[0], qs[2], qs[3]]);
  });
});

describe("register filters and sort", () => {
  const list = [
    finding({ id: "F-001", severity: "High", dimension: "accountability_agency", specialist_review_needed: true }),
    finding({ id: "F-002", severity: "Moderate", dimension: "clarity_plain_language" }),
    finding({ id: "F-003", severity: "High", dimension: "verification_follow_through" }),
    finding({ id: "F-004", severity: "Low", dimension: "corrective_action_proof" }),
  ];
  it("applies every active filter", () => {
    expect(list.filter((f) => matchesFilters(f, new Set(["High only"]))).map((f) => f.id)).toEqual(["F-001", "F-003"]);
    expect(list.filter((f) => matchesFilters(f, new Set(["Commitments and verification"]))).map((f) => f.id)).toEqual(["F-003", "F-004"]);
    expect(list.filter((f) => matchesFilters(f, new Set(["High only", "Commitments and verification"]))).map((f) => f.id)).toEqual(["F-003"]);
    expect(list.filter((f) => matchesFilters(f, new Set(["Specialist review"]))).map((f) => f.id)).toEqual(["F-001"]);
    expect(list.filter((f) => matchesFilters(f, new Set())).length).toBe(4);
  });
  it("sorts by severity and by dimension in both directions", () => {
    expect(sortFindings(list, { key: "severity", direction: "asc" }).map((f) => f.id)).toEqual(["F-001", "F-003", "F-002", "F-004"]);
    expect(sortFindings(list, { key: "severity", direction: "desc" }).map((f) => f.id)).toEqual(["F-004", "F-002", "F-001", "F-003"]);
    expect(sortFindings(list, { key: "dimension", direction: "asc" }).map((f) => f.dimension)).toEqual([
      "accountability_agency",
      "clarity_plain_language",
      "corrective_action_proof",
      "verification_follow_through",
    ]);
  });
});
