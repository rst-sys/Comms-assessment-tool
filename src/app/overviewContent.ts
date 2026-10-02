/**
 * The copy the Tool Overview page is made of, and the few pieces the welcome
 * screen and the Standards Library share with it.
 *
 * Kept here rather than in the component because three pages describe the
 * same framework, and the fastest way to make a tool untrustworthy is to have
 * two of its own screens describe it differently.
 */

/** Section 4's notice, verbatim. Kept for the privacy panel and any print copy. */
export const CONFIDENTIALITY_NOTICE =
  "This prototype sends your draft to an external AI provider for analysis and stores nothing. Do not submit attorney-client privileged, material nonpublic, or regulated personal information unless your legal, privacy, and security teams have approved this provider and mode. Redaction is not available in this build.";

/** The short version, on the welcome screen and at the foot of the overview. */
export const REDACTION_WARNING =
  "Do not paste privileged, material nonpublic or regulated personal information in the tool. Redact beforehand.";

export const OVERVIEW_EYEBROW = "Tool overview";
export const OVERVIEW_TITLE = "What the assistant checks, and how it scores";
export const OVERVIEW_QUESTION =
  "does this message give an account of the decision behind it, or does it only sound reassuring?";

/** The page's sections, in order: the heading, and the sidebar's label for it. */
export const OVERVIEW_SECTIONS: { id: string; title: string }[] = [
  { id: "why", title: "Why use it" },
  { id: "how", title: "How a review works" },
  { id: "get", title: "What you get back" },
  { id: "score", title: "How the score is built" },
  { id: "lenses", title: "Event standards and lenses" },
  { id: "wont", title: "What it won't do" },
  { id: "privacy", title: "Your privacy" },
];

export const WHY_USE_IT =
  "High-stakes messages rarely fail because they're badly written. They fail because they reassure without explaining. Readers notice right away. You find out later, in the comments, the coverage or the town hall.";

export const VALUE_POINTS: [string, string][] = [
  ["A second opinion before you issue", "When the people who could give one are unavailable or too close to the decision."],
  ["The same standard every time", "Across drafts, teams and months, not whoever happens to review it."],
  ["Specific, not vague", "Each finding names the gap and the kind of information that would close it, so you know what to go and find out."],
  ["A record you can share", "The PDF gives counsel, HR or leadership a common reference for what's still unresolved."],
];

/** In the order the Review screen asks for them: the questions, then the draft. */
export const REVIEW_STEPS: [string, string][] = [
  ["Answer the setup questions", "Including what happened, what you're writing, who it's for, and whether counsel has limited what you can say. Your answers decide which standards apply."],
  ["Paste your draft", "At least 10 words, though it works best on a full statement of 50 or more. Add what you know under “Anything else we should know?”: the facts, who decided, and anything counsel has ruled out."],
  ["Read your review", "In a minute or two. Download the PDF to share with your team."],
];

export const EVIDENCE_RULE: [string, string] = [
  "Your draft is treated as claims. Your context is treated as fact.",
  "The assistant never invents a metric, a date, a commitment or a name, and it says plainly when a score reflects the draft's language alone. Without context, accountability, causation and corrective action can score no higher than 3.5 out of 5.",
];

/** What comes back, in the order the results page shows it. Lead phrase, then the rest. */
export const WHAT_YOU_GET: [string, string][] = [
  ["A trust score out of 100,", "with a band and a risk level"],
  ["A headline takeaway,", "and the ten dimension scores behind it"],
  ["Specific findings,", "each naming the gap and the information that would close it"],
  ["The most damning reading:", "how the draft could reasonably be read if it went out unchanged"],
  ["Five audience voices,", "one line each on what the draft leaves them asking"],
  ["How an AI assistant might summarize it:", "an illustration, drawn from the draft alone"],
  ["Questions to ask before you publish,", "tagged for the reviewer who should see them"],
  ["A checklist for your reviewers,", "from the standards that apply to your situation"],
  ["A PDF of the whole review", "to keep or share"],
];

export const SCORE_INTRO =
  "Every draft is held to one framework, so two messages reviewed a month apart meet the same bar. It has two parts: what a reader should be able to see, and how that's scored.";

