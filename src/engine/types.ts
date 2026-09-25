/**
 * Shared types for the evaluation engine.
 *
 * Intake enumerations come from PROMPT.md Section 3; the analysis shape mirrors
 * the JSON schema in Section 6. The engine never sees anything but the draft
 * text and these fields.
 */

/**
 * Who the organization is.
 *
 * Asked first, before anything else, because it changes what a reader is
 * entitled to expect. A listed company that tells the market late has broken
 * a rule; a charity that tells its donors late has disappointed them. The
 * same draft, judged against different duties.
 */
export const ORGANIZATION_TYPES = [
  "Publicly listed company",
  "Private company",
  "Nonprofit or charity",
  "Public body or government agency",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export interface OrganizationProfile {
  type: OrganizationType;
  /** Listed companies only: the exchange or the country it is listed in. */
  listed_where?: string;
  /** The country the organization is run from. */
  headquarters: string;
}

/**
 * What happened, grouped the way the intake shows it.
 *
 * Thirty events in six groups, replacing the thirteen the tool shipped with.
 * The thirteen were the right axis and too coarse a grain: "workforce
 * reduction or major reorganization" covered layoffs, a reorganization and a
 * site closure, which arrive with different duties and different first
 * questions. This is the axis the protocol library is organized on, and a
 * protocol now claims a list of events rather than one.
 *
 * The group names are stored in ordinary case and shown in capitals by the
 * stylesheet, so a screen reader says "Leadership and governance" rather than
 * spelling it out.
 */
export const EVENT_GROUPS = [
  [
    "Leadership and governance",
    [
      "CEO or senior leader departure",
      "New CEO or leadership appointment",
      "Board change or governance dispute",
      "Allegations against a leader",
    ],
  ],
  [
    "People and workplace",
    [
      "Layoffs or job cuts",
      "Restructuring or reorganization",
      "Site, office or store closure",
      "Workplace accident or serious injury",
      "Harassment, discrimination or culture allegations",
      "Strike or labor dispute",
      "Major policy change (e.g. return to office, benefits)",
    ],
  ],
  [
    "Operations and safety",
    [
      "Cyber incident or data breach",
      "System outage or service disruption",
      "Product recall or safety issue",
      "Environmental incident",
      "Supply chain disruption",
    ],
  ],
  [
    "Business and finance",
    [
      "Merger, acquisition or sale",
      "Disappointing results or profit warning",
      "Price increase or change to terms",
      "Financial difficulty or cost-cutting",
      "Change of strategy or exit from a market",
    ],
  ],
  [
    "Legal and reputation",
    [
      "Investigation, lawsuit or regulatory action",
      "Fraud or financial misconduct",
      "Backlash to something the organization said or did",
      "Rumor or misinformation about the organization",
      "Pressure from activists, campaigners or investors",
    ],
  ],
  [
    "External events",
    [
      "Geopolitical event (war, sanctions, unrest)",
      "Natural disaster or extreme weather",
      "Public health emergency",
      "Social or political issue (deciding whether to speak)",
    ],
  ],
] as const;

/** The event chosen when nothing on the list fits; the user then types what happened. */
export const OTHER_EVENT = "Something else";

export const COMMUNICATION_EVENTS = [
  ...EVENT_GROUPS.flatMap(([, events]) => events),
  OTHER_EVENT,
] as const;
export type CommunicationEvent = (typeof COMMUNICATION_EVENTS)[number];

/**
 * The six events shown at the top of the menu, repeated from their groups.
 * Not a category: a shortcut past thirty radio buttons for the events a
 * communications team meets most.
 */
export const MOST_COMMON_EVENTS: readonly CommunicationEvent[] = [
  "CEO or senior leader departure",
  "Layoffs or job cuts",
  "Cyber incident or data breach",
  "Restructuring or reorganization",
  "Merger, acquisition or sale",
  "Product recall or safety issue",
];

/**
 * Events where people are directly affected in a way the draft has to speak
 * to. Shows the "Employees directly affected" audience, under the name that
 * event gives those people.
 */
export const AFFECTED_EMPLOYEE_LABELS: Partial<Record<CommunicationEvent, string>> = {
  "Layoffs or job cuts": "Departing employees",
  "Site, office or store closure": "Employees at the site",
  "Restructuring or reorganization": "Employees whose roles change",
  "Cyber incident or data breach": "Employees whose data was affected",
  "Workplace accident or serious injury": "Injured employees and their families",
  "Strike or labor dispute": "Employees directly affected",
  "Harassment, discrimination or culture allegations": "Employees directly affected",
  "Environmental incident": "Employees directly affected",
  "Financial difficulty or cost-cutting": "Employees directly affected",
  "Change of strategy or exit from a market": "Employees directly affected",
  "Merger, acquisition or sale": "Employees directly affected",
  "Public health emergency": "Employees directly affected",
  "Geopolitical event (war, sanctions, unrest)": "Employees directly affected",
  "Natural disaster or extreme weather": "Employees directly affected",
};

/**
 * Events where a misstatement carries legal, financial or physical
 * consequence. They do not change how the draft is scored — the tool used to
 * have a "heightened review" mode that raised four faults to High severity,
 * and it is gone. What they do now is put a warning on the results page naming
 * the specialties this kind of event tends to touch, which is the part a
 * reader could act on.
 */
export const HEIGHTENED_EVENTS: ReadonlySet<CommunicationEvent> = new Set<CommunicationEvent>([
  "Allegations against a leader",
  "Layoffs or job cuts",
  "Restructuring or reorganization",
  "Site, office or store closure",
  "Workplace accident or serious injury",
  "Harassment, discrimination or culture allegations",
  "Strike or labor dispute",
  "Cyber incident or data breach",
  "Product recall or safety issue",
  "Environmental incident",
  "Merger, acquisition or sale",
  "Disappointing results or profit warning",
  "Financial difficulty or cost-cutting",
  "Change of strategy or exit from a market",
  "Investigation, lawsuit or regulatory action",
  "Fraud or financial misconduct",
  "Geopolitical event (war, sanctions, unrest)",
  "Public health emergency",
]);

/**
 * What the document is, grouped as the intake shows it. Changes what the
 * draft should contain, not the standard it is held to: a holding statement
 * is allowed to be thin where a press release is not.
 */
export const FORMAT_GROUPS = [
  [
    "The announcement",
    [
      "Press release or public statement",
      "Holding statement",
      "Investor or market disclosure",
      "Employee announcement",
      "Customer, partner or supplier notice",
    ],
  ],
  ["In a leader's voice", ["Leader message"]],
  ["Supporting materials", ["Talking points, FAQ or manager toolkit"]],
  ["Short form", ["Social media post"]],
] as const;

export const OTHER_FORMAT = "Something else";

export const COMMUNICATION_FORMATS = [
  ...FORMAT_GROUPS.flatMap(([, formats]) => formats),
  OTHER_FORMAT,
] as const;
export type CommunicationFormat = (typeof COMMUNICATION_FORMATS)[number];

export const FORMAT_DESCRIPTIONS: Record<CommunicationFormat, string> = {
  "Press release or public statement": "The organization's official public account",
  "Holding statement": "An early statement while facts are still being confirmed",
  "Investor or market disclosure": "For shareholders, analysts or a regulatory filing",
  "Employee announcement": "The organization's account to its own people",
  "Customer, partner or supplier notice": "What this means for the people you do business with",
  "Leader message": "A signed CEO memo, blog post or video script",
  "Talking points, FAQ or manager toolkit": "Material that supports the main announcement",
  "Social media post": "A short post on LinkedIn, X or another channel",
  [OTHER_FORMAT]: "",
};

/** The format that supports another document, and may be checked against it. */
export const TOOLKIT_FORMAT: CommunicationFormat = "Talking points, FAQ or manager toolkit";
/** The format only a listed company can properly be issuing. */
export const DISCLOSURE_FORMAT: CommunicationFormat = "Investor or market disclosure";

/**
 * Who will receive this. More than one, because almost every draft has more
 * than one, and a single "primary audience" made the user pick the one the
 * tool would then judge the whole draft against.
 */
export const AUDIENCE_GROUPS = [
  ["Employees", ["All employees", "Employees directly affected", "Managers and leaders"]],
  ["Markets", ["Investors and analysts"]],
  ["Customers and partners", ["Customers", "Partners and suppliers"]],
  ["Public", ["Media", "General public and communities"]],
  ["Authorities", ["Regulators and government"]],
] as const;

export const AUDIENCES = AUDIENCE_GROUPS.flatMap(([, list]) => list);
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_DESCRIPTIONS: Partial<Record<Audience, string>> = {
  "Managers and leaders": "People who will pass the message on and answer questions",
};

/** The audience shown only when the event has directly affected people. */
export const AFFECTED_AUDIENCE: Audience = "Employees directly affected";
/** The audience whose name, and existence, depend on the kind of organization. */
export const INVESTOR_AUDIENCE: Audience = "Investors and analysts";

/** What "Investors and analysts" is called, by organization. Absent means the option is hidden. */
export const INVESTOR_AUDIENCE_LABELS: Partial<Record<OrganizationType, string>> = {
  "Publicly listed company": "Investors and analysts",
  "Private company": "Owners, investors and lenders",
  "Nonprofit or charity": "Donors, funders and trustees",
};

/** Who each format is normally sent to. A starting point the user can change. */
export const DEFAULT_AUDIENCES: Record<CommunicationFormat, readonly Audience[]> = {
  "Press release or public statement": ["Media", "General public and communities"],
  "Holding statement": ["Media"],
  "Investor or market disclosure": ["Investors and analysts"],
  "Employee announcement": ["All employees"],
  "Customer, partner or supplier notice": ["Customers", "Partners and suppliers"],
  "Leader message": ["All employees"],
  "Talking points, FAQ or manager toolkit": ["Managers and leaders"],
  "Social media post": ["General public and communities"],
  [OTHER_FORMAT]: [],
};

/** Where things stand. Replaces the old Setting menu, which asked how serious it felt. */
export const SITUATION_STATUSES = [
  "Planned",
  "Not yet public",
  "Already public",
  "Still unfolding",
] as const;
export type SituationStatus = (typeof SITUATION_STATUSES)[number];

export const SITUATION_DESCRIPTIONS: Record<SituationStatus, string> = {
  Planned: "We're announcing this on our own timeline",
  "Not yet public": "It hasn't been announced, but could leak or be reported soon",
  "Already public": "It's being reported, discussed or asked about",
  "Still unfolding": "Facts are changing and we don't have the full picture",
};

/** What a holding statement means about where things stand, unless the user says otherwise. */
export const HOLDING_STATEMENT_SITUATION: SituationStatus = "Still unfolding";

/** The quick picks above the country search. */
export const LOCATION_QUICK_PICKS = [
  "United States",
  "Canada",
  "United Kingdom",
  "European Union",
  "Multiple regions / global",
] as const;

export const EU_MEMBER_STATES: readonly string[] = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia",
  "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania",
  "Slovakia", "Slovenia", "Spain", "Sweden",
];

