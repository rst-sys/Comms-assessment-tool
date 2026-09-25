/**
 * Builds the system blocks and the user message for the evaluation call
 * (PROMPT.md Sections 3, 5 and 10).
 */
import { MAX_FINDINGS, MAX_QUESTIONS, MIN_QUESTIONS } from "./limits.js";
import { protocolBlocksFor } from "./protocols.js";
import { SYSTEM_PROMPT } from "./promptText.js";
import {
  AFFECTED_AUDIENCE,
  AFFECTED_EMPLOYEE_LABELS,
  CLAIM_STATUSES,
  DIMENSION_IDS,
  DOCUMENT_KINDS,
  DOCUMENT_REACH,
  RISK_LEVELS,
  SCAN_CATEGORIES,
  SEVERITIES,
  SITUATION_DESCRIPTIONS,
  SPECIALIST_REVIEW_TYPES,
  OTHER_EVENT,
  OTHER_FORMAT,
  type Audience,
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
- executive_summary.headline is at most twelve words and states the key takeaway as a strong, specific line, for example "Owns the decision, but affected people are told nothing". strongest_elements and priority_improvements each contain exactly three strings of at most 25 words.
- Every string field in a finding, a scan entry and a persona is at most two sentences. finding states the gap and is the diagnosis: say what is missing or unsupported, not why it matters in the abstract. recommended_action names the kind of information to add, remove or clarify, and is shown to the reader as "Ways this could be rectified". Never write rewritten sentences or replacement wording anywhere in the output.
- findings contains at most ${MAX_FINDINGS} entries. This is a ceiling, not a target: a clean draft may have two. When more than ${MAX_FINDINGS} gaps are real, report the ${MAX_FINDINGS} that most change what a reasonable stakeholder would understand, and drop the rest rather than compressing them all. A protocol block above tells you what to look for; it never raises the ceiling.
- findings use ids F-001, F-002, ... in order of materiality: F-001 is the gap a reasonable stakeholder would most need resolved, with High findings before Moderate before Low. Within one severity, order by dimension: accountability_agency, stakeholder_respect_impact, causation_explanation, truthfulness_factual_discipline, corrective_action_proof, listening_employee_voice, verification_follow_through, clarity_plain_language, fairness_independence_conflicts, future_readiness_learning. excerpt is an exact, character-for-character substring of the draft, or null when the finding is an omission; omission is then a description of what is missing. Never leave both null.
- claim_status is set on findings for accountability_agency, causation_explanation and corrective_action_proof, and null elsewhere.
- recommended_action and what_would_make_it_credible describe information ("the deciding body or role", "a date for the first update", "the selection criteria"), not text to paste. would_raise on each dimension does the same.
- devils_advocate.personas contains exactly five personas, no more and no fewer. Each carries persona (the audience, named as a person) and might_say (one sentence in their own voice, at most 25 words). Neither may be empty: a persona with a blank field is worse than no persona at all, and the review is rejected when one is. The disclaimer is exactly: "These are plausible audience interpretations, not statements of fact."
- questions_before_publication contains at least ${MIN_QUESTIONS} questions and at most ${MAX_QUESTIONS}. ${MIN_QUESTIONS} is a floor, not a target to cut down to: every draft leaves something worth settling, and a review that asks fewer has stopped looking. Where the protocols above list questions, apply the selection rule stated with them.
- specialist_review_summary lists each review type named by any finding with specialist_review_needed true, without duplicates.
- Every value below is spelled exactly as given here, including its capital letters. Copy the spelling; do not upper-case it for emphasis even where the guidance above does.
  severity: ${SEVERITIES.join(" | ")}
  claim_status: ${CLAIM_STATUSES.join(" | ")} (note the initial capital only)
  executive_summary.risk_level: ${RISK_LEVELS.join(" | ")}
  specialist_review_type and every entry of specialist_review_summary: ${SPECIALIST_REVIEW_TYPES.join(" | ")}

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
  /**
   * Whether the provider should cache everything up to and including this
   * block. The framework prompt is one, because it is identical on every
   * review; the last block is another, because a second review of the same
   * event then re-reads nothing.
   */
  cache?: boolean;
}

/**
 * System prompt blocks, in order: the framework, then whatever protocols the
 * event and goal bring in, then the output notes.
 *
 * The order is deliberate. The framework is identical on every review and the
 * core protocol is identical on every high-stakes review, so both sit ahead of
 * the part that varies by event; the provider caches the stable prefix and
 * only the tail is new work.
 *
 * The layoff block that used to live here is gone: protocols/workforce-restructuring.md
 * now carries its euphemism list and its triggers, so there is one source for
 * that standard rather than two saying nearly the same thing.
 */
