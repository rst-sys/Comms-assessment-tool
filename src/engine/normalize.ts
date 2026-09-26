/**
 * Best-effort normalization of a loosely shaped analysis object into the
 * Section 6 shape, for runtimes that cannot enforce a structured-output
 * schema at the provider (the claude.ai page). It fixes only harmless
 * deviations: unknown keys, missing nullable or boolean fields, arrays that
 * are slightly too long, scores off the 0.5 grid, a paraphrased disclaimer,
 * missing finding ids. It never invents content, and the strict validator
 * still runs afterwards.
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
  type Analysis,
  type SpecialistReviewType,
} from "./types.js";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : v === null || v === undefined ? fallback : String(v));
const nullableStr = (v: unknown): string | null => (typeof v === "string" && v.trim().length > 0 ? v : null);
const bool = (v: unknown): boolean => v === true || v === "true";
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
/**
 * A list of strings out of whatever shape the model reached for.
 *
 * `arr` alone turned anything that was not an array into an empty list, and an
 * empty questions list is the one thing the validator refuses outright — so a
 * model that grouped its questions under headings, or wrapped each one in an
 * object with the review function beside it, lost the whole review rather than
 * one field. Both are shapes the protocols invite: their questions are written
 * as `ask` with a `review` list, and the model sometimes hands them back that
 * way.
 *
 * It reads a plain array, or an object whose values are taken in order, one
 * level of nesting inside either, and for each item a string or the first text
 * field of an object. Nothing is invented: a shape with no text in it still
 * yields nothing.
 */
const TEXT_KEYS = ["ask", "question", "text", "title", "value", "name"] as const;

function textOf(x: unknown): string {
  if (typeof x === "string") return x;
  if (typeof x === "number" || typeof x === "boolean") return String(x);
  if (isObj(x)) {
    for (const key of TEXT_KEYS) {
      const v = x[key];
      if (typeof v === "string" && v.trim().length > 0) return v;
    }
  }
  return "";
}

function loose(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (isObj(v)) return Object.values(v);
  return [];
}

const strings = (v: unknown, max: number, repairs?: string[], field?: string): string[] => {
  const flat = loose(v).flatMap((x) => (Array.isArray(x) || (isObj(x) && textOf(x) === "") ? loose(x) : [x]));
  const all = flat.map(textOf).filter((x) => x.trim().length > 0);
  if (field && repairs) {
    if (!Array.isArray(v) && all.length > 0) repairs.push(`${field}_reshaped`);
    if (all.length > max) repairs.push(`${field}_trimmed:${all.length - max}`);
  }
  return all.slice(0, max);
};

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

/**
 * Words that point at a specialist review type but are not its exact name.
 *
 * The model is given the nine permitted spellings in the prompt and mostly
 * uses them, but a review that asks about works councils comes back tagged
 * "Works council" often enough to matter, and an unknown tag used to fail the
 * whole analysis. Each entry is a word that can only mean one of the nine;
 * anything ambiguous is left out and the tag is dropped instead of guessed.
 */
const REVIEW_SYNONYMS: [RegExp, SpecialistReviewType][] = [
  [/^(legal|counsel|law|lawyer|attorney|compliance|general counsel)$/i, "Legal"],
  [/^(hr|human resources|people|people team|personnel)$/i, "HR"],
  [/^(labou?r|labou?r relations|union|works council|employee representatives?)$/i, "Labor"],
  [/^(privacy|data protection|dpo|gdpr)$/i, "Privacy"],
  [/^(security|infosec|information sec\w*|it security|cyber\w*|ciso)$/i, "Information security"],
  [/^(ir|investor relations?|investors?|finance|cfo|treasury)$/i, "Investor relations"],
  [/^(local|local markets?|market|country|in-country|regional)$/i, "Local market"],
  [/^(health (and|&) safety|safety|hse|ehs|occupational health)$/i, "Health and safety"],
  [/^(executive|exec|board|leadership|leadership team|c-suite|ceo)$/i, "Executive"],
];

