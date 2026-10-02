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
 *   figure found in that material and not in the draft is dropped, and so is
 *   one that repeats a run of AI_SUMMARY_PHRASE_WORDS or more words from it
 *   carrying a telling word the draft never uses.
 *
 * The limits of the second check, stated plainly: it catches copied figures
 * and phrases, not a leak the model has fully reworded; and a copied phrase
 * whose every telling word also appears somewhere in the draft passes.
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

/**
 * Words that never make a copied run telling on their own: grammar words,
 * pronouns, auxiliaries and the commonest verbs.
 *
 * Without it, a draft that restates its own context closely lost honest
 * summaries. On the Arcadia test, "No decisions have been made about jobs,
 * leadership, products or prices" is the context's sentence, and the draft
 * says the same thing in other words; the only word the draft lacks is
 * "made". The verbs are here for that reason: a run is evidence of a leak
 * only through a word that carries meaning.
 */
const COMMON_WORDS = new Set(
  `a an the and or but nor so yet if then than that this these those there here
  of in on at to for from by with about into onto over under after before until since during without within
  across against among between through per via up down out off as not no any all some each every both either neither
  is are was were be been being am has have had having do does did done doing will would shall should can could may might must
  it its it's they them their theirs we us our ours you your yours he him his she her hers i me my mine who whom whose which what
  when where why how also only just very more most less least much many such same other another own new
  make makes made making get gets got take takes took taken give gives gave given say says said set sets put
  go goes went gone come comes came keep keeps kept one two three first last next still now today`
    .split(/\s+/)
    .filter(Boolean),
);

/** Space-padded so a containment check matches whole words only. */
const joined = (words: string[]): string => ` ${words.join(" ")} `;

/**
 * Why the summary must go, or null when it may stay.
 *
 * "context_number": a figure in the summary appears in the private material
 * and nowhere in the draft. "context_phrase": a run of at least
 * AI_SUMMARY_PHRASE_WORDS words does, and at least one word in it is telling —
 * not a common word, and not a word the draft uses anywhere. A figure or
 * phrase the draft also carries is fine, whatever else also carries it.
 *
 * Words are compared in the form written: "rule" and "rules" differ, so a
 * doubtful case is dropped rather than kept.
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
  const draftWords = wordsIn(request.draft);
  const draft = joined(draftWords);
  const draftVocabulary = new Set(draftWords);
  const telling = (word: string) => !COMMON_WORDS.has(word) && !draftVocabulary.has(word);
  const privates = sources.map((s) => joined(wordsIn(s)));
  const words = wordsIn(summary);
  // Every run is looked at, not only the first: one copied run can be
  // harmless while a later one is not.
  for (let start = 0; start + AI_SUMMARY_PHRASE_WORDS <= words.length; start++) {
    // Each run from here that some private source carries, shortest first.
    for (let end = start + AI_SUMMARY_PHRASE_WORDS; end <= words.length; end++) {
      const run = words.slice(start, end);
      const text = joined(run);
      if (!privates.some((p) => p.includes(text))) break;
      if (!draft.includes(text) && run.some(telling)) return "context_phrase";
    }
  }
  return null;
}
