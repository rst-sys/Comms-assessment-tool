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
      "Six professional values and six provisions of conduct. Honesty requires the highest standards of accuracy and truth. Disclosure of Information requires building trust by revealing all information needed for responsible decision-making. Free Flow of Information protects accurate and truthful information as essential to informed decisions. Independence and Fairness require disclosed interests and no self-serving framing.",
  },
  {
    id: "page",
    name: "The Page Principles",
    body: "Arthur W. Page Society",
    url: "https://page.org/who-we-are/page-principles/",
    summary:
      "Seven principles: tell the truth; prove it with action; listen to stakeholders; manage for tomorrow; conduct public relations as if the whole enterprise depends on it; realise that an enterprise's true character is expressed by its people; remain calm, patient and good-humoured. “Prove it with action” holds that public perception is determined ninety per cent by what an organisation does and ten per cent by what it says.",
  },
  {
    id: "iabc",
    name: "Code of Ethics for Professional Communicators",
    body: "International Association of Business Communicators (IABC)",
    url: "https://www.iabc.com/About/Purpose/Code-of-Ethics",
    summary:
      "Requires honest, candid and timely communication, the free flow of essential information in the public interest, the dissemination of accurate information, and prompt correction of any erroneous communication for which the communicator is responsible. Communication should be truthful, accurate and fair, and should facilitate respect and mutual understanding.",
  },
  {
    id: "iso",
    name: "ISO 24495-1: Plain language — governing principles and guidelines",
    body: "International Organization for Standardization",
    year: "2023",
    url: "https://www.iso.org/standard/78907.html",
    summary:
      "Defines plain language as wording, structure and design so clear that intended readers can easily find what they need, understand what they find, and use that information. Its four governing principles are relevance, findability, understandability and usability.",
  },
  {
    id: "melbourne",
    name: "The Melbourne Mandate",
    body: "Global Alliance for Public Relations and Communication Management",
    year: "2012",
    url: "https://www.globalalliancepr.org/melbourne-mandate",
    summary:
      "A call to action endorsed by delegates from twenty-nine countries, built on three pillars: character — defining an organisation's values; listening — to all stakeholders; and responsibility — for the organisation's conduct and its effect on society.",
  },
];

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
    { code: "prsa", principle: "Disclosure of Information — reveal all information needed for responsible decision-making" },
    { code: "melbourne", principle: "Responsibility — for the organisation's conduct and its effect on society" },
    { code: "page", principle: "An enterprise's true character is expressed by its people" },
  ],
  truthfulness_factual_discipline: [
    { code: "prsa", principle: "Honesty — the highest standards of accuracy and truth" },
    { code: "page", principle: "Tell the truth — an ethically accurate picture of the enterprise's character, values and actions" },
    { code: "iabc", principle: "Disseminate accurate information and promptly correct erroneous communication" },
  ],
  causation_explanation: [
    { code: "prsa", principle: "Free Flow of Information — accurate and truthful information is essential to informed decision-making" },
    { code: "page", principle: "Tell the truth — let the public know what is happening" },
  ],
  stakeholder_respect_impact: [
    { code: "iabc", principle: "Truthful, accurate and fair communication that facilitates respect and mutual understanding" },
    { code: "melbourne", principle: "Responsibility — to society, not only to the organisation" },
  ],
  listening_employee_voice: [
    { code: "page", principle: "Listen to stakeholders" },
    { code: "melbourne", principle: "Listening — to all stakeholders" },
  ],
  corrective_action_proof: [
    { code: "page", principle: "Prove it with action — perception is ninety per cent what an organisation does, ten per cent what it says" },
    { code: "iabc", principle: "Promptly correct any erroneous communication for which the communicator is responsible" },
  ],
  clarity_plain_language: [
    { code: "iso", principle: "Readers can easily find what they need, understand what they find, and use it" },
    { code: "iso", principle: "Governing principles: relevance, findability, understandability, usability" },
  ],
  verification_follow_through: [
    { code: "page", principle: "Prove it with action — commitments are judged by what follows them" },
    { code: "prsa", principle: "Disclosure of Information — build trust through what is revealed" },
  ],
  fairness_independence_conflicts: [
    { code: "prsa", principle: "Independence — provide objective counsel and be accountable for actions" },
    { code: "prsa", principle: "Fairness — deal fairly with clients, employers, competitors, employees and the public" },
    { code: "iabc", principle: "Fair communication that facilitates respect and mutual understanding" },
  ],
  future_readiness_learning: [
    { code: "page", principle: "Manage for tomorrow — anticipate and act on what is coming" },
    { code: "melbourne", principle: "Character — defining and living the organisation's values" },
  ],
};

/**
 * What no published code supplies, and the tool should not pretend otherwise.
 * These are the owner's construction: informed by the codes above, not
 * dictated by them, and the page says so in as many words.
 */
export const OWNER_S_OWN: [string, string][] = [
  ["The ten dimensions and their weights", "Which dimensions exist, and that accountability and agency carries 18 of the 100 points while future readiness carries 5. No code assigns weights."],
  ["The 0–100 score and its five bands", "Turning ten judgements into one number, and the thresholds at 90, 75, 60 and 40."],
  ["The account a message should give", "The ten things a reader should be able to see: decision, agency, context, exposure, impact, action, correction, ownership, verification, learning."],
  ["The agency and abstraction scan", "Six categories of language that let responsibility disappear, and the rule that a phrase is flagged only where it is doing the explaining."],
  ["Asserted, Supported, Unverifiable", "Capping a dimension at 3.5 of 5 where the draft claims something no supplied context confirms."],
  ["Severity thresholds and readiness", "What makes a finding High rather than Moderate, and when a draft should not be issued."],
];
