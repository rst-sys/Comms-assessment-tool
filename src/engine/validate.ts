/**
 * Validation and code-enforced constraints (PROMPT.md Section 6).
 *
 * Order of operations:
 *   1. ajv validates the raw object against ANALYSIS_SCHEMA. Failure throws;
 *      the error carries only the instance path, never the response body.
 *   2. Structural constraints the schema cannot express: exactly ten
 *      dimensions with the ten ids, scores in 0.5 steps, exactly five
 *      personas, five to twelve questions, three strongest elements and
 *      three priority improvements, excerpt and omission never both null.
 *   3. Findings whose excerpt is not verbatim in the draft are dropped and
 *      counted. Agency-scan phrases that are not in the draft are dropped
 *      too, because the results page highlights them in the draft.
 *   4. Readiness is never "Ready with minor edits" while any finding needs
 *      specialist review; context_supplied reflects what was actually sent.
 */
import { Ajv, type ErrorObject } from "ajv";
import { MAX_FINDINGS, MIN_QUESTIONS } from "./limits.js";
import { ANALYSIS_SCHEMA } from "./schema.js";
import { isValidDimensionScore } from "./scoring.js";
import {
  DIMENSION_IDS,
  type Analysis,
  type SpecialistReviewType,
} from "./types.js";

/** Every text field a persona must actually carry. */
const PERSONA_TEXT_FIELDS = ["persona", "might_say"] as const;

export class AnalysisValidationError extends Error {
  readonly name = "AnalysisValidationError";
  constructor(
    /** JSON pointer to the failing element, or a short constraint name. */
    readonly path: string,
    message: string,
  ) {
    super(message);
  }
}

export interface ValidationAdjustments {
  /** Findings removed because their excerpt was not verbatim in the draft. */
  dropped_findings: number;
  /** True when the model's context_supplied disagreed with the request and was corrected. */
  context_flag_corrected: boolean;
  /** Findings beyond MAX_FINDINGS, trimmed from the end of an already-ranked list. */
  trimmed_findings: number;
  /** How many questions came back when fewer than MIN_QUESTIONS did, 0 included. Null when the count was fine. */
  thin_questions: number | null;
}

export interface ValidatedAnalysis {
  analysis: Analysis;
  adjustments: ValidationAdjustments;
}

const ajv = new Ajv({ allErrors: false, strict: true });
const validateSchema = ajv.compile(ANALYSIS_SCHEMA);

function describe(error: ErrorObject | undefined): { path: string; message: string } {
  if (!error) return { path: "/", message: "schema validation failed" };
  return { path: error.instancePath || "/", message: error.message ?? "invalid" };
}

export function contextWasSupplied(context: string): boolean {
  return context.trim().length > 0;
}

const QUOTE_CLASS = "[\"'‘’“”«»]";

/**
 * Returns the exact substring of the draft that the excerpt refers to, or null.
 * Exact containment wins; otherwise whitespace runs and quote styles are
 * matched loosely and the draft's own text is returned, so the stored
 * excerpt is always verbatim.
 */
export function findVerbatim(draft: string, excerpt: string): string | null {
  const trimmed = excerpt.trim();
  if (trimmed.length === 0) return null;
  if (draft.includes(trimmed)) return trimmed;
  const pattern = trimmed
    .split(/\s+/)
    .map((token) =>
      token
        .split(/(["'‘’“”«»])/)
        .map((part) => (part.length === 1 && /["'‘’“”«»]/.test(part) ? QUOTE_CLASS : escapeRegExp(part)))
        .join(""),
    )
    .join("\\s+");
  const match = new RegExp(pattern).exec(draft);
  return match ? match[0] : null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The model occasionally double-escapes a character (a literal backslash-u
 * sequence such as \\u2014 survives JSON parsing as six characters). Decode
 * those in every string so they never reach the page.
 */
export function decodeStrayEscapes<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))) as T;
  }
  if (Array.isArray(value)) return value.map((v) => decodeStrayEscapes(v)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, decodeStrayEscapes(v)])) as T;
  }
  return value;
}

function fail(path: string, message: string): never {
  throw new AnalysisValidationError(path, `${path}: ${message}`);
}

