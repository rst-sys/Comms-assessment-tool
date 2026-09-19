/**
 * Scoring rules (PROMPT.md Section 7). The application computes the
 * Accountable Communication Score; the model never sees or returns it.
 */
import type { Dimension, DimensionId, Finding, Severity } from "./types.js";

export const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  accountability_agency: 18,
  truthfulness_factual_discipline: 12,
  causation_explanation: 12,
  stakeholder_respect_impact: 12,
  listening_employee_voice: 10,
  corrective_action_proof: 10,
  clarity_plain_language: 8,
  verification_follow_through: 8,
  fairness_independence_conflicts: 5,
  future_readiness_learning: 5,
};

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  accountability_agency: "Accountability and agency",
  truthfulness_factual_discipline: "Truthfulness and factual discipline",
  causation_explanation: "Causation and explanation",
  stakeholder_respect_impact: "Stakeholder respect and impact",
  listening_employee_voice: "Listening and employee voice",
  corrective_action_proof: "Corrective action and proof",
  clarity_plain_language: "Clarity and plain language",
  verification_follow_through: "Verification and follow-through",
  fairness_independence_conflicts: "Fairness, independence and conflicts",
  future_readiness_learning: "Future readiness and learning",
};

export const WEIGHT_TOTAL = Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0);

/** Score = sum over i of (s_i / 5) x w_i, rounded to the nearest whole number. */
export function computeScore(dimensions: ReadonlyArray<Pick<Dimension, "id" | "score">>): number {
  const total = dimensions.reduce((sum, d) => sum + (d.score / 5) * DIMENSION_WEIGHTS[d.id], 0);
  return Math.round(total);
}

export const SCORE_BANDS = [
  { min: 90, name: "Strongly accountable" },
  { min: 75, name: "Credible, with targeted improvements" },
  { min: 60, name: "Material accountability and trust gaps" },
  { min: 40, name: "High risk of evasiveness or stakeholder mistrust" },
  { min: 0, name: "Serious clarity, accountability, or ethical-risk concerns" },
] as const;
export type BandName = (typeof SCORE_BANDS)[number]["name"];

export function scoreBand(score: number): BandName {
  for (const band of SCORE_BANDS) {
    if (score >= band.min) return band.name;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1]!.name;
}

/** Dimension color scale: 4.0-5.0 sage, 3.0-3.9 muted blue, 2.0-2.9 amber, 0-1.9 burgundy. */
export type DimensionTone = "strong" | "sound" | "caution" | "material";
export function dimensionTone(score: number): DimensionTone {
  if (score >= 4) return "strong";
  if (score >= 3) return "sound";
  if (score >= 2) return "caution";
  return "material";
}

export const CONFIDENCE_WITH_CONTEXT = "Scored against supplied context";
export const CONFIDENCE_DRAFT_ONLY =
  "Scored on draft language only — add known facts and decision details for a substantiated score";

export function confidenceLabel(contextSupplied: boolean): string {
  return contextSupplied ? CONFIDENCE_WITH_CONTEXT : CONFIDENCE_DRAFT_ONLY;
}

export const SEVERITY_RANK: Record<Severity, number> = { High: 0, Moderate: 1, Low: 2 };

/** Findings ordered highest severity first; ties keep the model's order (which is also id order). */
export function rankFindings<T extends Pick<Finding, "severity" | "id">>(findings: ReadonlyArray<T>): T[] {
  return [...findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.id.localeCompare(b.id),
  );
}

/** True when the value is a multiple of 0.5 between 0.0 and 5.0 inclusive. */
export function isValidDimensionScore(score: number): boolean {
  return Number.isFinite(score) && score >= 0 && score <= 5 && Number.isInteger(score * 2);
}
