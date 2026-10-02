import { BUILD_COMMIT, BUILD_DATE_LABEL, BUILD_YEAR } from "./build.js";

/** Fixed copy from PROMPT.md Section 2. */
export const CORE_PRINCIPLE =
  "Trust does not require institutional infallibility. It requires institutions to make their decisions, assumptions, impacts, corrections, and commitments visible enough to be understood and judged.";

export const DECISION_SUPPORT_DISCLAIMER =
  "Trust Assessment Assistant is decision-support software. It is not legal, employment, labor, financial-disclosure, regulatory, privacy, or tax advice, and it does not replace review by counsel, HR, investor relations, or local-market experts.";

/**
 * Put to the reader at the close of the Devil's Advocate, never answered by
 * the tool (revision 21). It is a self-reflective device: choosing the line a
 * journalist would lift is the author's judgment, not the engine's.
 */
export const REPORTER_QUESTION =
  "What phrase or sentence would a reporter or critic be most likely to pull out?";

/**
 * The summary section's heading and the disclaimer that always sits directly
 * beneath it, on the page and in the PDF. The disclaimer never appears
 * without the summary, and the summary never appears without it.
 */
export const AI_SUMMARY_HEADING = "How an AI assistant might summarize this";
export const AI_SUMMARY_DISCLAIMER =
  "An illustration only, not a prediction or a guarantee. Real AI assistants draw on many sources, change often and may describe this very differently. This example is based on the draft alone.";

/**
 * Every screen's footer, the Welcome screen's one-line footer, and the PDF
 * read this one line, so they cannot disagree. The year is the build's, so it
 * does not go stale.
 */
export const COPYRIGHT_HOLDER = "Richard Thompson";
export const COPYRIGHT = `\u00a9 ${BUILD_YEAR} ${COPYRIGHT_HOLDER}`;

/**
 * The Welcome screen's footer: the copyright, then whichever build facts this
 * build actually has. A part it lacks is left out rather than shown blank, so
 * a build with no commit (the claude.ai page can be built from a folder that
 * is not a git checkout) reads "© 2026 Richard Thompson · 28 Sep 2026".
 */
export function buildFooterLine(commit: string | null = BUILD_COMMIT, date: string | null = BUILD_DATE_LABEL): string {
  return [COPYRIGHT, commit ? `Build ${commit}` : null, date].filter((part): part is string => Boolean(part)).join(" \u00b7 ");
}

export const APP_NAME = "Trust Assessment Assistant";

/**
 * Shown on the results page when the event warrants it, or when the intake
 * says people have been harmed or put at risk (revision 28, wording by the
 * owner; the first clause changed when the Setting menu was removed and there
 * was no longer a setting to name).
 *
 * This replaces the heightened-review mode, which raised four faults to High
 * severity and had a tick-box the user could not untick — the box set itself
 * on a qualifying event and nothing ever cleared it. The severity change was
 * the least useful half of the feature: it moved a number. Naming the
 * specialties a reader should go and check is the half worth keeping.
 */
export const HEIGHTENED_NOTICE =
  "This kind of event needs extra care. Take particular care with anything about jobs, restructuring, health and safety, AI, surveillance, privacy, financial results, public policy, lawsuits, or people who may be vulnerable.";


/** Under the app title on the password screen. Nothing else shows it. */
export const SIGNIN_INTRO =
  "Designed by a communications expert, for communicators. Paste in a draft and the Assistant shows you how well it builds trust: where it explains the decision behind it, where it falls short, and which published standards it was measured against. It’s a specialist in trust, built on Claude, Anthropic’s large language model. You decide what to change.";

/**
 * Shown where the model's own questions would be, when it returned none.
 *
 * It returns none on a short, formulaic draft whose standard questions the
 * reviewer checklist already carries — a leadership announcement, most often.
 * That used to fail the whole review; the reader now loses the draft-specific
 * half of one section and is pointed at the half that is still there.
 */
export const NO_DRAFT_QUESTIONS = "No further questions specific to this draft. See the reviewer checklist below.";
