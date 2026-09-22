/**
 * Turns a protocol file into the block the engine sends (step 4).
 *
 * Written here rather than by hand in each file for two reasons. Prose written
 * per protocol drifts: thirteen authors phrase the same instruction thirteen
 * ways and the engine reads thirteen slightly different rules. And the rules
 * that must never vary — a protocol raises findings, never a section of its
 * own; it never proposes wording; it never states a legal conclusion — belong
 * in one place where they cannot be quietly dropped by whoever writes the next
 * file.
 *
 * The owner's file says what to look for. This says how to say it.
 */
import type { ProtocolFile } from "./protocolFormat.js";

function reviewNote(review: string[] | undefined): string {
  if (!review || review.length === 0) return "";
  return `; review ${review.join(" or ")}`;
}

export function buildProtocolBlock(p: ProtocolFile, failureEvent: boolean): string {
  const lines: string[] = [`${p.name.toUpperCase()} (${p.layer} protocol)`];

  const elements = p.elements.filter((e) => e.only_when !== "failure" || failureEvent);
  if (elements.length > 0) {
    lines.push("", "ELEMENTS");
    for (const e of elements) {
      const weight = e.weight === "core" ? "" : ", supporting";
      lines.push(`- ${e.name} (${e.dimension}${weight}). ${e.means}`);
    }
  }

  if (p.triggers.length > 0) {
    lines.push("", "HIGH-SEVERITY TRIGGERS");
    for (const t of p.triggers) {
      lines.push(`- ${t.check} (${t.dimension}${reviewNote(t.review)})`);
    }
  }

  if (p.questions.length > 0) {
    lines.push("", "QUESTIONS");
    for (const q of p.questions) {
      lines.push(`- ${q.ask}${q.review && q.review.length > 0 ? ` (${q.review.join(", ")})` : ""}`);
    }
  }

  if (p.narrows && p.narrows.length > 0) {
    lines.push("", "NARROWS THIS CORE CHECK");
    for (const n of p.narrows) lines.push(`- ${n}`);
  }

  return lines.join("\n");
}

/**
 * What the sections above mean, and the rules every protocol obeys. Sent once,
 * however many protocols apply.
 *
 * Everything here used to be repeated inside each block: the framing sentence
 * before each list, the candidates-not-obligations rule, the closing rules.
 * That was around ninety words per protocol saying the same thing to a reader
 * who had already agreed, and with a core, an event and a posture all applying
 * it was the difference between fitting the budget and not. Once is also
 * safer: there is one copy to keep correct, and no way for a protocol file to
 * ship a softened version of a rule that is not negotiable.
 */
export const PROTOCOL_RULES = `HOW TO APPLY THE PROTOCOLS ABOVE
A protocol applies to this draft because of the event or the goal the author selected. Where more than one applies, the core comes first and covers every high-stakes event; the others add only what is distinctive and do not repeat it.

ELEMENTS are what a credible communication of that kind contains. The dimension in brackets is the one each bears on.
HIGH-SEVERITY TRIGGERS are gaps to raise as High-severity findings when the draft meets them, on the dimension named. Where a review type is named, set specialist_review_needed true with that type.
QUESTIONS are candidates for questions_before_publication, not obligations: include one only where this draft leaves it genuinely open, and let it compete with the questions the draft itself raises. A question the draft already answers is noise.
NARROWS THIS CORE CHECK means that event makes the named core check unsafe to assert; raise it as a question rather than a finding.

The protocols are a lens on the ten dimensions you already score, never an eleventh score and never a section of their own: raise what you find through the ordinary findings. Name the kind of information missing — a date, a named owner, the selection criteria — and never supply wording. Where a legal, consultation or disclosure obligation may apply, say that it may and that counsel must confirm; never state that a draft is compliant or non-compliant. A protocol tells you what to look for. It does not raise the finding or question caps.`;

export function protocolWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