/**
 * Where the protocols and the framework carry checks tied to a place.
 *
 * Short, and honestly so. It is what the five protocols in the library
 * actually cite: US securities law and regulator guidance, EU worker
 * information rules, UK professional guidance, Australian employment
 * guidance. Canada is a quick pick and is not on this list, so choosing it
 * says so — which is the point of the notice.
 */
export const COVERED_LOCATIONS: readonly string[] = [
  "United States",
  "United Kingdom",
  "European Union",
  "Australia",
  ...EU_MEMBER_STATES,
];

/** Selections that name no single place, so the coverage notice cannot speak to them. */
export const UNPLACED_LOCATIONS: readonly string[] = ["Multiple regions / global"];

/** Places chosen that the tool carries no legal checks for. */
export function uncoveredLocations(locations: readonly string[]): string[] {
  return locations.filter((l) => !COVERED_LOCATIONS.includes(l) && !UNPLACED_LOCATIONS.includes(l));
}

/** What this draft is mainly trying to do. One only: the thing that matters most. */
export const PURPOSES = [
  "Announce a decision or change",
  "Explain what happened and why",
  "Apologize and take responsibility",
  "Respond to criticism or a claim",
  "Address concerns",
  "Ask for action or support",
] as const;
export type Purpose = (typeof PURPOSES)[number];

