import { ASSERTED_CEILING, DIMENSION_WEIGHTS, SCORE_BANDS } from "../engine/scoring.js";
import type { DimensionId } from "../engine/types.js";

/**
 * Where the framework's ten dimensions come from (revision 20).
 *
 * An important distinction, and the page must keep it: these codes are NOT
 * sent to the model. The engine applies the ten dimensions, the agency scan
 * and the protocols in `src/engine/protocols.ts` — nothing here changes a
 * single review. What this records is provenance: which established principle
 * each dimension rests on, so a communications professional can check the
 * framework against codes they already know rather than take it on trust.
 *
 * Claiming the tool "is based on PRSA" while the engine never references it
 * would be exactly the unsubstantiated claim the tool marks other people down
 * for. So: the dimensions are grounded in these principles, and everything the
 * owner devised is labelled as the owner's own.
 */

export interface Code {
  id: string;
  name: string;
  body: string;
  year?: string;
  url: string;
  /** What the code says, in its own terms. */
  summary: string;
}

export const CODES: Code[] = [
  {
    id: "prsa",
    name: "Code of Ethics",
    body: "Public Relations Society of America (PRSA)",
    url: "https://www.prsa.org/about/ethics",
    summary:
      "Six professional values and six provisions of conduct. Honesty demands the highest standards of accuracy and truth. Disclosure of Information calls for revealing everything needed for responsible decisions. Independence and Fairness require disclosed interests and no self-serving framing.",
  },
  {
    id: "page",
    name: "The Page Principles",
    body: "Arthur W. Page Society",
    url: "https://page.org/who-we-are/page-principles/",
    summary:
      "Seven principles, including tell the truth, prove it with action, listen to stakeholders and manage for tomorrow. \u201CProve it with action\u201D holds that perception is ninety percent what an organization does and ten percent what it says.",
  },
  {
    id: "iabc",
    name: "Code of Ethics for Professional Communicators",
    body: "International Association of Business Communicators (IABC)",
    url: "https://www.iabc.com/About/Purpose/Code-of-Ethics",
    summary:
      "Honest, candid and timely communication, accurate information, and prompt correction of any error the communicator is responsible for. Communication should be truthful, accurate and fair, and foster respect and mutual understanding.",
  },
  {
    id: "iso",
    name: "ISO 24495-1: Plain language",
    body: "International Organization for Standardization",
    year: "2023",
    url: "https://www.iso.org/standard/78907.html",
    summary:
      "Defines plain language as wording, structure and design so clear that intended readers can find what they need, understand it and use it. Four principles: relevance, findability, understandability and usability.",
  },
  {
    id: "melbourne",
    name: "The Melbourne Mandate",
    body: "Global Alliance for Public Relations and Communication Management",
    year: "2012",
    url: "https://www.globalalliancepr.org/melbourne-mandate",
    summary:
      "Endorsed by delegates from twenty-nine countries, on three pillars: character (defining an organization's values), listening (to all stakeholders) and responsibility (for the organization's conduct and its effect on society).",
  },
];

/** The short name shown after each principle, rather than the full title. */
export const CODE_SHORT: Record<string, string> = {
  prsa: "PRSA",
  page: "Page Society",
  iabc: "IABC",
  iso: "ISO 24495-1",
  melbourne: "Global Alliance",
};

export const CODES_BY_ID: Record<string, Code> = Object.fromEntries(CODES.map((c) => [c.id, c]));

export interface Grounding {
  /** The code this dimension rests on. */
  code: string;
  /** The principle, quoted or closely paraphrased from that code. */
  principle: string;
}

/**
 * Each dimension and the published principles behind it. Every dimension has
 * at least one: a dimension nobody can trace to an established principle has
 * no business carrying weight in the score.
 */
export const GROUNDING: Record<DimensionId, Grounding[]> = {
  accountability_agency: [
    { code: "prsa", principle: "Disclosure of Information: reveal all information needed for responsible decision-making" },
    { code: "melbourne", principle: "Responsibility: for the organization's conduct and its effect on society" },
    { code: "page", principle: "An enterprise's true character is expressed by its people" },
  ],
  truthfulness_factual_discipline: [
    { code: "prsa", principle: "Honesty: the highest standards of accuracy and truth" },
    { code: "page", principle: "Tell the truth: an accurate picture of the enterprise's character, values and actions" },
    { code: "iabc", principle: "Disseminate accurate information and promptly correct errors" },
  ],
  causation_explanation: [
    { code: "prsa", principle: "Free Flow of Information: accurate information is essential to informed decisions" },
    { code: "page", principle: "Tell the truth: let the public know what is happening" },
  ],
  stakeholder_respect_impact: [
    { code: "iabc", principle: "Truthful, accurate and fair communication that fosters respect and mutual understanding" },
    { code: "melbourne", principle: "Responsibility: to society, not only to the organization" },
  ],
  listening_employee_voice: [
    { code: "page", principle: "Listen to stakeholders" },
    { code: "melbourne", principle: "Listening: to all stakeholders" },
  ],
  corrective_action_proof: [
    { code: "page", principle: "Prove it with action: perception is ninety percent what an organization does, ten percent what it says" },
    { code: "iabc", principle: "Promptly correct any erroneous communication you are responsible for" },
  ],
  clarity_plain_language: [
    { code: "iso", principle: "Readers can easily find what they need, understand it and use it" },
    { code: "iso", principle: "Governing principles: relevance, findability, understandability, usability" },
  ],
  verification_follow_through: [
    { code: "page", principle: "Prove it with action: commitments are judged by what follows them" },
    { code: "prsa", principle: "Disclosure of Information: build trust through what is revealed" },
  ],
  fairness_independence_conflicts: [
    { code: "prsa", principle: "Independence: give objective counsel and be accountable for actions" },
    { code: "prsa", principle: "Fairness: deal fairly with clients, employers, competitors, employees and the public" },
    { code: "iabc", principle: "Fair communication that fosters respect and mutual understanding" },
  ],
  future_readiness_learning: [
    { code: "page", principle: "Manage for tomorrow: anticipate and act on what is coming" },
    { code: "melbourne", principle: "Character: defining and living the organization's values" },
  ],
};

