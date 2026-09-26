/**
 * Intake rules, kept free of React so they can be unit-tested.
 *
 * The screen asks eight questions before the draft: who the organization is,
 * what happened, what they are drafting, who will receive it, where things
 * stand, where the affected people are, and what the draft is mainly trying
 * to do. This file holds what each answer requires, what it turns on, and
 * when the Evaluate button is allowed to work.
 */
import {
  AFFECTED_AUDIENCE,
  AFFECTED_EMPLOYEE_LABELS,
  DEFAULT_AUDIENCES,
  DISCLOSURE_FORMAT,
  EU_MEMBER_STATES,
  INVESTOR_AUDIENCE,
  INVESTOR_AUDIENCE_LABELS,
  OTHER_EVENT,
  OTHER_FORMAT,
  TOOLKIT_FORMAT,
  uncoveredLocations,
  type Audience,
  type CommunicationEvent,
  type CommunicationFormat,
  type EvaluationRequest,
  type OrganizationType,
  type Purpose,
  type SituationStatus,
} from "../../engine/types.js";

/**
 * What the intake shows when a review fails.
 *
 * The reference is what ties the red line on screen to the line in the
 * service log, and the elapsed time separates a slow failure from an instant
 * one — a timeout and a refusal look identical otherwise.
 */
export interface EvaluationFailure {
  message: string;
  requestId?: string;
  seconds: number;
}

export const MIN_WORDS = 50;
export const MAX_WORDS = 5000;

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/** Every answer the screen collects before the draft. Empty strings mean unanswered. */
export interface IntakeState {
  organization_type: OrganizationType | "";
  listed_where: string;
  headquarters: string;
  communication_event: CommunicationEvent | "";
  event_description: string;
  communication_format: CommunicationFormat | "";
  format_description: string;
  main_announcement: string;
  audiences: Audience[];
  situation: SituationStatus | "";
  people_at_risk: boolean;
  locations: string[];
  purpose: Purpose | "";
}

export const EMPTY_INTAKE: IntakeState = {
  organization_type: "",
  listed_where: "",
  headquarters: "",
  communication_event: "",
  event_description: "",
  communication_format: "",
  format_description: "",
  main_announcement: "",
  audiences: [],
  situation: "",
  people_at_risk: false,
  locations: [],
  purpose: "",
};

// ---------------------------------------------------------------------------
// What each answer turns on
// ---------------------------------------------------------------------------

/** The name this event gives the people it directly affects, or null when it affects nobody in particular. */
export function affectedAudienceLabel(event: CommunicationEvent | ""): string | null {
  if (event === "") return null;
  return AFFECTED_EMPLOYEE_LABELS[event] ?? null;
}

/** What "Investors and analysts" is called here, or null when this kind of organization has none. */
export function investorAudienceLabel(type: OrganizationType | ""): string | null {
  if (type === "") return INVESTOR_AUDIENCE;
  return INVESTOR_AUDIENCE_LABELS[type] ?? null;
}

/** The audiences this format normally goes to, minus any the profile or event hides. */
export function defaultAudiences(format: CommunicationFormat | "", state: IntakeState): Audience[] {
  if (format === "") return [];
  return DEFAULT_AUDIENCES[format].filter((a) => audienceVisible(a, state));
}

/** Whether an audience is offered at all, given the organization and the event. */
export function audienceVisible(audience: Audience, state: IntakeState): boolean {
  if (audience === AFFECTED_AUDIENCE) return affectedAudienceLabel(state.communication_event) !== null;
  if (audience === INVESTOR_AUDIENCE) return investorAudienceLabel(state.organization_type) !== null;
  return true;
}

/** Only a listed company can be making a market disclosure. */
export function disclosureMismatch(state: IntakeState): boolean {
  return (
    state.communication_format === DISCLOSURE_FORMAT &&
    state.organization_type !== "" &&
    state.organization_type !== "Publicly listed company"
  );
}

/** Supporting material can be checked against the announcement it supports. */
export function showMainAnnouncement(format: CommunicationFormat | ""): boolean {
  return format === TOOLKIT_FORMAT;
}

export function showEventDescription(event: CommunicationEvent | ""): boolean {
  return event === OTHER_EVENT;
}

export function showFormatDescription(format: CommunicationFormat | ""): boolean {
  return format === OTHER_FORMAT;
}

export const EU_LOCATION = "European Union";
export const GLOBAL_LOCATION = "Multiple regions / global";

/** Consultation rules differ by member state, so the EU pick invites the countries. */
export function showEuCountries(locations: readonly string[]): boolean {
  return locations.includes(EU_LOCATION);
}

export function showGlobalCountries(locations: readonly string[]): boolean {
  return locations.includes(GLOBAL_LOCATION);
}

/** Places the tool carries no legal checks for, in the order they were chosen. */
export function locationsWithoutCoverage(locations: readonly string[]): string[] {
  return uncoveredLocations(locations);
}

