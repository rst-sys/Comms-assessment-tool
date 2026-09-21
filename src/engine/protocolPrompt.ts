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
  return ` Set specialist_review_needed true, type ${review.join(" or ")}.`;
}

export function buildProtocolBlock(p: ProtocolFile, failureEvent: boolean): string {
  const heading = p.name.toUpperCase();
  const lines: string[] = [heading];

  if (p.layer === "core") {
    lines.push(
      "This draft is about a high-stakes event, so the checks below apply whatever the event is. The protocol that follows adds what is distinctive to this one; it does not repeat these.",
    );
  } else if (p.layer === "posture") {
    lines.push("This draft takes a stance the following checks apply to, on top of whatever event it concerns.");
  }

  const elements = p.elements.filter((e) => e.only_when !== "failure" || failureEvent);
  if (elements.length > 0) {
    lines.push("", "What a credible communication of this kind contains, and the dimension each bears on:");
    for (const e of elements) {
      const weight = e.weight === "core" ? "" : " (supporting)";
      lines.push(`- ${e.name}${weight}: ${e.means} Bears on ${e.dimension}.`);
    }
  }

  if (p.triggers.length > 0) {
    lines.push("", "Raise a High-severity finding when any of these is true:");
    for (const t of p.triggers) {
      lines.push(`- ${t.check} (${t.dimension})${reviewNote(t.review)}`);
    }
  }

  if (p.questions.length > 0) {
    lines.push(
      "",
      "Consider these among the questions before publication. They are candidates, not obligations: include one only where this draft leaves it genuinely open.",
    );
    for (const q of p.questions) {
      const who = q.review && q.review.length > 0 ? ` (${q.review.join(", ")})` : "";
      lines.push(`- ${q.ask}${who}`);
    }
  }

  if (p.narrows && p.narrows.length > 0) {
    lines.push("", "This event narrows the following core check. Raise it as a question rather than a finding:");
    for (const n of p.narrows) lines.push(`- ${n}`);
  }

  return lines.join("\n");
}

/**
 * The rules every protocol obeys, sent once however many protocols apply.
 *
 * Repeating them inside each block cost ninety words per protocol and said the
 * same thing twice to a reader who had already agreed. Once is also safer:
 * there is one copy to keep correct, and no way for a protocol file to ship a
 * softened version of a rule that is not negotiable.
 */
export const PROTOCOL_RULES = `HOW TO APPLY THE PROTOCOLS ABOVE
They are a lens on the ten dimensions you already score, never an eleventh score and never a section of their own: raise what you find through the ordinary findings, on the dimension each check names. Name the kind of information missing — a date, a named owner, the selection criteria — and never supply wording. Where a legal, consultation or disclosure obligation may apply, say that it may and that counsel must confirm; never state that a draft is compliant or non-compliant. A protocol tells you what to look for. It does not raise the finding or question caps.`;

export function protocolWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