export function buildSystemBlocks(request: EvaluationRequest): SystemBlock[] {
  // The framework prompt is the cache boundary every review shares. The
  // protocol blocks that follow vary by event, so caching only at the end
  // would give each event its own entry and nothing in common.
  //
  // The order is deliberately unchanged: the output notes still come after
  // the protocols, where they have always been. Moving them ahead would make
  // the prompt "stable parts first" and would also rewrite it, which is a
  // scoring change, not a plumbing one.
  const blocks: SystemBlock[] = [{ text: SYSTEM_PROMPT, cache: true }];
  for (const text of protocolBlocksFor(request)) {
    blocks.push({ text });
  }
  blocks.push({ text: OUTPUT_NOTES, cache: true });
  return blocks;
}

const NOT_SUPPLIED = "(not supplied)";

function block(label: string, body: string): string {
  return `${label}\n${body}`;
}

/** How the audience "Employees directly affected" is named for this event. */
function audienceLabel(audience: Audience, request: EvaluationRequest): string {
  if (audience !== AFFECTED_AUDIENCE) return audience;
  return AFFECTED_EMPLOYEE_LABELS[request.communication_event] ?? audience;
}

/**
 * The intake, as the engine reads it.
 *
 * Written as questions and answers rather than field names, because that is
 * what the fields now are: "What happened" and "Who will receive this" are
 * the labels the user saw, and matching them keeps the review's language and
 * the screen's language the same.
 */
export function intakeLines(request: EvaluationRequest): string[] {
  const org = request.organization;
  const listed = org.listed_where?.trim();
  const audiences = request.audiences.map((a) => audienceLabel(a, request));
  const lines = [
    `Organization: ${org.type}${listed ? `, listed on ${listed}` : ""}${org.headquarters.trim() ? `, headquartered in ${org.headquarters.trim()}` : ""}`,
    `What happened: ${request.communication_event}${
      request.communication_event === OTHER_EVENT && request.event_description?.trim()
        ? ` — ${request.event_description.trim()}`
        : ""
    }`,
    `What they are drafting: ${request.communication_format}${
      request.communication_format === OTHER_FORMAT && request.format_description?.trim()
        ? ` — ${request.format_description.trim()}`
        : ""
    }`,
    `Who will receive it: ${audiences.length > 0 ? audiences.join(", ") : NOT_SUPPLIED}`,
    `Where things stand: ${request.situation} — ${SITUATION_DESCRIPTIONS[request.situation].toLowerCase()}`,
    `People have been harmed or put at risk: ${request.people_at_risk ? "yes" : "no"}`,
    `Where the affected people are: ${request.locations.length > 0 ? request.locations.join(", ") : NOT_SUPPLIED}`,
    `What the draft is mainly trying to do: ${request.purpose}`,
    `already_published: ${request.already_published}`,
  ];
  // Two employee audiences in one draft is its own test: the people losing
  // something and the people staying read the same words and need different
  // things from them, and a draft written for one usually says nothing to
  // the other.
  if (request.audiences.includes("All employees") && request.audiences.includes(AFFECTED_AUDIENCE)) {
    lines.push(
      "Note: this draft goes to all employees and to the people directly affected. Judge what it says to the employees who are not directly affected as well as to those who are; a draft that speaks only to one of the two groups is incomplete for the audience it names.",
    );
  }
  return lines;
}

/** The user message: the draft and every intake field as labeled blocks. */
export function buildUserMessage(request: EvaluationRequest): string {
  const parts: string[] = [];

  parts.push(block("DRAFT", `<<<\n${request.draft.trim()}\n>>>`));

  parts.push(block("INTAKE", intakeLines(request).join("\n")));

  const announcement = request.main_announcement?.trim();
  if (announcement) {
    parts.push(
      block(
        "THE MAIN ANNOUNCEMENT THIS DRAFT SUPPORTS",
        "The draft above is supporting material for the announcement below. Check that it says nothing that goes beyond or contradicts it, and raise anything it adds that the announcement does not carry.\n" +
          `<<<\n${announcement}\n>>>`,
      ),
    );
  }

  const context = request.context.trim();
  parts.push(
    block(
      "CONTEXT (what the engine can rely on; this is the only ground truth)",
      context.length > 0
        ? `The author supplied this, and it is fact. Everything in the draft is a claim.\n<<<\n${context}\n>>>`
        : "No context was supplied. Score agency and causation on the draft's language only and say so.",
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
  if (notes.length > 0) parts.push(block("NOTES", notes.join("\n")));

  return parts.join("\n\n");
}
