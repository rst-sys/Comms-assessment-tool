/**
 * The claude.ai page runtime: the same app, reaching Claude through the
 * viewer's own claude.ai account via the page's `sample` capability instead
 * of the application server. No API key is involved; the viewer's usage is
 * spent and claude.ai asks their consent on the first call. There is no
 * network from such a page, so Import from URL is unavailable.
 */
import { ApiError, type ApiImplementation } from "../app/api.js";
import type { EvaluationRequest } from "../engine/types.js";
import type { PrivacyConfig } from "../app/PrivacyPanel.js";
import { finishEvaluation } from "../engine/evaluate.js";
import { EngineError } from "../engine/client.js";
import { COMPARE_SCHEMA, COMPARE_SYSTEM_PROMPT, buildCompareUserMessage, finishComparison } from "../engine/compare.js";
import { normalizeAnalysis } from "../engine/normalize.js";
import { settingsDrift } from "../engine/savedReview.js";
import { buildSystemBlocks, buildUserMessage } from "../engine/prompt.js";
import { ANALYSIS_SCHEMA } from "../engine/schema.js";

type SampleFn = ((input: string, opts?: Record<string, unknown>) => Promise<{ text: string; truncated: boolean; modelTierApplied: string }>) & {
  json: <T>(input: string, opts?: Record<string, unknown>) => Promise<T>;
};

declare global {
  interface Window {
    claude?: { use: (name: string) => Promise<unknown> };
  }
}

let samplePromise: Promise<SampleFn | null> | null = null;
function getSample(): Promise<SampleFn | null> {
  if (!samplePromise) {
    samplePromise = typeof window !== "undefined" && window.claude?.use ? (window.claude.use("sample") as Promise<SampleFn | null>) : Promise.resolve(null);
  }
  return samplePromise;
}

const FORMAT_ERROR = "The analysis did not return in the expected format. Try again.";

/** The page runtime accepts about 64 KiB of prompt. Audience context documents are trimmed, longest first, to stay under it. */
const PROMPT_BUDGET_BYTES = 60_000;
export function fitToPromptLimit(request: EvaluationRequest): EvaluationRequest {
  const size = (r: EvaluationRequest) => new TextEncoder().encode([...buildSystemBlocks(r).map((b) => b.text), buildUserMessage(r), schemaBlock(ANALYSIS_SCHEMA)].join("\n\n")).length;
  let docs = [...(request.audience_documents ?? [])];
  let current = { ...request, audience_documents: docs };
  let guard = 0;
  while (size(current) > PROMPT_BUDGET_BYTES && docs.some((d) => d.text.length > 500) && guard++ < 40) {
    const longest = docs.reduce((a, b) => (b.text.length > a.text.length ? b : a));
    docs = docs.map((d) => (d === longest ? { ...d, text: d.text.slice(0, Math.floor(d.text.length * 0.8)).trimEnd() + "\n[trimmed to fit this preview's size limit]" } : d));
    current = { ...request, audience_documents: docs };
  }
  return current;
}

function viewerMessage(code: string, fallback: string): string {
  switch (code) {
    case "not_granted":
    case "sampling_disabled":
    case "not_declared":
    case "capability_disabled":
    case "capability_removed":
      return "This page is not allowed to ask Claude in this view, so it cannot evaluate drafts here.";
    case "rate_limited":
      return "Claude is busy or your usage limit was reached. Wait a little and try again.";
    case "session_expired":
      return "Your claude.ai session has expired. Sign in again and retry.";
    case "refused":
      return "Claude declined to analyze this draft.";
    case "invalid_json":
    case "empty_completion":
      return FORMAT_ERROR;
    case "prompt_too_large":
      return "The draft and context are too long for this page. Shorten them and try again.";
    case "cancelled":
      return "The evaluation was stopped.";
    default:
      return fallback;
  }
}

function toApiError(e: unknown, fallback: string): ApiError {
  const suffix = ` Technical detail: ${detail(e)}.`;
  if (e instanceof EngineError) return new ApiError((e.kind === "validation" || e.kind === "invalid_json" ? FORMAT_ERROR : e.message) + suffix, 502, e.kind, e.requestId);
  const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "upstream_error";
  return new ApiError(viewerMessage(code, fallback) + suffix, 502, code);
}

