/**
 * The evaluation loop: build the prompt, call the model once, parse, validate,
 * enforce the code-side constraints, compute the score.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { callModel, EngineError, newRequestId, type ModelUsage } from "./client.js";
import { getEngineConfig, type EngineConfig } from "./config.js";
import { buildSystemBlocks, buildUserMessage } from "./prompt.js";
import { computeScore, confidenceLabel, scoreBand, type BandName } from "./scoring.js";
import type { Analysis, EvaluationRequest } from "./types.js";
import { AnalysisValidationError, validateAnalysis, type ValidationAdjustments } from "./validate.js";

export interface EvaluationResult {
  request_id: string;
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
      log(`[${requestId}] validation failed at ${error.path}`);
      throw new EngineError("validation", "The analysis did not return in the expected format. Try again.", requestId, error);
    }
    throw error;
  }

  const { analysis, adjustments } = validated;
  if (adjustments.dropped_findings > 0) {
    log(`[${requestId}] dropped ${adjustments.dropped_findings} finding(s) with non-verbatim excerpts`);
  }
  if (adjustments.dropped_scan_phrases > 0) {
    log(`[${requestId}] dropped ${adjustments.dropped_scan_phrases} agency-scan phrase(s) not found in the draft`);
  }
  if (adjustments.readiness_overridden) {
    log(`[${requestId}] readiness moved off "Ready with minor edits" because specialist review is flagged`);
  }

  const score = computeScore(analysis.dimensions);
  return {
    request_id: requestId,
    analysis,
    score,
    band: scoreBand(score),
    confidence_label: confidenceLabel(analysis.executive_summary.context_supplied),
    adjustments,
    provider: options.provider,
    usage: options.usage,
  };
}

export async function evaluateDraft(request: EvaluationRequest, options: EvaluateOptions = {}): Promise<EvaluationResult> {
  assertRequest(request);
  const config = options.config ?? getEngineConfig();
  const log = options.log ?? (() => {});
  const requestId = newRequestId();

  const system = buildSystemBlocks(request);
  const user = buildUserMessage(request);

  const call = await callModel({ system, user, config, client: options.client, requestId });

  let raw: unknown;
  try {
    raw = JSON.parse(call.text);
  } catch (error) {
    throw new EngineError("invalid_json", "The analysis did not return in the expected format. Try again.", requestId, error);
  }
  return finishEvaluation(raw, request, { requestId, provider: { provider: config.provider, model: call.model }, usage: call.usage, log });
}
