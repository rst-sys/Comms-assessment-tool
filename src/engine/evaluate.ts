/**
 * The evaluation loop: build the prompt, call the model, parse, validate,
 * enforce the code-side constraints, compute the score. A reply the engine
 * cannot use costs one more call, not the whole review.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { normalizeAnalysis } from "./normalize.js";
import { callModel, EngineError, newRequestId, type EngineErrorKind, type ModelUsage } from "./client.js";
import { getEngineConfig, type EngineConfig } from "./config.js";
import { buildSystemBlocks, buildUserMessage, type SystemBlock } from "./prompt.js";
import { resolveProtocols } from "./protocols.js";
import { computeScore, confidenceLabel, scoreBand, type BandName } from "./scoring.js";
import { MAX_FINDINGS, MIN_QUESTIONS } from "./limits.js";
import type { Analysis, EvaluationRequest } from "./types.js";
import { AnalysisValidationError, validateAnalysis, type ValidationAdjustments } from "./validate.js";

export interface EvaluationResult {
  request_id: string;
  /**
   * Which protocol versions this review was run against.
   *
   * A score without it is a number nobody can re-derive: the protocols change,
   * and six months later there is no way to tell whether a draft scored badly
   * or was judged by a different standard.
   */
  bundle_hash: string;
  analysis: Analysis;
  /** Accountable Communication Score, 0-100. */
  score: number;
  band: BandName;
  confidence_label: string;
  adjustments: ValidationAdjustments;
  provider: { provider: string; model: string };
  usage: ModelUsage;
}

export interface EvaluateOptions {
  config?: EngineConfig;
  client?: Anthropic;
  /** Receives log lines that are safe to print: kinds, counts and the hashed request id only. */
  log?: (line: string) => void;
}

export function assertRequest(request: EvaluationRequest): void {
  if (typeof request.draft !== "string" || request.draft.trim().length === 0) {
    throw new Error("draft is required");
  }
}

export interface FinishOptions {
  requestId: string;
  provider: { provider: string; model: string };
  usage: ModelUsage;
  log?: (line: string) => void;
}

/**
 * Everything after the provider call: validate, enforce the code-side
 * constraints, compute the score. Shared by the API path and any other
 * runtime that obtains the raw analysis object another way.
 */
export function finishEvaluation(raw: unknown, request: EvaluationRequest, options: FinishOptions): EvaluationResult {
  const { requestId } = options;
  const log = options.log ?? (() => {});
  let validated;
  try {
    validated = validateAnalysis(raw, request.draft, request.context);
  } catch (error) {
    if (error instanceof AnalysisValidationError) {
      // The path names the offending field and nothing from the draft, so it
      // travels with the message. Without it a validation failure is a dead
      // end for whoever is trying to fix it.
      log(`[${requestId}] validation failed at ${error.path}`);
      throw new EngineError(
        "validation",
        `The analysis did not return in the expected format (at ${error.path}). Try again.`,
        requestId,
        error,
      );
    }
    throw error;
  }

  const { analysis, adjustments } = validated;
  if (adjustments.dropped_findings > 0) {
    log(`[${requestId}] dropped ${adjustments.dropped_findings} finding(s) with non-verbatim excerpts`);
  }
  if (adjustments.thin_questions > 0) {
    log(`[${requestId}] only ${adjustments.thin_questions} question(s) returned, below the ${MIN_QUESTIONS} asked for`);
  }
  if (adjustments.trimmed_findings > 0) {
    log(`[${requestId}] trimmed ${adjustments.trimmed_findings} finding(s) past the ${MAX_FINDINGS}-finding cap`);
  }

  const score = computeScore(analysis.dimensions);
  return {
    request_id: requestId,
    bundle_hash: resolveProtocols(request).hash,
    analysis,
    score,
    band: scoreBand(score),
    confidence_label: confidenceLabel(analysis.executive_summary.context_supplied),
    adjustments,
    provider: options.provider,
    usage: options.usage,
  };
}

/**
 * Faults a second attempt can fix.
 *
 * All four mean the same thing: the provider wrote a reply the engine cannot
 * use. Nothing about the request is wrong, so asking again is not a retry in
 * the usual sense — it is the same question, and the odds of a second bad
 * reply are the square of the first. Auth, refusals, rate limits and overload
 * are excluded: a second immediate call to those fails the same way and wastes
 * another minute of the reader's time.
 */
const WORTH_ASKING_AGAIN: ReadonlySet<EngineErrorKind> = new Set(["validation", "invalid_json", "truncated", "no_text"]);

/** How many times the engine will ask. Two: one retry, never a loop. */
export const MAX_ATTEMPTS = 2;

export async function evaluateDraft(request: EvaluationRequest, options: EvaluateOptions = {}): Promise<EvaluationResult> {
  assertRequest(request);
  const config = options.config ?? getEngineConfig();
  const log = options.log ?? (() => {});
  const requestId = newRequestId();

  const system = buildSystemBlocks(request);
  const user = buildUserMessage(request);

  for (let attempt = 1; ; attempt++) {
    try {
      return await askOnce({ request, system, user, config, requestId, log, client: options.client });
    } catch (error) {
      const again = attempt < MAX_ATTEMPTS && error instanceof EngineError && WORTH_ASKING_AGAIN.has(error.kind);
      if (!again) throw error;
      log(`[${requestId}] attempt ${attempt} came back unusable (${(error as EngineError).kind}); asking once more`);
    }
  }
}

interface AskOptions {
  request: EvaluationRequest;
  system: SystemBlock[];
  user: string;
  config: EngineConfig;
  requestId: string;
  log: (line: string) => void;
  client?: Anthropic;
}

/** One call to the provider, parsed, validated and scored. */
async function askOnce({ request, system, user, config, requestId, log, client }: AskOptions): Promise<EvaluationResult> {
  const call = await callModel({ system, user, config, client, requestId, log });

  let raw: unknown;
  try {
    raw = JSON.parse(call.text);
  } catch (error) {
    throw new EngineError("invalid_json", "The analysis did not return in the expected format. Try again.", requestId, error);
  }
  // Normalized on this path too, not only on the claude.ai page. The provider's
  // grammar no longer carries the permitted values (see schema.ts), so the
  // casing repair both runtimes need now happens in one place for both.
  return finishEvaluation(normalizeAnalysis(raw), request, {
    requestId,
    provider: { provider: config.provider, model: call.model },
    usage: call.usage,
    log,
  });
}