export function validateAnalysis(raw: unknown, draft: string, context: string): ValidatedAnalysis {
  if (!validateSchema(raw)) {
    const { path, message } = describe(validateSchema.errors?.[0]);
    fail(path, message);
  }
  // ajv has established the shape; structural checks follow.
  const input = decodeStrayEscapes(raw as Analysis);

  // Dimensions: exactly ten, the ten ids, scores in 0.5 steps.
  if (input.dimensions.length !== DIMENSION_IDS.length) {
    fail("/dimensions", `expected ${DIMENSION_IDS.length} dimensions, got ${input.dimensions.length}`);
  }
  const seenIds = new Set<string>();
  for (const [i, d] of input.dimensions.entries()) {
    if (seenIds.has(d.id)) fail(`/dimensions/${i}/id`, `duplicate dimension id ${d.id}`);
    seenIds.add(d.id);
    if (!isValidDimensionScore(d.score)) fail(`/dimensions/${i}/score`, `score ${d.score} is not a 0.5 step in 0.0-5.0`);
  }
  for (const id of DIMENSION_IDS) {
    if (!seenIds.has(id)) fail("/dimensions", `missing dimension ${id}`);
  }

  // Executive summary lists.
  const summary = input.executive_summary;
  if (summary.strongest_elements.length !== 3) fail("/executive_summary/strongest_elements", "expected exactly 3");
  if (summary.priority_improvements.length !== 3) fail("/executive_summary/priority_improvements", "expected exactly 3");

  // Devil's advocate and questions.
  if (input.devils_advocate.personas.length !== 5) {
    fail("/devils_advocate/personas", `expected exactly 5 personas, got ${input.devils_advocate.personas.length}`);
  }
  // A persona whose fields are blank is not a persona. The schema types them as
  // strings and the provider's grammar carries no length rule, so an empty
  // string used to pass every check and render as an empty tile — which is how
  // the live site came to show personas with nothing in them.
  for (const [i, p] of input.devils_advocate.personas.entries()) {
    for (const field of PERSONA_TEXT_FIELDS) {
      if (p[field].trim().length === 0) fail(`/devils_advocate/personas/${i}/${field}`, "is empty");
    }
  }
  if (input.devils_advocate.most_damaging_interpretation.trim().length === 0) {
    fail("/devils_advocate/most_damaging_interpretation", "is empty");
  }
  // Thin is not broken, and neither is empty any more.
  //
  // Throwing away a complete, correct review because it asked four good
  // questions instead of five costs the reader everything and gains nothing.
  // None at all used to be the exception, on the grounds that the section
  // would be empty — but since the reviewer checklist began rendering below
  // it, an empty model list costs the draft-specific half of the questions,
  // not the whole section. Three live reviews died on this rule for the sake
  // of one array, each after two full attempts.
  //
  // Recorded either way, so a run of thin or empty reviews is visible rather
  // than silent. Null means the count was fine: 0 is a real count now.
  const q = input.questions_before_publication.length;
  const thinQuestions = q < MIN_QUESTIONS ? q : null;

  // Findings: excerpt/omission rule, unique ids, verbatim excerpts.
  const findingIds = new Set<string>();
  for (const [i, f] of input.findings.entries()) {
    if (f.excerpt === null && f.omission === null) fail(`/findings/${i}`, "excerpt and omission are both null");
    if (findingIds.has(f.id)) fail(`/findings/${i}/id`, `duplicate finding id ${f.id}`);
    findingIds.add(f.id);
  }

  let droppedFindings = 0;
  const verified = input.findings.flatMap((f) => {
    if (f.excerpt === null) return [f];
    const verbatim = findVerbatim(draft, f.excerpt);
    if (verbatim === null) {
      droppedFindings += 1;
      return [];
    }
    return [{ ...f, excerpt: verbatim }];
  });

  // The output budget. The list is already ordered by materiality, High before
  // Moderate before Low, so anything past the ceiling is the least material.
  // Enforced here as well as asked for in the prompt: a protocol must never be
  // able to lengthen the page, or the wait, by talking the model past the cap.
  // Applied before everything downstream, so a trimmed finding cannot leave a
  // scan phrase pointing at nothing or name a specialist review with no
  // finding behind it.
  const trimmedFindings = Math.max(0, verified.length - MAX_FINDINGS);
  const findings = trimmedFindings > 0 ? verified.slice(0, MAX_FINDINGS) : verified;

  // Readiness rule, enforced in code.
  const specialistNeeded = findings.some((f) => f.specialist_review_needed);

  // Context flag reflects what the request actually carried.
  const contextSupplied = contextWasSupplied(context);
  const contextCorrected = summary.context_supplied !== contextSupplied;

  // Specialist review summary: the model's list plus every type a kept finding names.
  const summaryTypes = new Set<SpecialistReviewType>(input.specialist_review_summary);
  for (const f of findings) {
    if (f.specialist_review_needed && f.specialist_review_type) summaryTypes.add(f.specialist_review_type);
  }

  const analysis: Analysis = {
    ...input,
    executive_summary: { ...summary, context_supplied: contextSupplied },
    findings,
    specialist_review_summary: [...summaryTypes],
  };

  return {
    analysis,
    adjustments: {
      dropped_findings: droppedFindings,
      context_flag_corrected: contextCorrected,
      trimmed_findings: trimmedFindings,
      thin_questions: thinQuestions,
    },
  };
}
