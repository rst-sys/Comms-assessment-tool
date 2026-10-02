/**
 * The single provider call. One configured endpoint, no fallback provider,
 * no retry to a different model. Errors carry a kind and a hashed request id
 * and never the draft or the response body.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createHash, randomUUID } from "node:crypto";
import { ANALYSIS_SCHEMA, relaxForProvider } from "./schema.js";
import { API_KEY_ENV_VARS, resolveApiKey, type EngineConfig } from "./config.js";
import type { SystemBlock } from "./prompt.js";

export type EngineErrorKind =
  | "auth"
  | "refusal"
  | "truncated"
  | "no_text"
  | "invalid_json"
  | "api"
  | "validation";

/**
 * The provider's own explanation of a rejected request, for recognising known
 * reasons in code. It is free text the provider writes, so it is never logged
 * or shown: see providerErrorSummary for what the log gets.
 */
export function providerDetail(error: unknown): string {
  const body = (error as { error?: unknown })?.error;
  const nested = (body as { error?: { message?: unknown } })?.error?.message;
  const flat = (body as { message?: unknown })?.message;
  const raw =
    typeof nested === "string" ? nested
    : typeof flat === "string" ? flat
    : error instanceof Error ? error.message
    : "";
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "no detail given";
  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

/** Reasons the operator needs to tell apart, matched in the provider's text and logged as fixed labels. */
const KNOWN_PROVIDER_REASONS: [RegExp, string][] = [
  [/credit balance/i, "low_credit"],
  [/grammar is too large/i, "schema_too_large"],
  [/prompt is too long/i, "prompt_too_long"],
  [/overloaded/i, "overloaded"],
];

/**
 * What the log may say about a rejected provider call: the status number, the
 * provider's error code, a fixed label for a reason we recognise, and the
 * provider's own reference. Each part is checked against a strict pattern, so
 * nothing the provider wrote in free text — which could in principle quote the
 * request — ever reaches the log.
 */
export function providerErrorSummary(error: unknown): string {
  const e = error as { status?: unknown; error?: { error?: { type?: unknown } }; requestID?: unknown };
  const status = typeof e?.status === "number" ? String(e.status) : "unknown";
  const type = e?.error?.error?.type;
  const code = typeof type === "string" && /^[a-z_]{1,40}$/.test(type) ? type : "no_code";
  const detail = providerDetail(error);
  const reason = KNOWN_PROVIDER_REASONS.find(([pattern]) => pattern.test(detail))?.[1];
  const ref = typeof e?.requestID === "string" && /^req_[A-Za-z0-9]{1,64}$/.test(e.requestID) ? e.requestID : null;
  return `provider error ${status} ${code}${reason ? ` (${reason})` : ""}${ref ? `, provider ref ${ref}` : ""}`;
}

export class EngineError extends Error {
  readonly name = "EngineError";
  constructor(
    readonly kind: EngineErrorKind,
    message: string,
    readonly requestId: string,
    readonly cause?: unknown,
  ) {
    super(message);
  }
}

export interface ModelUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number | null;
  cache_creation_input_tokens: number | null;
}

export interface ModelCallResult {
  /** The raw JSON text returned by the model. Never log this. */
  text: string;
  model: string;
  usage: ModelUsage;
  requestId: string;
  /** Wall-clock time spent inside the provider call, for the latency log. */
  durationMs: number;
}

/** A short, non-reversible id for logs. */
export function newRequestId(): string {
  return createHash("sha256").update(randomUUID()).digest("hex").slice(0, 12);
}

export interface CallModelOptions {
  system: SystemBlock[];
  user: string;
  config: EngineConfig;
  /** Injected in tests; defaults to a client that resolves credentials from the environment. */
  client?: Anthropic;
  requestId?: string;
  /** Structured-output schema for this call. Defaults to the analysis schema. */
  schema?: Record<string, unknown>;
  /** Receives operational lines only; never the draft or the reply. */
  log?: (line: string) => void;
}

const NO_CREDENTIAL_MESSAGE = `No provider credential is configured. Set ${API_KEY_ENV_VARS.join(" or ")} (see README).`;

function makeClient(requestId: string): Anthropic {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new EngineError("auth", NO_CREDENTIAL_MESSAGE, requestId);
  }
  try {
    return new Anthropic({ apiKey });
  } catch (error) {
    throw new EngineError("auth", NO_CREDENTIAL_MESSAGE, requestId, error);
  }
}

