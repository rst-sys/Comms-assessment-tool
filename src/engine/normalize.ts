/**
 * Best-effort normalization of a loosely shaped analysis object into the
 * Section 6 shape, for runtimes that cannot enforce a structured-output
 * schema at the provider (the claude.ai page). It fixes only harmless
 * deviations: unknown keys, missing nullable or boolean fields, arrays that
 * are slightly too long, scores off the 0.5 grid, a paraphrased disclaimer,
 * missing finding ids. It never invents content, and the strict validator
 * still runs afterwards.
 */
import {
  CLAIM_STATUSES,
  DEVILS_ADVOCATE_DISCLAIMER,
  DIMENSION_IDS,
  PROTOCOL_STATUSES,
  READINESS_VALUES,
  RISK_LEVELS,
  SCAN_ASSESSMENTS,
  SCAN_CATEGORIES,
  SCHEMA_VERSION,
  SEVERITIES,
  SPECIALIST_REVIEW_TYPES,
  type Analysis,
} from "./types.js";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : v === null || v === undefined ? fallback : String(v));
const nullableStr = (v: unknown): string | null => (typeof v === "string" && v.trim().length > 0 ? v : null);
const bool = (v: unknown): boolean => v === true || v === "true";
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strings = (v: unknown, max: number): string[] => arr(v).map((x) => str(x)).filter((x) => x.trim().length > 0).slice(0, max);

/**
 * Matches a value to its permitted spelling, ignoring case and surrounding
 * space. Anything with no match is left exactly as it came so the validator
 * rejects it loudly rather than this quietly inventing a value.
 *
 * Casing drift is the common failure, and the prompt causes some of it: the
 * system prompt writes ASSERTED and SUPPORTED in capitals for emphasis while
 * the schema spells them Asserted and Supported. The provider's grammar used
 * to absorb that, but the grammar now carries no value lists (see schema.ts),
 * so the repair belongs here.
 */
function oneOf(v: unknown, allowed: readonly string[]): string {
  const raw = str(v).trim();
  return allowed.find((a) => a.toLowerCase() === raw.toLowerCase()) ?? raw;
}

/** The nullable form: an absent value stays null rather than becoming "". */
function oneOfOrNull(v: unknown, allowed: readonly string[]): string | null {
  const raw = nullableStr(v);
  return raw === null ? null : oneOf(raw, allowed);
}

function roundHalf(v: unknown): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n * 2) / 2));
}

/** Returns a normalized copy, or the input unchanged when it is not an object. */
export function normalizeAnalysis(raw: unknown): unknown {
  if (!isObj(raw)) return raw;
  const summary = isObj(raw.executive_summary) ? raw.executive_summary : {};
  const da = isObj(raw.devils_advocate) ? raw.devils_advocate : {};

  const findings = arr(raw.findings)
    .filter(isObj)
    .map((f, i) => ({
      id: str(f.id, `F-${String(i + 1).padStart(3, "0")}`),
      dimension: oneOf(f.dimension, DIMENSION_IDS),
      severity: oneOf(f.severity, SEVERITIES),
      excerpt: nullableStr(f.excerpt),
      omission: nullableStr(f.omission),
      claim_status: oneOfOrNull(f.claim_status, CLAIM_STATUSES),
      finding: str(f.finding),
      recommended_action: str(f.recommended_action ?? f.what_to_add ?? f.suggested_revision),
      fact_validation_needed: bool(f.fact_validation_needed),
      specialist_review_needed: bool(f.specialist_review_needed),
      specialist_review_type: oneOfOrNull(f.specialist_review_type, SPECIALIST_REVIEW_TYPES),
    }));

  const normalized = {
    schema_version: SCHEMA_VERSION,
    executive_summary: {
      headline: str(summary.headline),
      risk_level: oneOf(summary.risk_level, RISK_LEVELS),
      readiness: oneOf(summary.readiness, READINESS_VALUES),
      context_supplied: bool(summary.context_supplied),
      strongest_elements: strings(summary.strongest_elements, 3),
      priority_improvements: strings(summary.priority_improvements, 3),
    },
    dimensions: arr(raw.dimensions)
      .filter(isObj)
      .filter((d, i, all) => all.findIndex((x) => x.id === d.id) === i)
      .map((d) => ({ id: oneOf(d.id, DIMENSION_IDS), score: roundHalf(d.score), rationale: str(d.rationale), would_raise: str(d.would_raise) }))
      .filter((d) => (DIMENSION_IDS as readonly string[]).includes(d.id)),
    findings,
    agency_scan: arr(raw.agency_scan)
      .filter(isObj)
      .map((s) => ({
        phrase: str(s.phrase),
        category: oneOf(s.category, SCAN_CATEGORIES),
        severity: oneOf(s.severity, SEVERITIES),
        assessment: oneOf(s.assessment, SCAN_ASSESSMENTS),
        why: str(s.why),
        what_would_make_it_credible: str(s.what_would_make_it_credible),
        finding_id: nullableStr(s.finding_id),
      })),
    devils_advocate: {
      disclaimer: DEVILS_ADVOCATE_DISCLAIMER,
      personas: arr(da.personas)
        .filter(isObj)
        .slice(0, 5)
        .map((p) => ({ persona: str(p.persona), might_say: str(p.might_say) })),
      most_damaging_interpretation: str(da.most_damaging_interpretation),
    },
    protocol_review: isObj(raw.protocol_review)
      ? {
          protocol: str(raw.protocol_review.protocol),
          source: str(raw.protocol_review.source),
          elements: arr(raw.protocol_review.elements)
            .filter(isObj)
            .map((e) => ({ name: str(e.name), status: oneOf(e.status, PROTOCOL_STATUSES), note: str(e.note) })),
        }
      : null,
    questions_before_publication: strings(raw.questions_before_publication, 12),
    specialist_review_summary: [...new Set(strings(raw.specialist_review_summary, 20).map((t) => oneOf(t, SPECIALIST_REVIEW_TYPES)))],
  } satisfies Record<keyof Analysis, unknown>;

  // A finding whose excerpt and omission are both missing: keep whichever text exists as the omission.
  for (const f of normalized.findings) {
    if (f.excerpt === null && f.omission === null && f.finding) f.omission = f.finding;
  }
  return normalized;
}