/** Codes are safe to log; a value the model invented might not be. */
function safeCode(value: string): string {
  const v = value.trim();
  return v.length <= 32 && /^[\w &/'()-]+$/.test(v) ? v : "unprintable";
}

/**
 * A permitted specialist review type, or null to drop the tag.
 *
 * Exact spelling first, then case, then the synonyms above. A value that
 * matches none of them is dropped and counted: the alternative, letting it
 * through, fails the strict validator and loses a complete review over one
 * label.
 */
export function reviewType(value: string, repairs?: string[]): SpecialistReviewType | null {
  const raw = value.trim();
  if (raw.length === 0) return null;
  const exact = SPECIALIST_REVIEW_TYPES.find((a) => a.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const mapped = REVIEW_SYNONYMS.find(([re]) => re.test(raw))?.[1];
  if (mapped) {
    repairs?.push(`review_value_mapped:${safeCode(raw)}>${mapped}`);
    return mapped;
  }
  repairs?.push(`review_value_dropped:${safeCode(raw)}`);
  return null;
}

/** Cuts a list to its maximum, recording by how much. */
function tallyTrim<T>(items: T[], max: number, repairs: string[], field: string): T[] {
  if (items.length > max) repairs.push(`${field}_trimmed:${items.length - max}`);
  return items.slice(0, max);
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
export function normalizeAnalysis(raw: unknown, repairs: string[] = []): unknown {
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
      // A tag the schema does not know is mapped or dropped, never kept: the
      // finding is worth more than the label on it, and an unknown label used
      // to fail the whole review where a missing one costs one chip on one card.
      specialist_review_type: f.specialist_review_type == null ? null : reviewType(str(f.specialist_review_type), repairs),
    }));

  const normalized = {
    schema_version: SCHEMA_VERSION,
    executive_summary: {
      headline: str(summary.headline),
      risk_level: oneOf(summary.risk_level, RISK_LEVELS),
      context_supplied: bool(summary.context_supplied),
      strongest_elements: strings(summary.strongest_elements, 3, repairs, "strongest_elements"),
      priority_improvements: strings(summary.priority_improvements, 3, repairs, "priority_improvements"),
    },
    dimensions: arr(raw.dimensions)
      .filter(isObj)
      .filter((d, i, all) => all.findIndex((x) => x.id === d.id) === i)
      .map((d) => ({ id: oneOf(d.id, DIMENSION_IDS), score: roundHalf(d.score), rationale: str(d.rationale), would_raise: str(d.would_raise) }))
      .filter((d) => (DIMENSION_IDS as readonly string[]).includes(d.id)),
    findings,
    devils_advocate: {
      disclaimer: DEVILS_ADVOCATE_DISCLAIMER,
      personas: tallyTrim(arr(da.personas).filter(isObj), 5, repairs, "personas")
        .map((p) => ({ persona: str(p.persona), might_say: str(p.might_say) })),
      most_damaging_interpretation: str(da.most_damaging_interpretation),
    },
    // The prompt asks for these most important first, and the protocols now
    // offer far more than the cap, so the tail is the least material of an
    // already-ranked list rather than an arbitrary cut.
    questions_before_publication: strings(raw.questions_before_publication, MAX_QUESTIONS, repairs, "questions"),
    specialist_review_summary: [
      ...new Set(
        strings(raw.specialist_review_summary, 20, repairs, "specialist_review_summary")
          .map((t) => reviewType(t, repairs))
          .filter((t): t is SpecialistReviewType => t !== null),
      ),
    ],
  } satisfies Record<keyof Analysis, unknown>;

  // A finding whose excerpt and omission are both missing: keep whichever text exists as the omission.
  for (const f of normalized.findings) {
    if (f.excerpt === null && f.omission === null && f.finding) f.omission = f.finding;
  }
  return normalized;
}