export const PURPOSE_DESCRIPTIONS: Record<Purpose, string> = {
  "Announce a decision or change": "Tell people what is happening and what it means",
  "Explain what happened and why": "Give the reasons behind an event or decision",
  "Apologize and take responsibility": "Acknowledge harm or a mistake and say what will change",
  "Respond to criticism or a claim": "Answer something already said about the organization",
  "Address concerns": "Respond to worries people have or are likely to have",
  "Ask for action or support": "Ask people to do something, or to back a decision",
};

/**
 * Whether the results page should warn that this review touches ground a
 * specialist should see. A judgment about the event, not about the draft —
 * the tool cannot tell from the words whether a redundancy consultation is
 * under way. The old Setting menu used to feed this too; the tick-box for
 * people harmed or put at risk does that job now, and more plainly.
 */
export function warrantsHeightenedReview(event: CommunicationEvent, peopleAtRisk: boolean): boolean {
  return peopleAtRisk || HEIGHTENED_EVENTS.has(event);
}

/** Context fields, in the order Section 3 lists them. Key, then the label shown to the user and the model. */
export const CONTEXT_FIELDS = [
  ["organization_or_sector", "Organization or sector"],
  ["speaker_role", "Speaker role"],
  ["decision_or_event", "Decision or event being communicated"],
  ["known_facts", "Known facts and source material"],
  ["claims_to_verify", "Claims that must be verified"],
  ["cannot_disclose", "What cannot be disclosed, and why"],
  ["stakeholder_concerns", "Known stakeholder concerns"],
  ["prior_commitments", "Prior commitments on this topic"],
  [
    "materially_affected",
    "Who is materially affected (job loss, service disruption, safety, privacy, rights, price, access, reputation)",
  ],
  ["communicated_before", "Whether the organization has communicated on this before"],
  ["publication_date", "Intended publication date"],
  ["desired_tone", "Desired tone"],
  ["review_requirements", "Known legal, HR, labor, privacy, or disclosure review requirements"],
] as const;
export type ContextFieldKey = (typeof CONTEXT_FIELDS)[number][0];
export type ContextFields = Partial<Record<ContextFieldKey, string>>;

