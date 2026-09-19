/**
 * JSON schema for the analysis object (PROMPT.md Section 6).
 *
 * This single schema is sent to the provider as the structured-output format
 * and compiled by ajv for validation. The provider's structured-output subset
 * does not allow count, numeric or string constraints, so those live in
 * validate.ts as code-enforced checks.
 */
import {
  CLAIM_STATUSES,
  DEVILS_ADVOCATE_DISCLAIMER,
  DIMENSION_IDS,
  READINESS_VALUES,
  RISK_LEVELS,
  SCAN_ASSESSMENTS,
  SCAN_CATEGORIES,
  SCHEMA_VERSION,
  SEVERITIES,
  SPECIALIST_REVIEW_TYPES,
} from "./types.js";

type JsonSchema = Record<string, unknown>;

const str: JsonSchema = { type: "string" };
const bool: JsonSchema = { type: "boolean" };
const nullableStr: JsonSchema = { anyOf: [{ type: "string" }, { type: "null" }] };
const enumOf = (values: readonly string[]): JsonSchema => ({ type: "string", enum: [...values] });
const nullableEnum = (values: readonly string[]): JsonSchema => ({
  anyOf: [{ type: "string", enum: [...values] }, { type: "null" }],
});
const arr = (items: JsonSchema): JsonSchema => ({ type: "array", items });
const obj = (properties: Record<string, JsonSchema>): JsonSchema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const ANALYSIS_SCHEMA: JsonSchema = obj({
  schema_version: enumOf([SCHEMA_VERSION]),
  executive_summary: obj({
    assessment: str,
    risk_level: enumOf(RISK_LEVELS),
    readiness: enumOf(READINESS_VALUES),
    context_supplied: bool,
    strongest_elements: arr(str),
    priority_improvements: arr(str),
  }),
  dimensions: arr(
    obj({
      id: enumOf(DIMENSION_IDS),
      score: { type: "number" },
      rationale: str,
      would_raise: str,
    }),
  ),
  findings: arr(
    obj({
      id: str,
      dimension: enumOf(DIMENSION_IDS),
      severity: enumOf(SEVERITIES),
      excerpt: nullableStr,
      omission: nullableStr,
      claim_status: nullableEnum(CLAIM_STATUSES),
      finding: str,
      why_it_matters: str,
      stakeholder_risk: str,
      recommended_action: str,
      fact_validation_needed: bool,
      specialist_review_needed: bool,
      specialist_review_type: nullableEnum(SPECIALIST_REVIEW_TYPES),
      confidence_note: str,
    }),
  ),
  agency_scan: arr(
    obj({
      phrase: str,
      category: enumOf(SCAN_CATEGORIES),
      severity: enumOf(SEVERITIES),
      assessment: enumOf(SCAN_ASSESSMENTS),
      why: str,
      what_would_make_it_credible: str,
      finding_id: nullableStr,
    }),
  ),
  devils_advocate: obj({
    disclaimer: enumOf([DEVILS_ADVOCATE_DISCLAIMER]),
    personas: arr(
      obj({
        persona: str,
        headline: str,
        may_hear: str,
        may_question: str,
        may_find_missing: str,
        would_address_it: str,
      }),
    ),
    most_damaging_interpretation: str,
  }),
  questions_before_publication: arr(str),
  specialist_review_summary: arr(enumOf(SPECIALIST_REVIEW_TYPES)),
});
