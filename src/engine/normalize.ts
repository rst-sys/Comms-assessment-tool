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
  DEVILS_ADVOCATE_DISCLAIMER,
  DIMENSION_IDS,
  PROTOCOL_STATUSES,
  SCHEMA_VERSION,
  type Analysis,
} from "./types.js";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : v === null || v === undefined ? fallback : String(v));
const nullableStr = (v: unknown): string | null => (typeof v === "string" && v.trim().length > 0 ? v : null);
const bool = (v: unknown): boolean => v === true || v === "true";
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strings = (v: unknown, max: number): string[] => arr(v).map((x) => str(x)).filter((x) => x.trim().length > 0).slice(0, max);

/** Accepts a protocol status in any casing; anything else is left as-is for the validator to reject. */
function protocolStatus(v: unknown): string {
  const raw = str(v).trim();
  return PROTOCOL_STATUSES.find((s) => s.toLowerCase() === raw.toLowerCase()) ?? raw;
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
      dimension: str(f.dimension),
      severity: str(f.severity),
      excerpt: nullableStr(f.excerpt),
      omission: nullableStr(f.omission),
      claim_status: nullableStr(f.claim_status),
      finding: str(f.finding),
      why_it_matters: str(f.why_it_matters),
      stakeholder_risk: str(f.stakeholder_risk),
      recommended_action: str(f.recommended_action ?? f.what_to_add ?? f.suggested_revision),
      fact_validation_needed: bool(f.fact_validation_needed),
      specialist_review_needed: bool(f.specialist_review_needed),
      specialist_review_type: nullableStr(f.specialist_review_type),
      confidence_note: str(f.confidence_note),
    }));

  const normalized = {
    schema_version: SCHEMA_VERSION,
    executive_summary: {
      headline: str(summary.headline),
      assessment: str(summary.assessment),
      risk_level: str(summary.risk_level),
      readiness: str(summary.readiness),
      context_supplied: bool(summary.context_supplied),
      strongest_elements: strings(summary.strongest_elements, 3),
      priority_improvements: strings(summary.priority_improvements, 3),
    },
    dimensions: arr(raw.dimensions)
      .filter(isObj)
      .filter((d, i, all) => all.findIndex((x) => x.id === d.id) === i)
      .map((d) => ({ id: str(d.id), score: roundHalf(d.score), rationale: str(d.rationale), would_raise: str(d.would_raise) }))
      .filter((d) => (DIMENSION_IDS as readonly string[]).includes(d.id)),
    findings,
    agency_scan: arr(raw.agency_scan)
      .filter(isObj)
      .map((s) => ({
        phrase: str(s.phrase),
        category: str(s.category),
        severity: str(s.severity),
        assessment: str(s.assessment),
        why: str(s.why),
        what_would_make_it_credible: str(s.what_would_make_it_credible),
        finding_id: nullableStr(s.finding_id),
      })),
    devils_advocate: {
      disclaimer: DEVILS_ADVOCATE_DISCLAIMER,
      personas: arr(da.personas)
        .filter(isObj)
        .slice(0, 5)
        .map((p) => ({
          persona: str(p.persona),
          headline: str(p.headline),
          may_hear: str(p.may_hear),
          may_question: str(p.may_question),
          may_find_missing: str(p.may_find_missing),
          would_address_it: str(p.would_address_it),
        })),
      most_damaging_interpretation: str(da.most_damaging_interpretation),
    },
    protocol_review: isObj(raw.protocol_review)
      ? {
          protocol: str(raw.protocol_review.protocol),
          source: str(raw.protocol_review.source),
          elements: arr(raw.protocol_review.elements)
            .filter(isObj)
            .map((e) => ({ name: str(e.name), status: protocolStatus(e.status), note: str(e.note) })),
        }
      : null,
    questions_before_publication: strings(raw.questions_before_publication, 12),
    specialist_review_summary: [...new Set(strings(raw.specialist_review_summary, 20))],
  } satisfies Record<keyof Analysis, unknown>;

  // A finding whose excerpt and omission are both missing: keep whichever text exists as the omission.
  for (const f of normalized.findings) {
    if (f.excerpt === null && f.omission === null && f.finding) f.omission = f.finding;
  }
  return normalized;
}
