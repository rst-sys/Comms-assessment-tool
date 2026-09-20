/**
 * JSON schema for the analysis object (PROMPT.md Section 6).
 *
 * Two schemas, one source of truth. ANALYSIS_SCHEMA is the strict one: ajv
 * compiles it and every analysis must satisfy it. `relaxForProvider` derives
 * the copy that goes to the provider as the structured-output format.
 *
 * The provider compiles that copy into a grammar, and the grammar has a size
 * ceiling — exceed it and the call is rejected outright with "the compiled
 * grammar is too large". Enumerated values are what cost the most: each list
 * of allowed strings becomes a set of alternatives in the grammar, and this
 * schema carries fourteen of them. Dropping them from the provider's copy
 * leaves the shape intact — every object, property, array and nullable union
 * still forces the structure we need — while removing the expensive part.
 *
 * Nothing is lost by it. The prompt already names the permitted values,
 * normalize.ts repairs casing, and ajv still checks the real schema before any
 * analysis is shown, so a wrong value fails loudly rather than slipping
 * through. This is the same division the count, numeric and string
 * constraints already use: expressed here, enforced in validate.ts.
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
  PROTOCOL_STATUSES,
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

/**
 * A copy with every `enum` and `const` removed, at any depth. Structure —
 * types, properties, required, additionalProperties, items, anyOf — is kept
 * exactly. Deriving it rather than maintaining a second schema by hand means
 * the two cannot drift apart.
 */
export function relaxForProvider(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(relaxForProvider);
  if (!schema || typeof schema !== "object") return schema;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    if (key === "enum" || key === "const") continue;
    out[key] = relaxForProvider(value);
  }
  return out;
}

export const ANALYSIS_SCHEMA: JsonSchema = obj({
  schema_version: enumOf([SCHEMA_VERSION]),
  executive_summary: obj({
    headline: str,
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
      recommended_action: str,
      fact_validation_needed: bool,
      specialist_review_needed: bool,
      specialist_review_type: nullableEnum(SPECIALIST_REVIEW_TYPES),
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
  protocol_review: {
    anyOf: [
      obj({
        protocol: str,
        source: str,
        elements: arr(obj({ name: str, status: enumOf(PROTOCOL_STATUSES), note: str })),
      }),
      { type: "null" },
    ],
  },
});
