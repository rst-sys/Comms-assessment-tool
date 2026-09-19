/**
 * Minimal-Risk redraft (PROMPT.md Section 9): a second provider call with
 * the original draft, the findings, and the non-invention rule. The redraft
 * preserves the original's structure and tone and changes only what a
 * finding justifies. Where a fact is needed it uses a bracketed placeholder.
 * When the draft was already published, the redraft is a model for future
 * statements or a follow-up, not a fix to the original (Section 3).
 */
import type Anthropic from "@anthropic-ai/sdk";
import { Ajv } from "ajv";
import { callModel, EngineError, newRequestId, type ModelUsage } from "./client.js";
import { getEngineConfig, type EngineConfig } from "./config.js";
import { buildUserMessage, type SystemBlock } from "./prompt.js";
import { SYSTEM_PROMPT } from "./promptText.js";
import { rankFindings } from "./scoring.js";
import type { Analysis, EvaluationRequest, Finding } from "./types.js";

export interface RedraftChange {
  /** The finding that justifies the change, or null when it is a placeholder-only edit. */
  finding_id: string | null;
  /** The original text that was changed, verbatim, or an empty string for an insertion. */
  original: string;
  revised: string;
  reason: string;
}

export interface Redraft {
  revised_draft: string;
  change_log: RedraftChange[];
  /** Every bracketed placeholder in the revised draft, in order of first appearance. */
  placeholders: string[];
}

export interface RedraftResult extends Redraft {
  request_id: string;
  /** True when the original was already issued: the redraft is a model for a future statement or follow-up. */
  retrospective: boolean;
  provider: { provider: string; model: string };
  usage: ModelUsage;
}

/** The NON-INVENTION paragraph, verbatim from the Section 5 system prompt. */
export function nonInventionRule(): string {
  const match = /NON-INVENTION\n([\s\S]*?)\n\n/.exec(SYSTEM_PROMPT);
  return match ? `NON-INVENTION\n${match[1]}` : "";
}

export const REDRAFT_SYSTEM_PROMPT = `You are the Minimal-Risk redraft mode of Accountable Communications Review. You revise a draft communication so that it gives a better account of a decision, using the findings from an evaluation of that draft.

RULES
- This is a minimal-risk revision, not a rewrite. The result must read as the same message, corrected: the same paragraphs in the same order, the same tone, and roughly the same length. Keep every sentence that no finding touches exactly as it is.
- Change only what a finding justifies. Each change must trace to a finding id from the list you are given, or be a bracketed placeholder inserted where a finding says a fact is needed.
- Make the smallest change that resolves each finding: edit the sentence the finding cites rather than adding a new one, and let one edited sentence resolve several findings where it can. Add a new sentence only when no existing sentence can carry the fix, and add at most one short sentence per finding. Never add a paragraph, section, heading or closing note the original does not have.
- Length budget. The revision may be at most twice the original's length, or the original plus 120 words, whichever is larger. Work through the findings from the most severe down. When the next finding cannot be resolved within the budget, stop editing and record it in the change log with revised set to an empty string and the reason "Not resolved within a minimal revision; see the finding." A revision that leaves findings open is correct; a revision that grows into a new document is not.
- The findings come with suggested revisions. Use them as guidance for what must be present, not as text to paste in. Do not reproduce them wholesale.
- Do not add self-blame the context does not support. Do not add apologies, admissions or commitments that no finding calls for.
- Where a finding requires a fact you do not have, use a bracketed placeholder such as [accountable executive or team], [date], [metric], [update channel], [employee support information], [legal review]. Never invent the fact. Each placeholder is one bracketed phrase; never nest brackets or put a whole sentence or instruction in brackets.
- Use plain, active language that names who decided, who is affected and who owns what changes.

${nonInventionRule()}

RETROSPECTIVE DRAFTS
When the original has already been issued, write the revision as a model for a future statement or a follow-up message, not as a correction of the original. Keep it usable as a follow-up: it may open by acknowledging the earlier statement in one clause.

OUTPUT
Return only the JSON object the schema describes. revised_draft is the full revised text. change_log lists every change with the exact original text (or an empty string for a pure insertion), the revised text (or an empty string for a finding left unresolved), the finding id it resolves (or null for a placeholder-only insertion), and a one-sentence reason. placeholders lists every bracketed placeholder that appears in revised_draft.`;

