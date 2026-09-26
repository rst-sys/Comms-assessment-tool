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
import { FRAMEWORK_NARROWABLE, type ProtocolFile } from "./protocolFormat.js";
import { PROTOCOL_LIBRARY } from "./protocolLibrary.js";

/**
 * Element ids to their name and layer, so a narrowing line can say which
 * check it folds into and where that check comes from.
 *
 * Every layer, not just the core: a family states a check generally and an
 * event protocol sharpens it, the same relationship the core has with the
 * layers below it.
 */
const ELEMENTS_BY_ID: Record<string, { name: string; layer: string }> = Object.fromEntries(
  PROTOCOL_LIBRARY.flatMap((p) => p.elements.map((e) => [e.id, { name: e.name, layer: p.layer }] as const)),
);

/** What a protocol says when it carries the sharper form of a check above it. */
function narrowsNote(target: string): string {
  const found = ELEMENTS_BY_ID[target];
  const where = found ? `${found.layer} check` : "check";
  return `sharper form of the ${where} "${found?.name ?? target}" — one finding, not two`;
}

function reviewNote(review: string[] | undefined): string {
  if (!review || review.length === 0) return "";
  return `; review ${review.join(" or ")}`;
}

export function buildProtocolBlock(p: ProtocolFile): string {
  const lines: string[] = [`${p.name.toUpperCase()} (${p.layer} protocol)`];

  const elements = p.elements;
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
      const narrows = t.narrows ? `; ${narrowsNote(t.narrows)}` : "";
      lines.push(`- ${t.check} (${t.dimension}${narrows}${reviewNote(t.review)})`);
    }
  }

  // A protocol's questions are NOT sent. They are fixed text the model could
  // only choose among — twenty-two candidates for eight slots, so most were
  // discarded and the survivors changed between runs of the same draft. The
  // app shows all of them instead, grouped by reviewer, from the same resolved
  // bundle (see checklist.ts). What the model still writes is the questions
  // this particular draft raises, which is the part that needs judgment.

  const framework = (p.narrows ?? []).filter((n) => n in FRAMEWORK_NARROWABLE);
  const core = (p.narrows ?? []).filter((n) => n.startsWith("core."));
  if (framework.length > 0) {
    lines.push("", "NARROWS THIS FRAMEWORK CHECK");
    for (const n of framework) lines.push(`- ${FRAMEWORK_NARROWABLE[n] ?? n}`);
  }
  if (core.length > 0) {
    lines.push("", "NARROWS THIS CORE CHECK");
    for (const n of core) lines.push(`- ${narrowsNote(n)}`);
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
A protocol applies to this draft because of the event or the goal the author selected. It adds what is distinctive to that event or stance; the framework above already covers what every draft must account for, and a protocol does not repeat it.

ELEMENTS are what a credible communication of that kind contains. The dimension in brackets is the one each bears on.
HIGH-SEVERITY TRIGGERS are gaps to raise as High-severity findings when the draft meets them, on the dimension named. Where a review type is named, set specialist_review_needed true with that type.
NARROWS THIS FRAMEWORK CHECK means the event makes the named requirement unsafe to assert; raise it as a question rather than a finding.
NARROWS THIS CORE CHECK, and the same note on a single trigger, means this protocol carries the sharper, event-specific reading of a check a layer above it states generally. Apply this protocol's reading. Where the same gap in the draft would satisfy both, raise ONE finding, worded from this protocol, not one for each.

The protocols are a lens on the ten dimensions you already score, never an eleventh score and never a section of their own: raise what you find through the ordinary findings. Name the kind of information missing — a date, a named owner, the selection criteria — and never supply wording. Where a legal, consultation or disclosure obligation may apply, say that it may and that counsel must confirm; never state that a draft is compliant or non-compliant. A protocol tells you what to look for. It does not raise the finding or question caps.`;

export function protocolWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
