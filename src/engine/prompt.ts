/**
 * Builds the system blocks and the user message for the evaluation call
 * (PROMPT.md Sections 3, 5 and 10).
 */
import { LAYOFF_BLOCK, SYSTEM_PROMPT } from "./promptText.js";
import { CONTEXT_FIELDS, DIMENSION_IDS, type EvaluationRequest } from "./types.js";

/**
 * Structural notes that the provider's structured-output schema cannot carry.
 * Appended after the verbatim system prompt as its own block.
 */
export const OUTPUT_NOTES = `OUTPUT STRUCTURE
The JSON object must satisfy these counts and conventions in addition to the schema:
- schema_version is "1.0".
- dimensions contains exactly ten entries, one per id, in this order: ${DIMENSION_IDS.join(", ")}. Scores are multiples of 0.5 from 0.0 to 5.0.
- strongest_elements and priority_improvements each contain exactly three strings.
- findings use ids F-001, F-002, ... in order. excerpt is an exact, character-for-character substring of the draft, or null when the finding is an omission; omission is then a description of what is missing. Never leave both null.
- claim_status is set on findings for accountability_agency, causation_explanation and corrective_action_proof, and null elsewhere.
- agency_scan phrase is an exact substring of the draft. finding_id names the related finding or is null.
- devils_advocate.personas contains exactly five personas. The disclaimer is exactly: "These are plausible audience interpretations, not statements of fact."
- questions_before_publication contains between five and twelve questions.
- specialist_review_summary lists each review type named by any finding with specialist_review_needed true, without duplicates.`;

export interface SystemBlock {
  text: string;
}

/** System prompt blocks in order: verbatim prompt, optional layoff block, output notes. */
export function buildSystemBlocks(request: Pick<EvaluationRequest, "communication_type">): SystemBlock[] {
  const blocks: SystemBlock[] = [{ text: SYSTEM_PROMPT }];
  if (request.communication_type === "Layoff or restructuring") {
    blocks.push({ text: LAYOFF_BLOCK });
  }
  blocks.push({ text: OUTPUT_NOTES });
  return blocks;
}

const NOT_SUPPLIED = "(not supplied)";

function block(label: string, body: string): string {
  return `${label}\n${body}`;
}

/** The user message: the draft and every intake field as labeled blocks. */
export function buildUserMessage(request: EvaluationRequest): string {
  const parts: string[] = [];

  parts.push(block("DRAFT", `<<<\n${request.draft.trim()}\n>>>`));

  parts.push(
    block(
      "INTAKE",
      [
        `Communication type: ${request.communication_type}`,
        `Primary audience: ${request.primary_audience}`,
        `Setting: ${request.setting}`,
        `Market: ${request.market}`,
        `Goal: ${request.goal}`,
        `Audience scope: ${request.audience_scope}`,
        `heightened_review: ${request.heightened_review}`,
        `already_published: ${request.already_published}`,
      ].join("\n"),
    ),
  );

  const contextLines = CONTEXT_FIELDS.map(([key, label]) => {
    const value = request.context[key]?.trim();
    return `${label}: ${value ? value : NOT_SUPPLIED}`;
  });
  const anyContext = CONTEXT_FIELDS.some(([key]) => (request.context[key] ?? "").trim().length > 0);
  parts.push(
    block(
      "CONTEXT (what the engine can rely on; these fields are the only ground truth)",
      (anyContext ? "" : "No context fields were supplied. Score agency and causation on the draft's language only and say so.\n") +
        contextLines.join("\n"),
    ),
  );

  const notes: string[] = [];
  if (request.already_published) {
    notes.push(
      "This draft has already been issued. Frame findings retrospectively, describing what may have left readers unclear rather than what to change before issuing. Any suggested revision is a model for future statements or a follow-up, not a fix to the original.",
    );
  }
  if (request.heightened_review) {
    notes.push("heightened_review is true. Apply the stricter thresholds described in HEIGHTENED REVIEW.");
  }
  if (notes.length > 0) parts.push(block("NOTES", notes.join("\n")));

  return parts.join("\n\n");
}
