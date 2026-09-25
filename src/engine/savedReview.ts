/**
 * A saved review (revision 12): everything the tool said, plus the settings
 * that produced it. The draft itself is never written to the file, and
 * neither are the contents of uploaded documents; their titles and
 * descriptions are kept so the user knows what to re-attach.
 *
 * One honest limit: the review's own prose quotes the draft (a rationale may
 * read `The only agentive clause is "we are eliminating roles"`), so a saved
 * review always carries short fragments of the draft, whatever the excerpt
 * setting. `includeExcerpts: false` blanks the verbatim excerpt and scan
 * phrase fields, which is a reduction, not a guarantee. The UI says so.
 */
import { Ajv } from "ajv";
import type {
  AudienceDocument,
  ContextFields,
  EvaluationRequest,
  Severity,
} from "./types.js";
import type { EvaluationResult } from "./evaluate.js";

export const SAVED_REVIEW_FORMAT = "trust-assessment-review";
export const SAVED_REVIEW_VERSION = 1;

/** The intake settings that must match for two reviews to be comparable. */
export interface SavedSettings {
  communication_event: string;
  communication_format: string;
  primary_audience: string;
  setting: string;
  market: string;
  goal: string;
  audience_scope: string;
  already_published: boolean;
  stance: string;
  reacting_to: string;
}

export interface SavedFinding {
  id: string;
  dimension: string;
  severity: Severity;
  /** A quoted fragment of the earlier draft, or null when omitted or not kept. */
  excerpt: string | null;
  omission: string | null;
  finding: string;
  recommended_action: string;
  specialist_review_needed: boolean;
  specialist_review_type: string | null;
}

export interface SavedReview {
  format: typeof SAVED_REVIEW_FORMAT;
  format_version: number;
  saved_at: string;
  /** True when the verbatim excerpt and scan-phrase fields were kept. */
  excerpts_included: boolean;
  provider: { provider: string; model: string };
  score: number;
  band: string;
  confidence_label: string;
  settings: SavedSettings;
  context: ContextFields;
  /** Titles and descriptions only; document contents are never saved. */
  documents: Omit<AudienceDocument, "text">[];
  summary: {
    headline: string;
    risk_level: string;
    strongest_elements: string[];
    priority_improvements: string[];
  };
  dimensions: { id: string; score: number; rationale: string; would_raise: string }[];
  findings: SavedFinding[];
  specialist_review_summary: string[];
}

export function buildSavedReview(
  result: EvaluationResult,
  request: EvaluationRequest,
  options: { includeExcerpts?: boolean; now?: Date } = {},
): SavedReview {
  const includeExcerpts = options.includeExcerpts ?? true;
  const now = options.now ?? new Date();
  const a = result.analysis;
  return {
    format: SAVED_REVIEW_FORMAT,
    format_version: SAVED_REVIEW_VERSION,
    saved_at: now.toISOString(),
    excerpts_included: includeExcerpts,
    provider: result.provider,
    score: result.score,
    band: result.band,
    confidence_label: result.confidence_label,
    settings: {
      communication_event: request.communication_event,
      communication_format: request.communication_format,
      primary_audience: request.primary_audience,
      setting: request.setting,
      market: request.market,
      goal: request.goal,
      audience_scope: request.audience_scope,
      already_published: request.already_published,
      stance: request.stance ?? "proactive",
      reacting_to: request.reacting_to ?? "",
    },
    context: { ...request.context },
    documents: (request.audience_documents ?? []).map(({ text: _text, ...rest }) => rest),
    summary: {
      headline: a.executive_summary.headline,
      risk_level: a.executive_summary.risk_level,
      strongest_elements: [...a.executive_summary.strongest_elements],
      priority_improvements: [...a.executive_summary.priority_improvements],
    },
    dimensions: a.dimensions.map((d) => ({ id: d.id, score: d.score, rationale: d.rationale, would_raise: d.would_raise })),
    findings: a.findings.map((f) => ({
      id: f.id,
      dimension: f.dimension,
      severity: f.severity,
      excerpt: includeExcerpts ? f.excerpt : null,
      omission: f.omission,
      finding: f.finding,
      recommended_action: f.recommended_action,
      specialist_review_needed: f.specialist_review_needed,
      specialist_review_type: f.specialist_review_type,
    })),
    specialist_review_summary: [...a.specialist_review_summary],
  };
}

/** The settings a later review must match for the comparison to be like-for-like. */
export const COMPARABLE_SETTINGS: (keyof SavedSettings)[] = [
  "communication_event",
  "communication_format",
  "primary_audience",
  "setting",
  "market",
  "goal",
  "audience_scope",
];

export const SETTING_LABELS: Record<keyof SavedSettings, string> = {
  communication_event: "Communication event",
  communication_format: "Communication format",
  primary_audience: "Primary audience",
  setting: "Setting",
  market: "Market",
  goal: "Goal",
  audience_scope: "Audience scope",
  already_published: "Already published",
  stance: "Stance",
  reacting_to: "Reacting to",
};

/** Settings that differ between the saved review and the current request. */
export function settingsDrift(saved: SavedSettings, request: EvaluationRequest): string[] {
  const current: SavedSettings = {
    communication_event: request.communication_event,
    communication_format: request.communication_format,
    primary_audience: request.primary_audience,
    setting: request.setting,
    market: request.market,
    goal: request.goal,
    audience_scope: request.audience_scope,
    already_published: request.already_published,
    stance: request.stance ?? "proactive",
    reacting_to: request.reacting_to ?? "",
  };
  return COMPARABLE_SETTINGS.filter((k) => saved[k] !== current[k]).map((k) => SETTING_LABELS[k]);
}

const str = { type: "string" } as const;
const SAVED_REVIEW_SCHEMA = {
  type: "object",
  properties: {
    format: { const: SAVED_REVIEW_FORMAT },
    format_version: { type: "number" },
    saved_at: str,
    excerpts_included: { type: "boolean" },
    provider: { type: "object", properties: { provider: str, model: str }, required: ["provider", "model"] },
    score: { type: "number" },
    band: str,
    confidence_label: str,
    settings: { type: "object" },
    context: { type: "object" },
    documents: { type: "array" },
    summary: { type: "object" },
    dimensions: { type: "array" },
    findings: { type: "array" },
    specialist_review_summary: { type: "array" },
  },
  required: ["format", "format_version", "score", "settings", "summary", "dimensions", "findings"],
} as const;

const ajv = new Ajv({ allErrors: false, strict: false });
const validate = ajv.compile(SAVED_REVIEW_SCHEMA);

export class SavedReviewError extends Error {
  readonly name = "SavedReviewError";
}

/** Reads a saved-review file. Throws a plain-language error the UI can show. */
export function parseSavedReview(text: string): SavedReview {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SavedReviewError("That file is not a saved review. Choose the file this tool gave you when you saved a review.");
  }
  if (!validate(raw)) {
    throw new SavedReviewError("That file is not a saved review, or it is from a newer version of the tool.");
  }
  const saved = raw as SavedReview;
  if (saved.format_version > SAVED_REVIEW_VERSION) {
    throw new SavedReviewError("That saved review comes from a newer version of the tool. Run a fresh review instead.");
  }
  return saved;
}

export function savedReviewFilename(saved: SavedReview): string {
  const type = saved.settings.communication_event.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `trust-review-${type}-${saved.saved_at.slice(0, 10)}.json`;
}