export function coverageNotice(locations: readonly string[]): string | null {
  const missing = locationsWithoutCoverage(locations);
  if (missing.length === 0) return null;
  const names = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
  return `Legal checks for ${names} aren't included. This assessment covers how complete and honest the account is, not local legal requirements.`;
}

// ---------------------------------------------------------------------------
// The warning above the button
// ---------------------------------------------------------------------------

/** Events that normally need a specialist to see the draft before it goes out. */
const HIGH_RISK_EVENTS: readonly CommunicationEvent[] = [
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
];

/** Places where consulting employees before announcing is a legal step, not a courtesy. */
const HIGH_RISK_LOCATIONS: readonly string[] = [EU_LOCATION, ...EU_MEMBER_STATES];

export const HIGH_RISK_WARNING =
  "This topic typically requires legal, HR, labor, or investor-relations review. This tool does not provide it.";

export function showHighRiskWarning(event: CommunicationEvent | "", locations: readonly string[]): boolean {
  if (event !== "" && HIGH_RISK_EVENTS.includes(event)) return true;
  return locations.some((l) => HIGH_RISK_LOCATIONS.includes(l));
}

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

/**
 * What is still missing, in the words the screen uses for it.
 *
 * A list rather than a boolean because a disabled button with no explanation
 * is the commonest way a form wastes somebody's afternoon. The screen shows
 * this under the button.
 */
export function missingAnswers(state: IntakeState): string[] {
  const missing: string[] = [];
  if (state.organization_type === "") missing.push("Type of organization");
  if (state.headquarters.trim() === "") missing.push("Headquarters");
  if (state.communication_event === "") missing.push("What's happening");
  else if (showEventDescription(state.communication_event) && state.event_description.trim() === "") {
    missing.push("What's happening, in your own words");
  }
  if (state.communication_format === "") missing.push("What are you drafting");
  else if (showFormatDescription(state.communication_format) && state.format_description.trim() === "") {
    missing.push("What you're drafting, in your own words");
  }
  if (state.audiences.length === 0) missing.push("Who will receive this");
  if (state.situation === "") missing.push("Where do things stand");
  if (state.locations.length === 0) missing.push("Where is this happening");
  if (state.purpose === "") missing.push("What is this draft mainly trying to do");
  return missing;
}

export function intakeComplete(state: IntakeState): boolean {
  return missingAnswers(state).length === 0;
}

/**
 * The Evaluate button stays disabled until every question is answered.
 * The draft counts as ready when it is within the word range, or, for the
 * Section 12 demo drafts (which are under 50 words by design), non-empty.
 */
export function canEvaluate(draft: string, state: IntakeState, isDemo: boolean): boolean {
  const words = wordCount(draft);
  const draftOk = isDemo ? words > 0 && words <= MAX_WORDS : words >= MIN_WORDS && words <= MAX_WORDS;
  return draftOk && intakeComplete(state);
}

/** The answers, as the engine's request carries them. Call only when the intake is complete. */
export function intakeFields(
  state: IntakeState,
): Pick<
  EvaluationRequest,
  | "organization"
  | "communication_event"
  | "event_description"
  | "communication_format"
  | "format_description"
  | "main_announcement"
  | "audiences"
  | "situation"
  | "people_at_risk"
  | "locations"
  | "purpose"
> {
  const listed = state.listed_where.trim();
  return {
    organization: {
      type: state.organization_type as OrganizationType,
      ...(state.organization_type === "Publicly listed company" && listed ? { listed_where: listed } : {}),
      headquarters: state.headquarters.trim(),
    },
    communication_event: state.communication_event as CommunicationEvent,
    ...(showEventDescription(state.communication_event) && state.event_description.trim()
      ? { event_description: state.event_description.trim() }
      : {}),
    communication_format: state.communication_format as CommunicationFormat,
    ...(showFormatDescription(state.communication_format) && state.format_description.trim()
      ? { format_description: state.format_description.trim() }
      : {}),
    ...(showMainAnnouncement(state.communication_format) && state.main_announcement.trim()
      ? { main_announcement: state.main_announcement.trim() }
      : {}),
    audiences: [...state.audiences],
    situation: state.situation as SituationStatus,
    people_at_risk: state.people_at_risk,
    locations: [...state.locations],
    purpose: state.purpose as Purpose,
  };
}

/** The screen's state, restored from a request (a demo, or a saved review's settings). */
export function intakeFromRequest(request: EvaluationRequest): IntakeState {
  return {
    organization_type: request.organization.type,
    listed_where: request.organization.listed_where ?? "",
    headquarters: request.organization.headquarters,
    communication_event: request.communication_event,
    event_description: request.event_description ?? "",
    communication_format: request.communication_format,
    format_description: request.format_description ?? "",
    main_announcement: request.main_announcement ?? "",
    audiences: [...request.audiences],
    situation: request.situation,
    people_at_risk: request.people_at_risk,
    locations: [...request.locations],
    purpose: request.purpose,
  };
}
