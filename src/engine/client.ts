/**
 * The single provider call. One configured endpoint, no fallback provider,
 * no retry to a different model. Errors carry a kind and a hashed request id
 * and never the draft or the response body.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createHash, randomUUID } from "node:crypto";
import { ANALYSIS_SCHEMA } from "./schema.js";
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

export async function callModel(options: CallModelOptions): Promise<ModelCallResult> {
  const requestId = options.requestId ?? newRequestId();
  const client = options.client ?? makeClient(requestId);
  const { config } = options;

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxOutputTokens,
      // The verbatim system prompt is stable across requests; cache it. The
      // draft lives in the user message, after the cache breakpoint.
      system: options.system.map((b, i, all) =>
        i === all.length - 1
          ? { type: "text", text: b.text, cache_control: { type: "ephemeral" } }
          : { type: "text", text: b.text },
      ),
      messages: [{ role: "user", content: options.user }],
      output_config: {
        effort: config.effort,
        format: { type: "json_schema", schema: options.schema ?? ANALYSIS_SCHEMA },
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new EngineError("auth", "The provider rejected the configured credential.", requestId, error);
    }
    if (error instanceof Anthropic.APIError) {
      throw new EngineError("api", `Provider error ${error.status ?? "unknown"}: ${error.name}`, requestId, error);
    }
    if (error instanceof Error && /Could not resolve authentication method/.test(error.message)) {
      // The SDK resolves credentials lazily and throws a plain Error at call time when none is configured.
      throw new EngineError("auth", NO_CREDENTIAL_MESSAGE, requestId, error);
    }
    throw new EngineError("api", "The provider call failed.", requestId, error);
  }

  if (response.stop_reason === "refusal") {
    throw new EngineError("refusal", "The provider declined to analyze this draft.", requestId);
  }
  if (response.stop_reason === "max_tokens" || response.stop_reason === "model_context_window_exceeded") {
    throw new EngineError("truncated", "The analysis was cut off before it completed.", requestId);
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (text.trim().length === 0) {
    throw new EngineError("no_text", "The provider returned no analysis text.", requestId);
  }

  return {
    text,
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
