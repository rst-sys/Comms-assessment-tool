/**
 * The explanatory copy shown on the welcome screen (condensed) and the Tool
 * Overview page (in full), kept in one place so the two cannot drift apart.
 */

/** Section 4's notice, verbatim. */
export const CONFIDENTIALITY_NOTICE =
  "This prototype sends your draft to an external AI provider for analysis and stores nothing. Do not submit attorney-client privileged, material nonpublic, or regulated personal information unless your legal, privacy, and security teams have approved this provider and mode. Redaction is not available in this build.";

/** The nine things a message should make visible (PROMPT.md Section 2). */
export const ACCOUNT_ELEMENTS: [string, string][] = [
  ["Decision", "what was decided, announced, changed or corrected"],
  ["Agency", "who had the authority to decide, approve or intervene"],
  ["Context", "the external conditions that mattered, stated specifically"],
  ["Exposure", "the internal choices and assumptions that increased exposure"],
  ["Impact", "who is affected, and how"],
  ["Correction", "what will change"],
  ["Ownership", "who owns the change"],
  ["Verification", "the metric, date or review that lets people judge follow-through"],
  ["Learning", "what changes so it does not happen again"],
];

export const WHAT_YOU_GET: string[] = [
  "A trust score out of 100, with a band and a risk level.",
  "A headline stating the key takeaway, and the ten dimension scores behind it.",
  "Specific findings, each naming the gap and the kind of information that would close it.",
  "One line from each of five audiences, in their own words, saying what the draft leaves them asking.",
  "Questions worth asking before you publish, tagged where a named reviewer should see them.",
  "The most damaging way the draft could reasonably be read, if it went out unchanged.",
  "A PDF of the whole review to keep or to share with colleagues.",
];

export const NOT_THIS: [string, string][] = [
  [
    "It does not write for you.",
    "No drafting, no rewriting, no suggested wording. You are the author and the authority; the tool names the kind of information that would strengthen the draft and leaves the writing to you.",
  ],
  ["It is not an editor or copyeditor.", "Grammar, spelling, house style and readability scores are outside its scope."],
  [
    "It does not certify compliance.",
    "It is not legal, employment, labor, financial-disclosure, regulatory, privacy or tax advice, and it does not replace review by counsel, HR or investor relations. It flags where that review is needed.",
  ],
  [
    "It does not judge motives.",
    "It never says an organization lied, acted in bad faith or broke the law. It distinguishes missing information from false information.",
  ],
];

export const NOT_THIS_SHORT: string[] = [
  "It doesn't write for you. No drafting, no rewriting, no suggested wording.",
  "It isn't an editor. Grammar, style and readability are outside its scope.",
  "It isn't legal, HR or investor-relations advice, and it doesn't certify compliance.",
  "It doesn't judge motives. It separates information that's missing from information that's false.",
];

export const VALUE_POINTS: [string, string][] = [
  ["A second opinion before you issue,", "when the people who could give one are unavailable or too close to the decision."],
  ["The same standard every time,", "across drafts, teams and months, rather than whoever happens to review it."],
  ["Specific, not vague.", "It names the gap and the kind of information that would close it, so you know what to go and find out."],
  ["A record you can share.", "The PDF gives counsel, HR or leadership a common reference for what is still unresolved."],
];

/** Plain-language privacy points; `provider` is filled from the live configuration. */
export function privacyPoints(provider: string | null, training: string | null): [string, string][] {
  return [
    ["Nothing is saved.", "Your draft, context and results exist only in this browser tab. Close it and they're gone. No account, no history, no database."],
    ["Your draft goes to one place, once.", `It's sent to ${provider ?? "the configured AI provider"} for analysis, and nowhere else.${training ? ` Training: ${training.toLowerCase()}.` : ""}`],
    ["No one is watching.", "No analytics, no tracking, no session recording. Errors are logged as a code and a random reference, never as your text."],
    ["Your draft never becomes a web search.", "If you search for public coverage, only the topic you type is sent."],
    ["Redaction isn't available yet.", "Nothing is removed from your text before it's sent."],
  ];
}