export const STANDARDS_EYEBROW = "Standards Library";
export const STANDARDS_TITLE = "What every draft is measured against";
export const STANDARDS_LEDE =
  "Where each standard comes from, and, just as important, which parts are our own judgment rather than anyone's published code.";

export const STANDARDS_SECTIONS: { id: string; title: string }[] = [
  { id: "read", title: "How to read this page" },
  { id: "core", title: "The core framework" },
  { id: "protocols", title: "Event protocols" },
  { id: "codes", title: "Published codes" },
  { id: "judgement", title: "Our own judgment" },
];

/** The three kinds of claim, and the tag each section carries. */
export type ClaimKind = "applied" | "grounded" | "judgement";

export const CLAIM_LABELS: Record<ClaimKind, string> = {
  applied: "Applied",
  grounded: "Grounded in",
  judgement: "Our judgment",
};

export const HOW_TO_READ_INTRO =
  "Three kinds of claim appear here. Keeping them apart is exactly the kind of distinction this tool checks for, so each section carries a label.";

/** Card body per claim kind; the bold run is the part a skimming reader needs. */
export const HOW_TO_READ: { kind: ClaimKind; body: string; strong?: string }[] = [
  {
    kind: "applied",
    body: "Rules the review engine runs: the ten dimensions, the agency scan and the event protocols.",
    strong: "These determine your score.",
  },
  {
    kind: "grounded",
    body: "Published codes the framework was built from. They aren't sent to the engine and change no review. They're cited so you can check the framework against codes you already know.",
  },
  {
    kind: "judgement",
    body: "Choices no published code supplies, such as the weights and score bands. If you disagree with one, you're disagreeing with us, not with PRSA.",
  },
];

export const CORE_INTRO =
  "Applied to every draft. Each of the ten dimensions traces to at least one published principle. A dimension nobody can trace has no business carrying weight in a score.";

export const ACCOUNT_CARD =
  "Ten things a reader should be able to see: decision, agency, context, exposure, impact, action, correction, ownership, verification and learning.";

export const SCAN_CARD =
  "Six patterns of language that let responsibility disappear: external weather, institutional abstraction, audience displacement, passive accountability, values without action and vague action. A phrase is flagged only when it's doing the explaining.";

export const PROTOCOLS_INTRO: string[] = [
  "Naming the event at intake brings in the protocol written for it. A protocol is a lens on the ten dimensions, never an eleventh score: a missing element shows up as an ordinary finding under the dimension it belongs to.",
  "Each protocol states what kind of authority it rests on. Its full sources, including what its author couldn't access and what it can't judge, sit behind the expander on its card.",
];

export const PROTOCOLS_PLANNED: [string, string] = [
  "More protocols are planned.",
  "Until then, a draft about an event without its own protocol is judged against the core framework, plus the checks every high-stakes event shares.",
];

export const CODES_INTRO =
  "Established codes in professional communication and public relations. Each is linked. Read them yourself rather than taking our summary for it.";

export const JUDGEMENT_INTRO =
  "No published code supplies the following. They're this tool's construction, informed by the codes above but not dictated by them. If you disagree with one, you're disagreeing with us, not with PRSA.";

/**
 * What no published code supplies, and the tool should not pretend otherwise.
 * These are the owner's construction: informed by the codes above, not
 * dictated by them, and the page says so in as many words.
 *
 * Every number here is read from the scoring config rather than written out,
 * so the page that tells a reader "accountability carries 18 of the 100
 * points" cannot come to disagree with the engine that awards them.
 */