/** What the audience already has or will receive when the communication lands (revision 8). */
export const DOCUMENT_KINDS = [
  ["supporting", "Supporting document provided with this communication"],
  ["prior_communication", "Earlier communication from us on this topic"],
  ["media_report", "Media report or public commentary"],
  ["other_context", "Other background the audience has"],
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number][0];

export const DOCUMENT_REACH = [
  ["all", "The whole audience"],
  ["some", "Part of the audience"],
  ["unknown", "Unknown"],
] as const;
export type DocumentReach = (typeof DOCUMENT_REACH)[number][0];

export interface AudienceDocument {
  kind: DocumentKind;
  title: string;
  /** What it is, in a line. */
  description: string;
  /** How and when the audience receives or encountered it. */
  delivery: string;
  /** How much of the audience it reaches. */
  reach: DocumentReach;
  /** Supporting documents only: arrives at the same time as the main communication. */
  same_time: boolean;
  /** Extracted text. */
  text: string;
}

export const MAX_AUDIENCE_DOCUMENTS = 8;
export const MAX_AUDIENCE_DOCUMENT_CHARS = 20_000;

export interface EvaluationRequest {
  draft: string;
  /** Who the organization is. Sets what a reader is entitled to expect. */
  organization: OrganizationProfile;
  /** What happened. Selects the protocols that apply. */
  communication_event: CommunicationEvent;
  /** When the event is "Something else": what happened, in the user's words. */
  event_description?: string;
  /** What the document is. Changes what it should contain, not the standard. */
  communication_format: CommunicationFormat;
  /** When the format is "Something else": what they are drafting, in their words. */
  format_description?: string;
  /** Supporting material only: the announcement this draft must not go beyond. */
  main_announcement?: string;
  /** Everyone who will receive this. At least one. */
  audiences: Audience[];
  /** Where things stand. */
  situation: SituationStatus;
  /** Whether people have been harmed or put at risk. */
  people_at_risk: boolean;
  /** Where the people affected by this are. At least one. */
  locations: string[];
  /** What the draft is mainly trying to do. */
  purpose: Purpose;
  context: ContextFields;
  already_published: boolean;
  audience_documents?: AudienceDocument[];
}