function requestId(): string {
  return Math.random().toString(16).slice(2, 14);
}

function schemaBlock(schema: unknown): string {
  return [
    "JSON SCHEMA",
    "Reply with exactly one JSON object that satisfies this schema and nothing else. Write compact JSON on one line with no indentation, no line breaks inside strings, and no Markdown fence.",
    "Keep the answer short enough to finish: at most 8 findings, at most 8 questions, and every string field brief.",
    JSON.stringify(schema),
  ].join("\n");
}

/** A short, safe technical detail for the viewer to report: an error code or a validation path, never content. */
function detail(e: unknown): string {
  if (e instanceof EngineError) {
    const cause = e.cause as { path?: string } | undefined;
    return `${e.kind}${cause?.path ? ` at ${cause.path}` : ""}`;
  }
  if (typeof e === "object" && e !== null && "code" in e) {
    const err = e as { code: string; message?: string; text?: string };
    const cut = typeof err.text === "string" ? ` (reply ${err.text.length} characters)` : "";
    return `${err.code}${cut}`;
  }
  return "unknown";
}

const usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: null, cache_creation_input_tokens: null };

export const sampleApi: ApiImplementation = {
  async evaluate(request) {
    const sample = await getSample();
    if (!sample) throw new ApiError(viewerMessage("not_granted", ""), 503, "not_granted");
    const id = requestId();
    const fitted = fitToPromptLimit(request);
    const input = [...buildSystemBlocks(fitted).map((b) => b.text), buildUserMessage(fitted), schemaBlock(ANALYSIS_SCHEMA)].join("\n\n");
    let raw: unknown;
    try {
      raw = await sample.json(input, { modelTier: "complex" });
    } catch (e) {
      throw toApiError(e, "The evaluation failed. Try again.");
    }
    try {
      return finishEvaluation(normalizeAnalysis(raw), request, { requestId: id, provider: { provider: "Anthropic", model: "Claude via claude.ai (most capable tier)" }, usage, log: (l) => console.log(l) });
    } catch (e) {
      throw toApiError(e, "The evaluation failed. Try again.");
    }
  },

  async importUrl() {
    throw new ApiError("Import from URL is not available on this page. Paste the text instead.", 501, "unavailable");
  },

  async saveFile(filename, data) {
    const downloads = (await (window.claude?.use("downloads") ?? Promise.resolve(null))) as
      | { save: (r: { filename: string; data: Blob }) => Promise<{ status: string }> }
      | null;
    if (!downloads) throw new ApiError("Saving files is not available in this view.", 501, "unavailable");
    try {
      await downloads.save({ filename, data });
    } catch (e) {
      const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "unavailable";
      if (code === "declined") throw new ApiError("The save was cancelled.", 499, "declined");
      if (code === "rate_limited") throw new ApiError("A save is already waiting for your answer.", 429, "rate_limited");
      throw new ApiError("Saving files is not available in this view.", 501, code);
    }
  },

  async compare(saved, request, fresh) {
    const sample = await getSample();
    if (!sample) throw new ApiError(viewerMessage("not_granted", ""), 503, "not_granted");
    const id = requestId();
    const input = [COMPARE_SYSTEM_PROMPT, buildCompareUserMessage(saved, request, fresh), schemaBlock(COMPARE_SCHEMA)].join("\n\n");
    let raw: unknown;
    try {
      raw = await sample.json(input, { modelTier: "complex" });
    } catch (e) {
      throw toApiError(e, "The comparison failed. Try again.");
    }
    try {
      return finishComparison(raw, saved, fresh, settingsDrift(saved.settings, request), {
        requestId: id,
        provider: { provider: "Anthropic", model: "Claude via claude.ai (most capable tier)" },
        usage,
      });
    } catch (e) {
      throw toApiError(e, "The comparison failed. Try again.");
    }
  },

  async findPublicContext() {
    throw new ApiError("Web search is available in the hosted app, not on this page.", 501, "unavailable");
  },

  async fetchConfig(): Promise<PrivacyConfig | null> {
    return {
      provider: "Anthropic",
      model: "Claude via your claude.ai account (most capable tier)",
      processing_mode: "claude.ai page, using the viewer's own account",
      training_term: "Per your claude.ai account's data settings",
    };
  },
};
