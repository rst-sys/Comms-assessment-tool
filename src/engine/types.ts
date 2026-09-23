/**
 * Shared types for the evaluation engine.
 *
 * Intake enumerations come from PROMPT.md Section 3; the analysis shape mirrors
 * the JSON schema in Section 6. The engine never sees anything but the draft
 * text and these fields.
 */

/**
 * What happened. The thirteen high-stakes events a communications team meets,
 * named by the owner, plus an explicit "none of these" so a routine or
 * positive announcement is not forced to claim a disaster.
 *
 * This is the axis the protocol library is organised on. It replaces half of
 * the old COMMUNICATION_TYPES list, which mixed events with formats: a
 * workforce reduction is not a kind of document, and it arrives as a press
 * release, an employee memo and a manager toolkit in the same week, needing
 * the same accountability checks in all three.
 */
export const COMMUNICATION_EVENTS = [
  "CEO or senior-leader departure",
  "Workforce reduction or major reorganization",
  "Cyberattack or data incident",
  "Workplace safety event or facility emergency",
  "Service outage, product defect, recall or quality failure",
  "Regulatory investigation, litigation or ethics allegation",
  "Acquisition, divestiture or major integration",
  "Poor financial results, site closure or strategic retreat",
  "Employee-relations controversy or union escalation",
  "Public backlash — values, culture, DEI or political pressure",
  "Supply-chain disruption affecting customers or employees",
  "Community or environmental incident at a facility",
  "Geopolitical event affecting operations or employee welfare",
  "None of these",
] as const;
export type CommunicationEvent = (typeof COMMUNICATION_EVENTS)[number];

/** No event: the draft is judged on the ten dimensions alone, with no protocol. */
export const NO_EVENT: CommunicationEvent = "None of these";

/**
 * Events where something failed or the organization is answerable for the
 * decision. Drives Part B of the event core: what changes so it does not
 * recur, which is meaningless for an acquisition or a planned retirement.
 */
export const FAILURE_EVENTS: ReadonlySet<CommunicationEvent> = new Set<CommunicationEvent>([
  "Workforce reduction or major reorganization",
  "Cyberattack or data incident",
  "Workplace safety event or facility emergency",
  "Service outage, product defect, recall or quality failure",
  "Regulatory investigation, litigation or ethics allegation",
  "Poor financial results, site closure or strategic retreat",
  "Employee-relations controversy or union escalation",
  "Public backlash — values, culture, DEI or political pressure",
  "Supply-chain disruption affecting customers or employees",
  "Community or environmental incident at a facility",
]);

/**
 * What the document is. Changes what the draft should contain, not the
 * standard it is held to: a holding statement is allowed to be thin where a
 * press release is not.
 */
export const COMMUNICATION_FORMATS = [
  "Press release",
  "Public statement",
  "Holding statement",
  "Employee announcement",
  "CEO or executive message",
  "Investor communication",
  "Customer, partner or supplier notice",
  "Manager toolkit",
  "Talking points",
  "FAQ",
  "Blog post",
  "Social-media post",
  "Other",
] as const;
export type CommunicationFormat = (typeof COMMUNICATION_FORMATS)[number];

export const PRIMARY_AUDIENCES = [
  "All employees",
  "Affected employees",
  "Remaining employees",
  "Managers",
  "Customers",
  "Investors",
  "Analysts",
  "Media",
  "Regulators",
  "Communities",
  "Partners",
  "Government stakeholders",
  "General public",
  "Multiple stakeholders",
] as const;
export type PrimaryAudience = (typeof PRIMARY_AUDIENCES)[number];

export const SETTINGS = [
  "Routine",
  "Sensitive",
  "High stakes",
  "Crisis",
  "Material corporate event",
] as const;
export type Setting = (typeof SETTINGS)[number];

export const MARKETS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "New Zealand",
  "European Union",
  "Germany",
  "France",
  "Global or multi-market",
  "Other",
] as const;
export type Market = (typeof MARKETS)[number];

export const GOALS = [
  "Inform",
  "Explain a decision",
  "Announce a change",
  "Apologize or repair trust",
  "Respond to criticism",
  "Reassure",
  "Seek support",
  "Request action",
  "Announce a difficult employment action",
  "Explain performance or results",
  "Other",
] as const;
export type Goal = (typeof GOALS)[number];

export const AUDIENCE_SCOPES = ["Internal", "External", "Dual"] as const;
export type AudienceScope = (typeof AUDIENCE_SCOPES)[number];

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

/** Proactive: the organization is initiating. Reactive: it responds to something the audience already knows about (revision 9). */
export const STANCES = ["proactive", "reactive"] as const;
export type Stance = (typeof STANCES)[number];

export interface EvaluationRequest {
  draft: string;
  /** What happened. Selects the protocols that apply. */
  communication_event: CommunicationEvent;
  /** What the document is. Changes what it should contain, not the standard. */
  communication_format: CommunicationFormat;
  primary_audience: PrimaryAudience;
  setting: Setting;
  market: Market;
  goal: Goal;
  audience_scope: AudienceScope;
  context: ContextFields;
  heightened_review: boolean;
  already_published: boolean;
  audience_documents?: AudienceDocument[];
  stance?: Stance;
  /** When reactive: what the communication is responding to. */
  reacting_to?: string;
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
