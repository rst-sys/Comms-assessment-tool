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
import { MAX_QUESTIONS } from "./limits.js";
import {
  CLAIM_STATUSES,
  DEVILS_ADVOCATE_DISCLAIMER,
  DIMENSION_IDS,
  RISK_LEVELS,
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

/**
 * Keywords that constrain a VALUE, which the provider's grammar will not take.
 *
 * `enum` and `const` were dropped for size — each list of allowed strings
 * becomes a set of alternatives in the compiled grammar. The rest are here
 * because the provider rejects them outright: adding `maxItems` to the
 * questions array returned "Provider error 400: output_config.format.schema:
 * For 'array' type, property 'maxItems' is not supported", and every review
 * failed until it was taken out again.
 *
 * So the whole family goes, not just the one that bit. A grammar can express
 * shape — what fields exist, what type each is, whether null is allowed — and
 * nothing about how many or how long. Anything of that kind belongs in
 * ANALYSIS_SCHEMA for ajv, and in normalize.ts to repair, and must never reach
 * the provider.
 */
const VALUE_CONSTRAINTS = new Set([
  "enum",
  "const",
  "maxItems",
  "minItems",
  "uniqueItems",
  "maxLength",
  "minLength",
  "pattern",
  "format",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "maxProperties",
  "minProperties",
]);

/**
 * A copy with every value constraint removed, at any depth. Structure —
 * types, properties, required, additionalProperties, items, anyOf — is kept
 * exactly. Deriving it rather than maintaining a second schema by hand means
 * the two cannot drift apart.
 */
export function relaxForProvider(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(relaxForProvider);
  if (!schema || typeof schema !== "object") return schema;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    if (VALUE_CONSTRAINTS.has(key)) continue;
    out[key] = relaxForProvider(value);
  }
  return out;
}

/** The value constraints, exported so a test can assert none of them survive. */
export const PROVIDER_UNSUPPORTED_KEYWORDS: readonly string[] = [...VALUE_CONSTRAINTS];

export const ANALYSIS_SCHEMA: JsonSchema = obj({
  schema_version: enumOf([SCHEMA_VERSION]),
  executive_summary: obj({
    headline: str,
    risk_level: enumOf(RISK_LEVELS),
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
  devils_advocate: obj({
    disclaimer: enumOf([DEVILS_ADVOCATE_DISCLAIMER]),
    personas: arr(
      obj({ persona: str, might_say: str }),
    ),
    most_damaging_interpretation: str,
  }),
  // The one list with a maximum in the schema itself, so the provider's
  // grammar stops the overrun as it is written. The others are bounded by
  // normalize.ts and validate.ts instead: findings are trimmed only after
  // their excerpts have been checked against the draft, and capping them here
  // would cut good findings before the unverifiable ones had been dropped.
  questions_before_publication: { type: "array", items: str, maxItems: MAX_QUESTIONS },
  specialist_review_summary: arr(enumOf(SPECIALIST_REVIEW_TYPES)),
});
