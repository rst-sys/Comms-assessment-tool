/**
 * Engine configuration, read from the environment. The privacy panel reads
 * provider and model from here; nothing about the provider is hardcoded in
 * the UI.
 */
export const EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"] as const;
export type Effort = (typeof EFFORT_LEVELS)[number];

export interface EngineConfig {
  /** Provider name shown in the privacy panel. */
  provider: "Anthropic";
  /** Model id sent on every request. */
  model: string;
  /** Reasoning effort. The provider rejects sampling temperature on this model, so effort is the determinism lever. */
  effort: Effort;
  /** Output ceiling for the analysis JSON. */
  maxOutputTokens: number;
  /**
   * Provider retention term shown in the privacy panel. Read from config so the
   * UI shows the provider's actual term for the endpoint in use.
   */
  trainingTerm: string;
  processingMode: string;
}

export const DEFAULT_MODEL = "claude-opus-5";

/**
 * Environment variable names the engine accepts for the provider credential,
 * in order of precedence. `ACR_API_KEY` exists because some hosted
 * environments reserve `ANTHROPIC_API_KEY` for their own session auth and
 * refuse to set it; `ANTHROPIC_API_KEY` remains for local development.
 */
export const API_KEY_ENV_VARS = ["ACR_API_KEY", "ANTHROPIC_API_KEY"] as const;

/** The configured credential, or undefined when neither variable is set. Never log the value. */
export function resolveApiKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  for (const name of API_KEY_ENV_VARS) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getEngineConfig(env: NodeJS.ProcessEnv = process.env): EngineConfig {
  const effortRaw = (env.ACR_EFFORT ?? "high").toLowerCase();
  if (!(EFFORT_LEVELS as readonly string[]).includes(effortRaw)) {
    throw new Error(`ACR_EFFORT must be one of ${EFFORT_LEVELS.join(", ")}`);
  }
  const maxTokensRaw = env.ACR_MAX_OUTPUT_TOKENS ?? "16000";
  const maxOutputTokens = Number.parseInt(maxTokensRaw, 10);
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 4000) {
    throw new Error("ACR_MAX_OUTPUT_TOKENS must be an integer of at least 4000");
  }
  return {
    provider: "Anthropic",
    model: env.ACR_MODEL?.trim() || DEFAULT_MODEL,
    effort: effortRaw as Effort,
    maxOutputTokens,
    trainingTerm: env.ACR_TRAINING_TERM?.trim() || "Not used to train models",
    processingMode: env.ACR_PROCESSING_MODE?.trim() || "Zero-retention API",
  };
}
