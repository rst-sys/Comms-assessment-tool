/**
 * The "How an AI assistant might summarize this" field: the code-side rules.
 *
 * The summary is an illustration of how an outside assistant, reading only
 * what was published, might sum the draft up. Two things make it worse than
 * useless, and code checks both rather than trusting the prompt alone:
 *
 * - A malformed or rambling summary. Missing, empty, not text, or over
 *   AI_SUMMARY_MAX_WORDS words: dropped. The prompt asks for about sixty, and
 *   the provider's grammar cannot cap a string's length (see schema.ts).
 * - A summary that knows what the public will not. The model reads the
 *   context box and any attached documents in the same request as the draft,
 *   so it can carry a fact from them into a summary of a draft that never
 *   states it. An outside assistant could not. So a summary that repeats a
 *   figure, or a run of AI_SUMMARY_PHRASE_WORDS or more words, found in that
 *   material and not in the draft is dropped.
 *
 * The limit of the second check, stated plainly: it catches copied figures
 * and phrases, not a leak the model has fully reworded.
 *
 * Every drop is quiet. The review stands without the section, and the reason
 * is logged as a `repaired:` code, never the text.
 */
import { countWords } from "./limits.js";
import type { EvaluationRequest } from "./types.js";

export const AI_SUMMARY_MAX_WORDS = 80;
export const AI_SUMMARY_PHRASE_WORDS = 4;

/**
 * The summary as the review will carry it, or undefined to drop it. Records
 * why in `repairs` when it is dropped.
 */
export function normalizeAiSummary(value: unknown, repairs: string[]): string | undefined {
  if (value === undefined || value === null) {
    repairs.push("ai_summary_missing");
    return undefined;
  }
  if (typeof value !== "string") {
    repairs.push("ai_summary_malformed");
    return undefined;
  }
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length === 0) {
    repairs.push("ai_summary_empty");
    return undefined;
  }
  if (countWords(text) > AI_SUMMARY_MAX_WORDS) {
    repairs.push("ai_summary_too_long");
    return undefined;
  }
  return text;
}

/** Everything the model saw that a reader of the published draft would not. */
function privateSources(request: EvaluationRequest): string[] {
  return [
    request.context,
    request.main_announcement,
    request.event_description,
    request.format_description,
    ...(request.audience_documents ?? []).flatMap((d) => [d.title, d.description, d.delivery, d.text]),
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

/** Figures as digits, with thousands separators removed so "1,200" and "1200" match. */
function numbersIn(text: string): Set<string> {
  return new Set((text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, "")));
}

/** Lower-case words, with curly apostrophes made straight so both spellings match. */
function wordsIn(text: string): string[] {
  return (text.toLowerCase().replace(/[‘’]/g, "'").match(/[\p{L}\p{N}]+(?:'[\p{L}]+)*/gu) ?? []);
}

/** Space-padded so a containment check matches whole words only. */
const joined = (words: string[]): string => ` ${words.join(" ")} `;

/**
 * Why the summary must go, or null when it may stay.
 *
 * "context_number": a figure in the summary appears in the private material
 * and nowhere in the draft. "context_phrase": a run of at least
 * AI_SUMMARY_PHRASE_WORDS words does. A figure or phrase the draft also
 * carries is fine, whatever else also carries it.
 */
export function aiSummaryLeak(summary: string, request: EvaluationRequest): "context_number" | "context_phrase" | null {
  const sources = privateSources(request);
  if (sources.length === 0) return null;
  const privateText = sources.join("\n");

  const draftNumbers = numbersIn(request.draft);
  const privateNumbers = numbersIn(privateText);
  for (const n of numbersIn(summary)) {
    if (privateNumbers.has(n) && !draftNumbers.has(n)) return "context_number";
  }

  // Each source is searched on its own, so a run cannot be stitched together
  // across the end of one document and the start of the next.
  const draft = joined(wordsIn(request.draft));
  const privates = sources.map((s) => joined(wordsIn(s)));
  const words = wordsIn(summary);
  for (let start = 0; start + AI_SUMMARY_PHRASE_WORDS <= words.length; start++) {
    // The longest run from here that some private source carries.
    for (let end = start + AI_SUMMARY_PHRASE_WORDS; end <= words.length; end++) {
      const run = joined(words.slice(start, end));
      if (!privates.some((p) => p.includes(run))) break;
      if (!draft.includes(run)) return "context_phrase";
    }
  }
  return null;
}