/** The one provider rejection worth retrying differently rather than surfacing. */
export function isGrammarTooLarge(error: unknown): boolean {
  if (!(error instanceof Anthropic.APIError) || error.status !== 400) return false;
  return /grammar is too large/i.test(providerDetail(error));
}

/** The flag fast mode is served behind. */
export const FAST_MODE_BETA = "fast-mode-2026-02-01";

export async function callModel(options: CallModelOptions): Promise<ModelCallResult> {
  const requestId = options.requestId ?? newRequestId();
  const client = options.client ?? makeClient(requestId);
  const { config } = options;

  // Relaxed here, not at the call sites, so every caller gets a grammar the
  // provider will accept. Strict validation still runs on the reply.
  const schema = relaxForProvider(options.schema ?? ANALYSIS_SCHEMA) as Record<string, unknown>;

  const send = (withFormat: boolean): Promise<Anthropic.Message> => {
    const params = {
      model: config.model,
      max_tokens: config.maxOutputTokens,
      // Cache boundaries are chosen by whoever built the blocks: the framework
      // prompt, which every review shares, and the last block, so a second
      // review of the same event re-reads nothing. The draft lives in the user
      // message, after them both.
      system: options.system.map((b, i, all) =>
        b.cache ?? i === all.length - 1
          ? { type: "text" as const, text: b.text, cache_control: { type: "ephemeral" as const } }
          : { type: "text" as const, text: b.text },
      ),
      messages: [{ role: "user" as const, content: options.user }],
      output_config: withFormat
        ? { effort: config.effort, format: { type: "json_schema" as const, schema } }
        : { effort: config.effort },
    };
    // Fast mode is the same model at a higher output rate for a premium price,
    // and it lives on the beta endpoint behind its own flag.
    if (config.speed === "fast") {
      return client.beta.messages.create({
        ...params,
        speed: "fast",
        betas: [FAST_MODE_BETA],
      }) as unknown as Promise<Anthropic.Message>;
    }
    return client.messages.create(params);
  };

  const startedAt = Date.now();
  let response: Anthropic.Message;
  try {
    try {
      response = await send(true);
    } catch (error) {
      // The provider compiles the schema into a grammar with a size ceiling.
      // If this schema ever outgrows it again, drop the format and ask for the
      // JSON in prose instead of failing the review: the prompt already
      // specifies the shape, normalize.ts repairs the usual deviations, and
      // the strict validator still runs — which is exactly how the claude.ai
      // page has always worked, so the path is a proven one, not a guess.
      if (!isGrammarTooLarge(error)) throw error;
      options.log?.(`[${requestId}] schema grammar too large; retrying without the structured-output format`);
      response = await send(false);
    }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      options.log?.(`[${requestId}] provider rejected the credential (${error.status ?? "unknown"})`);
      throw new EngineError("auth", "The tool isn't set up to reach the AI service. Tell the owner.", requestId, error);
    }
    if (error instanceof Anthropic.APIError) {
      // The reader gets plain words; the status and codes go to the log,
      // under the same reference number.
      options.log?.(`[${requestId}] ${providerErrorSummary(error)}`);
      throw new EngineError("api", "The AI service turned the request down. Try again, or tell the owner the reference below.", requestId, error);
    }
    if (error instanceof Error && /Could not resolve authentication method/.test(error.message)) {
      // The SDK resolves credentials lazily and throws a plain Error at call time when none is configured.
      throw new EngineError("auth", NO_CREDENTIAL_MESSAGE, requestId, error);
    }
    throw new EngineError("api", "The AI service couldn't be reached. Try again.", requestId, error);
  }

  if (response.stop_reason === "refusal") {
    throw new EngineError("refusal", "The AI service declined to review this draft.", requestId);
  }
  if (response.stop_reason === "max_tokens" || response.stop_reason === "model_context_window_exceeded") {
    throw new EngineError("truncated", "The review was cut off before it finished. Try again.", requestId);
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (text.trim().length === 0) {
    throw new EngineError("no_text", "The review came back empty. Try again.", requestId);
  }

  const durationMs = Date.now() - startedAt;
  options.log?.(
    `[${requestId}] provider call ${Math.round(durationMs / 1000)}s ` +
      `(${response.usage.output_tokens} output tokens, effort ${config.effort}, speed ${config.speed})`,
  );

  return {
    text,
    durationMs,
    model: response.model,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? null,
      cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? null,
    },
    requestId,
  };
}
