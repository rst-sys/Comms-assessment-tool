/**
 * Builds the system blocks and the user message for the evaluation call
 * (PROMPT.md Sections 3, 5 and 10).
 */
import { protocolsFor } from "./protocols.js";
import { LAYOFF_BLOCK, SYSTEM_PROMPT } from "./promptText.js";
import {
  CLAIM_STATUSES,
  CONTEXT_FIELDS,
  DIMENSION_IDS,
  DOCUMENT_KINDS,
  DOCUMENT_REACH,
  PROTOCOL_STATUSES,
  READINESS_VALUES,
  RISK_LEVELS,
  SCAN_ASSESSMENTS,
  SCAN_CATEGORIES,
  SEVERITIES,
  SPECIALIST_REVIEW_TYPES,
  type EvaluationRequest,
} from "./types.js";

/**
 * Structural notes that the provider's structured-output schema cannot carry.
 * Appended after the verbatim system prompt as its own block.
 */
export const OUTPUT_NOTES = `OUTPUT STRUCTURE
The JSON object must satisfy these counts and conventions in addition to the schema:
- schema_version is "1.0".
- dimensions contains exactly ten entries, one per id, in this order: ${DIMENSION_IDS.join(", ")}. Scores are multiples of 0.5 from 0.0 to 5.0.
- executive_summary.headline is at most twelve words and states the key takeaway as a strong, specific line, for example "Owns the decision, but affected people are told nothing". executive_summary.assessment is two sentences and at most 60 words. strongest_elements and priority_improvements each contain exactly three strings of at most 25 words.
- Every string field in a finding, a scan entry and a persona is at most two sentences. finding states the gap; why_it_matters states the consequence; recommended_action names the kind of information to add, remove or clarify. Never write rewritten sentences or replacement wording anywhere in the output.
- findings use ids F-001, F-002, ... in order of materiality: F-001 is the gap a reasonable stakeholder would most need resolved, with High findings before Moderate before Low. Within one severity, order by dimension: accountability_agency, stakeholder_respect_impact, causation_explanation, truthfulness_factual_discipline, corrective_action_proof, listening_employee_voice, verification_follow_through, clarity_plain_language, fairness_independence_conflicts, future_readiness_learning. excerpt is an exact, character-for-character substring of the draft, or null when the finding is an omission; omission is then a description of what is missing. Never leave both null.
- claim_status is set on findings for accountability_agency, causation_explanation and corrective_action_proof, and null elsewhere.
- recommended_action and what_would_make_it_credible describe information ("the deciding body or role", "a date for the first update", "the selection criteria"), not text to paste. would_raise on each dimension does the same.
- agency_scan phrase is an exact substring of the draft. finding_id names the related finding or is null.
- devils_advocate.personas contains exactly five personas, no more and no fewer. Each persona has a headline of at most twelve words stating its key concern, written as a strong, specific line a reader would remember. The disclaimer is exactly: "These are plausible audience interpretations, not statements of fact."
- questions_before_publication contains between five and twelve questions.
- specialist_review_summary lists each review type named by any finding with specialist_review_needed true, without duplicates.
- Every value below is spelled exactly as given here, including its capital letters. Copy the spelling; do not upper-case it for emphasis even where the guidance above does.
  severity and agency_scan severity: ${SEVERITIES.join(" | ")}
  claim_status: ${CLAIM_STATUSES.join(" | ")} (note the initial capital only)
  executive_summary.risk_level: ${RISK_LEVELS.join(" | ")}
  executive_summary.readiness: ${READINESS_VALUES.join(" | ")}
  agency_scan category: ${SCAN_CATEGORIES.join(" | ")}
  agency_scan assessment: ${SCAN_ASSESSMENTS.join(" | ")}
  specialist_review_type and every entry of specialist_review_summary: ${SPECIALIST_REVIEW_TYPES.join(" | ")}
  protocol_review element status: ${PROTOCOL_STATUSES.join(" | ")}
- protocol_review is null unless a protocol block above tells you to fill it; then it carries that protocol's name, its source line, and one entry per element in the order the block gives, each with a status of Present, Partial or Absent and a one-sentence note.

WHAT EACH DIMENSION EVALUATES
Score each dimension against its own definition, not against a checklist of everything a message could contain. Do not lower a dimension for the absence of information it does not evaluate.
- accountability_agency: the decision is named, decision rights are visible, responsibility is matched to authority, failure is not abstracted while success is individualized. The organization's own name or "we" as the subject of an active decision, or a named body or role, is identified agency when the draft also owns the reasons; an individual's name is never required and its absence never lowers the score. A draft that owns the decision and its reasons in the organization's name scores 4.0 or above here even with no body or person named; the absence of a named body or role is at most a Low finding.
- truthfulness_factual_discipline: specificity, supportability, fact distinguished from forecast and aspiration, uncertainty disclosed, no misleading certainty.
- causation_explanation: root cause rather than symptoms, external context distinguished from internal exposure, credible and proportionate causal language.
- stakeholder_respect_impact: affected groups named, material impact acknowledged, no minimizing or euphemism, audience information needs met. Naming the affected group and its size, the impact on them and the support offered meets every element; a case the support does not spell out is a would-raise line, so such a draft scores 4.5 or above.
- listening_employee_voice: feedback used responsibly, stakeholder voice kept separate from leadership decisions, candor and psychological safety protected. A draft that cites no feedback, takes ownership plainly and shields the people affected from blame scores 4.5 or above here; a missing question channel is at most a Low finding, not a lower score.
- corrective_action_proof: specific, proportionate, owned, timed, feasible commitments; changed behavior, not just language.
- clarity_plain_language: affected audiences can understand what happened and what is next; no jargon, euphemism or agency-hiding passive voice.
- verification_follow_through: metrics, milestones, update dates, independent review, falsifiable commitments. A named owner, a fixed update cadence and an end date are milestones, update dates and a falsifiable commitment, so a draft that names them scores 4.5 or above even when no metric is named.
- fairness_independence_conflicts: interests disclosed, no scapegoating or self-serving framing, fair representation. A speaker who takes responsibility and explicitly protects the affected team from blame scores 4.0 or above; self-assessment without an independent reviewer is not by itself a low score.
- future_readiness_learning: changes to leadership practice, governance, incentives or operating model that reduce recurrence.

SCORE CALIBRATION
- Score what the draft does, not the further detail a reader might also want. A dimension scores 5.0 when every element it evaluates is present, specific and checkable; 4.5 when the elements are present and specific but one could be sharper or more detailed; 4.0 only when an element the dimension evaluates is entirely absent while the rest are specific; 3.0 or below when the dimension rests on values statements, intentions or reassurance. A present element that could carry more detail (a metric the update could name, an owner the process could name, a case the support could cover, a channel for questions) is a "what would raise this" line, never a reason to drop from 4.5 to 4.0.
- A draft that names the decision, who decided, the external cause and the internal exposure, the affected people and their support, a named owner with an update cadence, and a concrete change to prevent recurrence is a well-owned draft. On such a draft every uncapped dimension scores 4.5 or 5.0, findings are Low or Moderate, and the scan is empty or holds one Low entry.
- Do not withhold 4.5 or 5.0 because a specific claim is unconfirmed by context. That is what the ASSERTED cap is for, and it applies only to accountability_agency, causation_explanation and corrective_action_proof. A capped dimension scores 3.5, not lower, when the draft names the actor and the action and only context confirmation is missing.
- Severity is proportionate. High means a reasonable stakeholder could not tell what was decided, who decided, who is affected and how, what will change, or who owns it, or a HEIGHTENED REVIEW or LAYOFF AND RESTRUCTURING threshold was met. On a draft that names all of these, findings are Low or Moderate.
- Context moves scores. A context field that confirms a claim in the draft makes it SUPPORTED and lifts the ASSERTED cap on that dimension. A context field that supplies a fact the draft omits (who made the decision, a redeployment or support program, a review process, a prior commitment) turns an unknown into an undisclosed fact: the gap becomes a disclosure gap, which is less severe, so score that dimension at least 0.5 higher than the same draft would receive with no context, and have the finding and suggested revision state the confirmed fact instead of a placeholder. A draft with confirming context never scores the same as or lower than the same draft without it on the dimensions the context bears on.
- Readiness follows risk_level. Low: "Ready with minor edits" when no finding has specialist_review_needed true, otherwise "Revise before issuing". Moderate: "Revise before issuing", or "Escalate for senior or specialist review" when a High finding needs specialist review. High: "Escalate for senior or specialist review". Critical: "Do not issue until material gaps are resolved". Never return "Ready with minor edits" while any finding has specialist_review_needed true.

AGENCY AND ABSTRACTION SCAN WATCHLIST
Flag a phrase only when it is on this watchlist, or is a close equivalent in the same category, AND it is doing causal or explanatory work as described in AGENCY AND ABSTRACTION SCAN.
- External weather: headwinds, market conditions, macroeconomic pressures, industry pressure, sector conditions, changing environment, consumer sentiment, uncertainty, competitive landscape. Assessment: Legitimate context, or Incomplete explanation when it is the whole explanation. An external condition is never itself a Potential accountability gap; what is missing around it belongs in a finding.
- Institutional abstraction: the organization, the system, the process, culture, legacy structures, complexity, growth brought complexity, bureaucracy, fragmentation, the algorithm, the platform, the business. Assessment: Potential accountability gap when it stands in for a decision-maker. Growth and complexity are conditions of the organization, not decision-makers, so "growth brought complexity" as the cause of an internal decision is Institutional abstraction, High, Potential accountability gap: it leaves readers without an account of the leadership choices, structures, priorities or governance practices that produced the complexity.
- Audience displacement: misunderstanding, some people were offended, critics, those who interpreted it that way, people who already oppose us, social-media reaction, stakeholder concerns. Assessment: Potential accountability gap when it relocates the problem to the audience's reading.
- Passive accountability: mistakes were made, decisions were taken, concerns were raised, roles were eliminated, impacts were felt, expectations were not met, commitments were missed. Assessment: Potential accountability gap when the actor is knowable and omitted.
- Values without action: we take this seriously, we remain committed, our values guide us, we are listening, we will do better, we care deeply, we are focused on trust. Assessment: Incomplete explanation unless followed by a specific action.
- Vague action: streamline, optimize, rightsize, transform, enhance, simplify, evolve, modernize, realign, move forward, strengthen. Assessment: Incomplete explanation when no concrete action, owner or date follows.
Never flag: the organization's own name or "we" acting as the subject of a decision it owns; a named person, body or role acting as subject; a specific, dated or quantified event or cause; a plain admission of error; a concrete commitment that names its mechanism; a pointer to where more detail can be found; or an ordinary verb such as "affected", "changed" or "decided". Do not add a scan entry to record that language is acceptable: if a watchlist phrase is legitimate context and the same or the next sentence names the internal exposure or the actor, omit it. On a specific, well-owned draft the scan returns zero entries or one Low entry; several entries on such a draft mean the trigger rule was ignored.
The phrase is the clause doing the causal or explanatory work, including its verb and object where the clause has them, and no more than that: "Rapid growth brought complexity", not "Rapid growth"; "Some customers were offended", not "customers"; "Based on feedback from employees", not the whole sentence that follows it. When a sentence contains two watchlist phrases, flag each as its own entry rather than the sentence once.

PERSONA NAMES
Persona names are short role labels of one to four words, such as "Affected employee", "Remaining employee", "Front-line manager", "Customer", "Investor", "Analyst", "Journalist", "Regulator", "Labor representative". When the draft announces an adverse employment action, two of the five are named exactly "Affected employee" and "Remaining employee".`;