export function ownJudgment(): [string, string][] {
  const total = Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0);
  const heaviest = DIMENSION_WEIGHTS.accountability_agency;
  const lightest = DIMENSION_WEIGHTS.future_readiness_learning;
  const thresholds = SCORE_BANDS.filter((b) => b.min > 0).map((b) => b.min);
  const thresholdList = `${thresholds.slice(0, -1).join(", ")} and ${thresholds[thresholds.length - 1]}`;
  // Spelled out because the sentence reads better; the count is still checked
  // against the engine, so adding a band breaks a test rather than the page.
  const bandCount = ["no", "one", "two", "three", "four", "five", "six"][SCORE_BANDS.length] ?? String(SCORE_BANDS.length);
  return [
    [
      "The ten dimensions and their weights",
      `Which dimensions exist, and that accountability and agency carries ${heaviest} of the ${total} points while future readiness carries ${lightest}. No code assigns weights.`,
    ],
    [
      `The 0\u2013${total} score and its ${bandCount} bands`,
      `Turning ten judgments into one number, and the band thresholds at ${thresholdList}.`,
    ],
    [
      "The account a message should give",
      "The ten things a reader should be able to see: decision, agency, context, exposure, impact, action, correction, ownership, verification and learning.",
    ],
    [
      "The agency and abstraction scan",
      "The six patterns of language that let responsibility disappear, and the rule that a phrase is flagged only when it's doing the explaining.",
    ],
    [
      "Asserted, Supported, Unverifiable",
      `Capping a dimension at ${ASSERTED_CEILING} of 5 when the draft claims something no supplied context confirms.`,
    ],
    [
      "Severity thresholds and readiness",
      "What makes a finding High rather than Moderate, and when a draft should not be issued.",
    ],
  ];
}

/**
 * What kind of authority each protocol element rests on, for the Library card.
 *
 * The label is the element's own `basis` field, read from the protocol. The
 * note is the qualification the protocol's own Source section attaches to it,
 * quoted rather than paraphrased: several of these checks rest on guidance
 * written for a different situation, or extend a rule past what it covers, and
 * the page that exists to say where a standard comes from has to say so on the
 * element rather than three paragraphs down. No label is upgraded here.
 */
export const BASIS_LABELS: Record<string, string> = {
  law: "Law",
  guidance: "Official guidance",
  standard: "Standard",
  research: "Research",
  code: "Professional code",
  judgement: "Our judgment",
  unclassified: "Unclassified",
};

export const ELEMENT_BASIS_NOTES: Record<string, string> = {
  "core.estimates_as_estimates":
    "Written for public authorities in health emergencies; applied to organizational communication by analogy.",
  "core.central_fact_first":
    "The “first two or three sentences” threshold is professional judgement; the standard and the research do not set one.",
  "people-harmed.danger_and_protection":
    "The directive binds only employers in the EU, and only toward their workers. For other readers and places, the element applies CDC guidance and the same reasoning by analogy.",
  "people-harmed.harm_acknowledged": "Guidance and theory, not measured effect.",
  "people-harmed.support": "Theory, not measured effect.",
  "listed-company.same_to_all":
    "Regulation FD covers market professionals and securityholders, not employees as such. Extending it to employees and partners is professional judgement.",
  "workforce-impact.decision-status": WORKFORCE_LAW_NOTE(),
  "workforce-impact.scope-of-impact": WORKFORCE_LAW_NOTE(),
  "workforce-impact.selection-basis-and-alternatives": WORKFORCE_LAW_NOTE(),
  "workforce-impact.individual-notice-timing-and-terms": WORKFORCE_LAW_NOTE(),
  "workforce-impact.voice-and-what-can-still-change": WORKFORCE_LAW_NOTE(),
};

function WORKFORCE_LAW_NOTE(): string {
  return "These laws govern formal notices to representatives and authorities, not employee messages. Applying their content to a message is professional judgement.";
}

/**
 * The framework elements the core protocol's source review grounds, from its
 * addendum. Five of the review's seven checks were already in the framework
 * prompt, so the sources it gathered ground those instead of becoming
 * protocol checks of their own. Basis labels are the addendum's, unchanged.
 */
export const FRAMEWORK_GROUNDING: { element: string; sources: string; basis: string }[] = [
  { element: "Who had authority over it", sources: "Fausey & Boroditsky 2010", basis: "judgement, supported by research" },
  { element: "Who is affected and how", sources: "CDC CERC “Express Empathy”; WHO A.1; Coombs 2007", basis: "guidance + research" },
  { element: "What the reader should do now", sources: "WHO C4.3; CDC CERC “Promote Action”; Seeger 2006; Coombs 2007", basis: "guidance + research" },
  { element: "What will change, who owns it", sources: "CDC CERC “Be Right”; Coombs 2007", basis: "guidance + research" },
  { element: "When the next update comes, where, how to ask", sources: "WHO A.1 (“timely”); Seeger 2006 (“remain accessible”)", basis: "judgement" },
  { element: "Known vs not yet known (still unfolding)", sources: "WHO A.2; CDC CERC “Be Right”; Seeger 2006", basis: "guidance" },
];

export const FRAMEWORK_GROUNDING_INTRO =
  "The account is the framework's own, applied to every draft. The core protocol's source review gathered published guidance for five of these; it grounds them rather than repeating them as protocol checks, which would count them twice.";

export const SOURCES_NOT_READ_HEADING = "Sources not read in the original";
