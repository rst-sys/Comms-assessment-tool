/**
 * Type-specific protocols the engine applies on top of the core framework
 * (PROMPT.md Section 10 and revision 14). Each names a published source, the
 * communications it applies to, and the elements the engine checks. The
 * Standards Library page renders this list, so what the tool claims to apply
 * and what it actually sends to the model cannot drift apart.
 */
import type { DimensionId, EvaluationRequest } from "./types.js";

export interface ProtocolElementSpec {
  name: string;
  meaning: string;
  /** What the research says about this element's weight. */
  importance: string;
  /** The scored dimension this element bears on. A protocol is a lens on the ten dimensions, never an eleventh score. */
  dimension: DimensionId;
}

export interface ProtocolSpec {
  id: string;
  name: string;
  source: string;
  /** How the evidence was produced, in a sentence. */
  basis: string;
  appliesTo: string;
  elements: ProtocolElementSpec[];
  /** The prompt block sent to the model when the protocol applies. */
  promptBlock: string;
  applies: (request: EvaluationRequest) => boolean;
}

export const APOLOGY_ELEMENTS: ProtocolElementSpec[] = [
  { name: "Expression of regret", meaning: "Saying you are sorry.", importance: "Middle weight; close to equal with the explanation and the declaration of repentance.", dimension: "stakeholder_respect_impact" },
  { name: "Explanation of what went wrong", meaning: "An account of what happened.", importance: "Middle weight.", dimension: "causation_explanation" },
  { name: "Acknowledgment of responsibility", meaning: "Saying it was your fault, that you made the mistake.", importance: "Most important of the six.", dimension: "accountability_agency" },
  { name: "Declaration of repentance", meaning: "A statement that it will not happen again.", importance: "Middle weight.", dimension: "future_readiness_learning" },
  { name: "Offer of repair", meaning: "A commitment to undo the damage.", importance: "Second most important; talk is cheap, and repair commits you to action.", dimension: "corrective_action_proof" },
  { name: "Request for forgiveness", meaning: "Asking to be forgiven.", importance: "Least important; the one to leave out if something must go.", dimension: "stakeholder_respect_impact" },
];

const APOLOGY_PROMPT = `EFFECTIVE APOLOGY REVIEW
This draft is an apology or seeks to repair trust, so apply the structure of an effective apology from "An Exploration of the Structure of Effective Apologies" (Lewicki, Polin and Lount, Negotiation and Conflict Management Research, 2016), which tested apologies containing one to six components across two studies with 755 participants.

The six components, and what the research found about each:
1. Expression of regret — saying you are sorry. Middle weight.
2. Explanation of what went wrong — an account of what happened. Middle weight.
3. Acknowledgment of responsibility — saying it was your fault, that you made the mistake. THE MOST IMPORTANT component.
4. Declaration of repentance — a statement that it will not happen again. Middle weight.
5. Offer of repair — a commitment to undo the damage. THE SECOND MOST IMPORTANT; the research notes that talk is cheap, and an offer of repair commits the speaker to action.
6. Request for forgiveness — asking to be forgiven. THE LEAST IMPORTANT; the one to leave out if something must go.

The research also found that the more of the six an apology contains, the more effective readers judge it, and that apologies for failures of integrity are accepted less readily than apologies for failures of competence. Where the draft concerns an integrity failure, say so in the relevant finding.

Fill protocol_review with all six components in the order above. For each, give a status of Present, Partial or Absent judged only on what the draft says, and one sentence of evidence citing the draft or naming what is missing.

Weight your findings to match the evidence: an absent or merely gestural acknowledgment of responsibility, or an absent offer of repair, is at least a High-severity finding in an apology; an absent request for forgiveness is at most Low, and often no finding at all. Never tell the author to add a component the facts do not support, and never supply wording.

These components are a lens on the dimensions you already score, not a separate score. Each bears on one dimension:
${APOLOGY_ELEMENTS.map((e) => `- ${e.name} bears on ${e.dimension}.`).join("\n")}
Whether a repair commitment is checkable also bears on verification_follow_through.`;

export const APOLOGY_PROTOCOL: ProtocolSpec = {
  id: "effective-apology",
  name: "Effective apology",
  source: "Lewicki, R. J., Polin, B., & Lount, R. B. (2016). An Exploration of the Structure of Effective Apologies. Negotiation and Conflict Management Research, 9(2), 177–196.",
  basis: "Two studies with 755 participants rated apologies containing one to six components for how effective, credible and adequate they were.",
  appliesTo: 'Communication type "Apology", or the goal "Apologize or repair trust".',
  elements: APOLOGY_ELEMENTS,
  promptBlock: APOLOGY_PROMPT,
  applies: (r) => r.communication_type === "Apology" || r.goal === "Apologize or repair trust",
};

/** The layoff protocol already carried in PROMPT.md Section 10; listed here so the library is complete. */
export const LAYOFF_PROTOCOL_SUMMARY = {
  id: "layoff-restructuring",
  name: "Layoff and restructuring review",
  source: "PROMPT.md Section 10, the build specification for this tool.",
  basis: "Drawn from the accountability framework the tool is built on, not from a published study.",
  appliesTo: 'Communication type "Layoff or restructuring".',
  checks: [
    "Employee feedback cited as a reason for reduction without saying leadership decided.",
    "Growth, complexity or legacy structures named as the cause without leadership agency.",
    "Headcount reduction with no selection criteria, transition support or review process.",
    "A leaner organization described with no plan for decision rights or recurrence.",
    "Investment in growth areas with no reference to redeployment or reskilling.",
    "People described as redundant without separating the role from the person.",
  ],
};

export const PROTOCOLS: ProtocolSpec[] = [APOLOGY_PROTOCOL];

/** The protocols that apply to this request. */
export function protocolsFor(request: EvaluationRequest): ProtocolSpec[] {
  return PROTOCOLS.filter((p) => p.applies(request));
}
