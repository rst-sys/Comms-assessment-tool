/**
 * Comparing a new draft against a saved review (revision 12). The new draft
 * is evaluated on its own terms first; this second pass then judges, finding
 * by finding, whether each earlier problem still applies. The earlier draft
 * is never needed, and is never in the saved file.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { Ajv } from "ajv";
import { callModel, EngineError, newRequestId, type ModelUsage } from "./client.js";
import { getEngineConfig, type EngineConfig } from "./config.js";
import type { EvaluationResult } from "./evaluate.js";
import { DIMENSION_LABELS } from "./scoring.js";
import type { SavedReview } from "./savedReview.js";
import type { EvaluationRequest } from "./types.js";

export const VERDICTS = ["Resolved", "Partly addressed", "Still open", "No longer applicable"] as const;
export type Verdict = (typeof VERDICTS)[number];

export interface FindingVerdict {
  finding_id: string;
  verdict: Verdict;
  /** One sentence pointing at the new draft. */
  evidence: string;
}

export interface Comparison {
  summary: string;
  verdicts: FindingVerdict[];
  /** Ids from the new review that raise something the earlier review did not. */
  new_concerns: string[];
}

export interface DimensionMovement {
  id: string;
  label: string;
  before: number;
  after: number;
}

export interface ComparisonResult extends Comparison {
  request_id: string;
  score_before: number;
  score_after: number;
  band_before: string;
  band_after: string;
  movements: DimensionMovement[];
  /** Settings that changed between the two reviews, so the comparison is not like-for-like. */
  drift: string[];
  provider: { provider: string; model: string };
  usage: ModelUsage;
}

export const COMPARE_SYSTEM_PROMPT = `You compare two versions of a draft communication for Trust Assessment Assistant.

You have the findings from a review of an EARLIER version, and the full text of the NEW version together with its own fresh review. You do NOT have the earlier draft text, and you do not need it: for each earlier finding, judge only whether that problem is still present in the new version.

VERDICTS
For every earlier finding give exactly one verdict:
- "Resolved": the new version contains what the finding said was missing, or no longer contains the language the finding cited.
- "Partly addressed": the new version moves toward it but leaves part of the gap open.
- "Still open": the new version does not address it.
- "No longer applicable": the passage or the situation the finding described is gone from the new version, so the finding no longer bears on it.
Give one sentence of evidence referring to the NEW version. Quote the new version where it helps. Never quote or guess at the earlier version's wording.

NEW CONCERNS
List the ids of findings in the new review that raise something the earlier findings did not.

SUMMARY
Two sentences at most: what the new version fixed, and what still stands. State it plainly. Do not congratulate.

RULES
Never propose replacement wording, rewritten sentences, or a redraft; the author writes. Never invent facts. Do not treat a higher score as the goal: say what changed in substance.

OUTPUT
Return only the JSON object the schema describes.`;

const str = { type: "string" } as const;
export const COMPARE_SCHEMA = {
  type: "object",
  properties: {
    summary: str,
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: { finding_id: str, verdict: { type: "string", enum: [...VERDICTS] }, evidence: str },
        required: ["finding_id", "verdict", "evidence"],
        additionalProperties: false,
      },
    },
    new_concerns: { type: "array", items: str },
  },
  required: ["summary", "verdicts", "new_concerns"],
  additionalProperties: false,
} as const;

const ajv = new Ajv({ allErrors: false, strict: true });
const validateSchema = ajv.compile(COMPARE_SCHEMA);

export function buildCompareUserMessage(saved: SavedReview, request: EvaluationRequest, fresh: EvaluationResult): string {
  const earlier = saved.findings
    .map((f) =>
      [
        `${f.id} | ${f.severity} | ${DIMENSION_LABELS[f.dimension as keyof typeof DIMENSION_LABELS] ?? f.dimension}`,
        f.excerpt ? `  quoted from the earlier version: ${JSON.stringify(f.excerpt)}` : f.omission ? `  missing: ${f.omission}` : "",
        `  finding: ${f.finding}`,
        `  what would close it: ${f.recommended_action}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
  const newFindings = fresh.analysis.findings
    .map((f) => `${f.id} | ${f.severity} | ${f.dimension}\n  finding: ${f.finding}`)
    .join("\n\n");
  return [
    `EARLIER REVIEW (saved ${saved.saved_at.slice(0, 10)}; score ${saved.score} of 100)\n${earlier || "(no findings)"}`,
    `NEW VERSION OF THE DRAFT\n<<<\n${request.draft.trim()}\n>>>`,
    `FRESH REVIEW OF THE NEW VERSION (score ${fresh.score} of 100)\n${newFindings || "(no findings)"}`,
  ].join("\n\n");
}

export interface CompareOptions {
  config?: EngineConfig;
  client?: Anthropic;
  log?: (line: string) => void;
}

/** Everything after the provider call, shared with other runtimes. */
export function finishComparison(
  raw: unknown,
  saved: SavedReview,
  fresh: EvaluationResult,
  drift: string[],
  options: { requestId: string; provider: { provider: string; model: string }; usage: ModelUsage },
): ComparisonResult {
  if (!validateSchema(raw)) {
    const e = validateSchema.errors?.[0];
    throw new EngineError("validation", "The comparison did not return in the expected format. Try again.", options.requestId, {
      path: e?.instancePath ?? "/",
    });
  }
  const parsed = raw as Comparison;
  const knownEarlier = new Set(saved.findings.map((f) => f.id));
  const knownNew = new Set(fresh.analysis.findings.map((f) => f.id));
  const before = new Map(saved.dimensions.map((d) => [d.id, d.score]));
  const movements: DimensionMovement[] = fresh.analysis.dimensions
    .filter((d) => before.has(d.id))
    .map((d) => ({
      id: d.id,
      label: DIMENSION_LABELS[d.id],
      before: before.get(d.id)!,
      after: d.score,
    }));
  return {
    summary: parsed.summary,
    verdicts: parsed.verdicts.filter((v) => knownEarlier.has(v.finding_id)),
    new_concerns: parsed.new_concerns.filter((id) => knownNew.has(id)),
    request_id: options.requestId,
    score_before: saved.score,
    score_after: fresh.score,
    band_before: saved.band,
    band_after: fresh.band,
    movements,
    drift,
    provider: options.provider,
    usage: options.usage,
  };
}

export async function compareWithSaved(
  saved: SavedReview,
  request: EvaluationRequest,
  fresh: EvaluationResult,
  drift: string[],
  options: CompareOptions = {},
): Promise<ComparisonResult> {
  const config = options.config ?? getEngineConfig();
  const requestId = newRequestId();
  const call = await callModel({
    system: [{ text: COMPARE_SYSTEM_PROMPT }],
    user: buildCompareUserMessage(saved, request, fresh),
    config,
    client: options.client,
    requestId,
    schema: COMPARE_SCHEMA,
    log: options.log,
  });
  let raw: unknown;
  try {
    raw = JSON.parse(call.text);
  } catch (error) {
    throw new EngineError("invalid_json", "The comparison did not return in the expected format. Try again.", requestId, error);
  }
  return finishComparison(raw, saved, fresh, drift, {
    requestId,
    provider: { provider: config.provider, model: call.model },
    usage: call.usage,
  });
}
