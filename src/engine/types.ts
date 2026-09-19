/**
 * Shared types for the evaluation engine.
 *
 * Intake enumerations come from PROMPT.md Section 3; the analysis shape mirrors
 * the JSON schema in Section 6. The engine never sees anything but the draft
 * text and these fields.
 */

export const COMMUNICATION_TYPES = [
  "CEO or executive message",
  "Employee announcement",
  "Layoff or restructuring",
  "Press release",
  "Crisis statement",
  "Holding statement",
  "Apology",
  "Investor communication",
  "Product or service announcement",
  "Policy or public-affairs",
  "Change-management",
  "Social-media post",
  "Talking points",
  "Manager toolkit",
  "FAQ",
  "Other",
] as const;
export type CommunicationType = (typeof COMMUNICATION_TYPES)[number];

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
  communication_type: CommunicationType;
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

export const READINESS_VALUES = [
  "Ready with minor edits",
  "Revise before issuing",
  "Escalate for senior or specialist review",
  "Do not issue until material gaps are resolved",
] as const;
export type Readiness = (typeof READINESS_VALUES)[number];

export const SEVERITIES = ["Low", "Moderate", "High"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CLAIM_STATUSES = ["Asserted", "Supported", "Unverifiable"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const SPECIALIST_REVIEW_TYPES = [
  "Legal",
  "HR",
  "Labor",
  "Privacy",
  "Investor relations",
  "Local market",
  "Executive",
] as const;
export type SpecialistReviewType = (typeof SPECIALIST_REVIEW_TYPES)[number];

export const SCAN_CATEGORIES = [
  "External weather",
  "Institutional abstraction",
  "Audience displacement",
  "Passive accountability",
  "Values without action",
  "Vague action",
] as const;
export type ScanCategory = (typeof SCAN_CATEGORIES)[number];

export const SCAN_ASSESSMENTS = [
  "Legitimate context",
  "Incomplete explanation",
  "Potential accountability gap",
] as const;
export type ScanAssessment = (typeof SCAN_ASSESSMENTS)[number];

export const DEVILS_ADVOCATE_DISCLAIMER =
  "These are plausible audience interpretations, not statements of fact.";

export const SCHEMA_VERSION = "1.0";

export interface ExecutiveSummary {
  /** At most twelve words: the key takeaway. */
  headline: string;
  assessment: string;
  risk_level: RiskLevel;
  readiness: Readiness;
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
  why_it_matters: string;
  stakeholder_risk: string;
  /** The kind of information to add, remove or clarify; never rewritten text. */
  recommended_action: string;
  fact_validation_needed: boolean;
  specialist_review_needed: boolean;
  specialist_review_type: SpecialistReviewType | null;
  confidence_note: string;
}

export interface AgencyScanItem {
  phrase: string;
  category: ScanCategory;
  severity: Severity;
  assessment: ScanAssessment;
  why: string;
  what_would_make_it_credible: string;
  finding_id: string | null;
}

export interface Persona {
  persona: string;
  /** At most twelve words: the persona's key concern. */
  headline: string;
  may_hear: string;
  may_question: string;
  may_find_missing: string;
  would_address_it: string;
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
  agency_scan: AgencyScanItem[];
  devils_advocate: DevilsAdvocate;
  questions_before_publication: string[];
  specialist_review_summary: SpecialistReviewType[];
}