// ---------------------------------------------------------------------------
// Analysis (Section 6)
// ---------------------------------------------------------------------------

/** Dimension ids in Section 7 order (descending weight). */
export const DIMENSION_IDS = [
  "accountability_agency",
  "truthfulness_factual_discipline",
  "causation_explanation",
  "stakeholder_respect_impact",
  "listening_employee_voice",
  "corrective_action_proof",
  "clarity_plain_language",
  "verification_follow_through",
  "fairness_independence_conflicts",
  "future_readiness_learning",
] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];

export const RISK_LEVELS = ["Low", "Moderate", "High", "Critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];


export const SEVERITIES = ["Low", "Moderate", "High"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CLAIM_STATUSES = ["Asserted", "Supported", "Unverifiable"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const SPECIALIST_REVIEW_TYPES = [
  "Legal",
  "HR",
  "Labor",
  "Privacy",
  "Information security",
  "Investor relations",
  "Local market",
  "Executive",
] as const;
export type SpecialistReviewType = (typeof SPECIALIST_REVIEW_TYPES)[number];

/**
 * The six ways language lets responsibility disappear. The engine reads for
 * these and lets what it finds shape the findings and the scores; it no longer
 * lists them back as output, which nothing displayed. Kept as one list so the
 * prompt and the Standards Library page name the same six.
 */
export const SCAN_CATEGORIES = [
  "External weather",
  "Institutional abstraction",
  "Audience displacement",
  "Passive accountability",
  "Values without action",
  "Vague action",
] as const;
export type ScanCategory = (typeof SCAN_CATEGORIES)[number];

export const DEVILS_ADVOCATE_DISCLAIMER =
  "These are plausible audience interpretations, not statements of fact.";

export const SCHEMA_VERSION = "1.0";

export interface ExecutiveSummary {
  /** At most twelve words: the key takeaway. */
  headline: string;
  risk_level: RiskLevel;
  context_supplied: boolean;
  strongest_elements: string[];
  priority_improvements: string[];
}

export interface Dimension {
  id: DimensionId;
  score: number;
  rationale: string;
  would_raise: string;
}

export interface Finding {
  id: string;
  dimension: DimensionId;
  severity: Severity;
  excerpt: string | null;
  omission: string | null;
  claim_status: ClaimStatus | null;
  finding: string;
  /** The kind of information to add, remove or clarify; never rewritten text. Shown as "Ways this could be rectified". */
  recommended_action: string;
  fact_validation_needed: boolean;
  specialist_review_needed: boolean;
  specialist_review_type: SpecialistReviewType | null;
}

export interface Persona {
  /** The audience, named: "An affected employee", "A journalist". */
  persona: string;
  /**
   * What that audience might say, in their own voice and one sentence
   * (revision 21). Replaces the four-field breakdown, which the owner found
   * far heavier than the insight in it warranted.
   */
  might_say: string;
}

export interface DevilsAdvocate {
  disclaimer: typeof DEVILS_ADVOCATE_DISCLAIMER;
  personas: Persona[];
  most_damaging_interpretation: string;
}

export interface Analysis {
  schema_version: typeof SCHEMA_VERSION;
  executive_summary: ExecutiveSummary;
  dimensions: Dimension[];
  findings: Finding[];
  devils_advocate: DevilsAdvocate;
  questions_before_publication: string[];
  specialist_review_summary: SpecialistReviewType[];
}