/**
 * The ten things a message should make visible (PROMPT.md Section 2, plus the
 * two the event core turned out to be the only new part of; see DEVIATIONS 65).
 */
export const ACCOUNT_ELEMENTS: [string, string][] = [
  ["Decision", "What was decided, announced, changed or corrected"],
  ["Agency", "Who had the authority to decide, approve or intervene"],
  ["Context", "The external conditions that mattered, stated specifically"],
  ["Exposure", "The internal choices and assumptions that increased risk"],
  ["Impact", "Who is affected, and how"],
  ["Action", "What the reader should do now, or that nothing is needed yet"],
  ["Correction", "What will change"],
  ["Ownership", "Who owns the change"],
  ["Verification", "The metric, date or review that shows follow-through, when the next update comes, and a named way to ask"],
  ["Learning", "What changes so it doesn't happen again"],
];

export const DIMENSIONS_NOTE =
  "Each is scored 0 to 5 with a written rationale, then weighted into the score out of 100. Accountability counts most, because that's where trust is most often lost.";

export const LENSES_INTRO =
  "Three more checks sharpen the review. None adds a score or a section of its own. What they find shows up as ordinary findings and questions.";

export const LENSES: { title: string; paragraphs: string[] }[] = [
  {
    title: "Event standards",
    paragraphs: [
      "Every review adds a core of checks all high-stakes messages share: who decided, who's affected, what's confirmed versus assumed, what readers should do, when the next update comes, and whether the hard fact is said plainly.",
      "The event you name adds the standard for its family, such as leadership change or incidents, and five events have a standard of their own. Other answers add overlays: a listed company, people harmed, jobs affected, a crisis still unfolding, a change employees must make, an apology, or a limit counsel has set. Choose “Something else” and the core and any overlays still apply.",
    ],
  },
  {
    title: "Agency and abstraction scan",
    paragraphs: [
      "Looks for language that hides who decided, in six patterns: external weather, institutional abstraction, audience displacement, passive accountability, values without action and vague action.",
      "A phrase is flagged only when it's doing the explaining, never because a word appears.",
    ],
  },
  {
    title: "Devil's advocate",
    paragraphs: [
      "Five audiences chosen for your message each get one line in their own voice: the question or objection the draft leaves them with. Above them sits the most damning reasonable reading if the draft goes out unchanged.",
    ],
  },
];

export const NOT_THIS: [string, string][] = [
  ["Write for you", "No drafting, rewriting or suggested wording. It names the information that would strengthen the draft and leaves the writing to you."],
  ["Copyedit", "Grammar, spelling, house style and readability are out of scope."],
  [
    "Certify compliance",
    "It isn't legal, employment, financial-disclosure, regulatory, privacy or tax advice, and it doesn't replace counsel, HR or investor relations. It flags where their review is needed. If you tick the counsel box, it works within the limit you describe and leaves legal judgements to counsel: it never says whether a statement is legally safe or admits fault.",
  ],
  ["Judge motives", "It never says an organization lied, acted in bad faith or broke the law. It separates missing information from false information."],
];

export const NOT_THIS_CLOSE = "It's decision-support software. The judgment, and the words, stay yours.";

/**
 * Plain-language privacy points; `provider` is filled from the live
 * configuration. The tester-access point is shown only where the password
 * screen is switched on, because only there does the app keep the cookie and
 * the daily count it describes.
 */
export function privacyPoints(provider: string | null, training: string | null, gateEnabled = false): [string, string][] {
  return [
    ["Nothing is saved", "Your draft, context and results live only in this browser tab. Close it and they're gone. No account, history or database."],
    [
      "Sent once, to one place",
      `${provider ?? "The configured AI provider"} analyzes it, and it goes nowhere else.${training ? ` ${training}.` : ""}`,
    ],
    ["No one is watching", "No analytics, tracking or session recording. Errors are logged as a code and a random reference, never as your text."],
    ["No web search", "Your draft is never searched for or sent to a search engine."],
    ...(gateEnabled
      ? ([
          [
            "Tester access",
            "One shared password keeps the prototype to invited testers. It isn't an account. The app keeps only a sign-in cookie in your browser and a daily count of reviews per network address, held in memory and cleared each day.",
          ],
        ] as [string, string][])
      : []),
  ];
}
