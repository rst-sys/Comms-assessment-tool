import { describe, expect, it } from "vitest";
import type { Finding } from "../../../engine/types.js";
import { matchesFilters, sortFindings } from "../model.js";

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