export interface SystemBlock {
  text: string;
}

/** System prompt blocks in order: verbatim prompt, optional layoff block, output notes. */
export function buildSystemBlocks(request: EvaluationRequest): SystemBlock[] {
  const blocks: SystemBlock[] = [{ text: SYSTEM_PROMPT }];
  if (request.communication_type === "Layoff or restructuring") {
    blocks.push({ text: LAYOFF_BLOCK });
  }
  for (const protocol of protocolsFor(request)) {
    blocks.push({ text: protocol.promptBlock });
  }
  blocks.push({ text: OUTPUT_NOTES });
  return blocks;
}

const NOT_SUPPLIED = "(not supplied)";

function block(label: string, body: string): string {
  return `${label}\n${body}`;
}

/** The user message: the draft and every intake field as labeled blocks. */
export function buildUserMessage(request: EvaluationRequest): string {
  const parts: string[] = [];

  parts.push(block("DRAFT", `<<<\n${request.draft.trim()}\n>>>`));

  parts.push(
    block(
      "INTAKE",
      [
        `Communication type: ${request.communication_type}`,
        `Primary audience: ${request.primary_audience}`,
        `Setting: ${request.setting}`,
        `Market: ${request.market}`,
        `Goal: ${request.goal}`,
        `Audience scope: ${request.audience_scope}`,
        `heightened_review: ${request.heightened_review}`,
        `already_published: ${request.already_published}`,
        `stance: ${request.stance ?? "proactive"}`,
        ...(request.stance === "reactive" ? [`reacting_to: ${request.reacting_to?.trim() || NOT_SUPPLIED}`] : []),
      ].join("\n"),
    ),
  );

  const contextLines = CONTEXT_FIELDS.map(([key, label]) => {
    const value = request.context[key]?.trim();
    return `${label}: ${value ? value : NOT_SUPPLIED}`;
  });
  const anyContext = CONTEXT_FIELDS.some(([key]) => (request.context[key] ?? "").trim().length > 0);
  parts.push(
    block(
      "CONTEXT (what the engine can rely on; these fields are the only ground truth)",
      (anyContext ? "" : "No context fields were supplied. Score agency and causation on the draft's language only and say so.\n") +
        contextLines.join("\n"),
    ),
  );

  const docs = request.audience_documents ?? [];
  if (docs.length > 0) {
    const kindLabel = Object.fromEntries(DOCUMENT_KINDS) as Record<string, string>;
    const reachLabel = Object.fromEntries(DOCUMENT_REACH) as Record<string, string>;
    const blocks = docs.map((d, i) =>
      [
        `Document ${i + 1}: ${d.title.trim() || "(untitled)"}`,
        `Kind: ${kindLabel[d.kind] ?? d.kind}`,
        `What it is: ${d.description.trim() || NOT_SUPPLIED}`,
        `How and when the audience receives or encountered it: ${d.delivery.trim() || NOT_SUPPLIED}`,
        `Reach: ${reachLabel[d.reach] ?? d.reach}${d.kind === "supporting" ? `; same time as the main communication: ${d.same_time ? "yes" : "no"}` : ""}`,
        `<<<\n${d.text.trim()}\n>>>`,
      ].join("\n"),
    );
    parts.push(block(`AUDIENCE CONTEXT DOCUMENTS (${docs.length}; what the audience already has or will receive)`, blocks.join("\n\n")));
  }

  const notes: string[] = [];
  if (request.already_published) {
    notes.push(
      "This draft has already been issued. Frame findings retrospectively, describing what may have left readers unclear rather than what to change before issuing. Any suggested revision is a model for future statements or a follow-up, not a fix to the original.",
    );
  }
  if (request.heightened_review) {
    notes.push("heightened_review is true. Apply the stricter thresholds described in HEIGHTENED REVIEW.");
  }
  if (notes.length > 0) parts.push(block("NOTES", notes.join("\n")));

  return parts.join("\n\n");
}