const str = { type: "string" };
export const REDRAFT_SCHEMA = {
  type: "object",
  properties: {
    revised_draft: str,
    change_log: {
      type: "array",
      items: {
        type: "object",
        properties: {
          finding_id: { anyOf: [{ type: "string" }, { type: "null" }] },
          original: str,
          revised: str,
          reason: str,
        },
        required: ["finding_id", "original", "revised", "reason"],
        additionalProperties: false,
      },
    },
    placeholders: { type: "array", items: str },
  },
  required: ["revised_draft", "change_log", "placeholders"],
  additionalProperties: false,
} as const;

const ajv = new Ajv({ allErrors: false, strict: true });
const validateSchema = ajv.compile(REDRAFT_SCHEMA);

export class RedraftValidationError extends Error {
  readonly name = "RedraftValidationError";
  constructor(readonly path: string, message: string) {
    super(`${path || "/"}: ${message}`);
  }
}

/** Every [placeholder] in the text, in order of first appearance, without duplicates. */
export function extractPlaceholders(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of text.matchAll(/\[([^\[\]\n]{1,120})\]/g)) {
    const p = `[${m[1]!.trim()}]`;
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

/**
 * Validates the model's redraft and applies the code-side rules: the revised
 * draft is non-empty, change-log finding ids exist in the analysis (unknown
 * ids become null), and the placeholder list is recomputed from the revised
 * text so it is always complete.
 */
export function validateRedraft(raw: unknown, findings: ReadonlyArray<Finding>): Redraft {
  if (!validateSchema(raw)) {
    const e = validateSchema.errors?.[0];
    throw new RedraftValidationError(e?.instancePath ?? "/", e?.message ?? "invalid");
  }
  const input = raw as Redraft;
  const revised = input.revised_draft.trim();
  if (revised.length === 0) throw new RedraftValidationError("/revised_draft", "empty");
  const known = new Set(findings.map((f) => f.id));
  const change_log = input.change_log.map((c) => ({
    ...c,
    finding_id: c.finding_id !== null && known.has(c.finding_id) ? c.finding_id : null,
  }));
  return { revised_draft: revised, change_log, placeholders: extractPlaceholders(revised) };
}

function findingsBlock(findings: ReadonlyArray<Finding>): string {
  return rankFindings(findings)
    .map((f) =>
      [
        `${f.id} | ${f.severity} | ${f.dimension}`,
        f.excerpt !== null ? `  excerpt: ${JSON.stringify(f.excerpt)}` : `  omission: ${f.omission}`,
        `  finding: ${f.finding}`,
        `  recommended action: ${f.recommended_action}`,
        `  suggested revision: ${f.suggested_revision}`,
      ].join("\n"),
    )
    .join("\n\n");
}

export function buildRedraftUserMessage(request: EvaluationRequest, analysis: Analysis): string {
  const parts = [buildUserMessage(request), `FINDINGS TO RESOLVE\n${findingsBlock(analysis.findings) || "(no findings)"}`];
  if (request.already_published) {
    parts.push("NOTE\nThe original has already been issued. Write the revision as a model for a future statement or a follow-up, not as a fix to the original.");
  }
  return parts.join("\n\n");
}

export interface RedraftOptions {
  config?: EngineConfig;
  client?: Anthropic;
  log?: (line: string) => void;
}

export async function redraftMinimalRisk(
  request: EvaluationRequest,
  analysis: Analysis,
  options: RedraftOptions = {},
): Promise<RedraftResult> {
  const config = options.config ?? getEngineConfig();
  const log = options.log ?? (() => {});
  const requestId = newRequestId();
  const system: SystemBlock[] = [{ text: REDRAFT_SYSTEM_PROMPT }];
  const user = buildRedraftUserMessage(request, analysis);

  const call = await callModel({ system, user, config, client: options.client, requestId, schema: REDRAFT_SCHEMA });

  let raw: unknown;
  try {
    raw = JSON.parse(call.text);
  } catch (error) {
    throw new EngineError("invalid_json", "The revision did not return in the expected format. Try again.", requestId, error);
  }
  let redraft: Redraft;
  try {
    redraft = validateRedraft(raw, analysis.findings);
  } catch (error) {
    if (error instanceof RedraftValidationError) {
      log(`[${requestId}] redraft validation failed at ${error.path}`);
      throw new EngineError("validation", "The revision did not return in the expected format. Try again.", requestId, error);
    }
    throw error;
  }
  return {
    ...redraft,
    request_id: requestId,
    retrospective: request.already_published,
    provider: { provider: config.provider, model: call.model },
    usage: call.usage,
  };
}
