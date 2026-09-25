/**
 * Intake rules from PROMPT.md Sections 3 and 4, kept free of React so they
 * can be unit-tested.
 */
import type { CommunicationEvent, EvaluationRequest, Market, Setting } from "../../engine/types.js";

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

const HIGH_RISK_EVENTS: CommunicationEvent[] = [
  "Workforce reduction or major reorganization",
  "Cyberattack or data incident",
  "Regulatory investigation, litigation or ethics allegation",
  "Acquisition, divestiture or major integration",
  "Poor financial results, site closure or strategic retreat",
  "Employee-relations controversy or union escalation",
];
const HIGH_RISK_MARKETS: Market[] = ["European Union", "Germany", "France"];

export const HIGH_RISK_WARNING =
  "This topic typically requires legal, HR, labor, or investor-relations review. This tool does not provide it.";

export function showHighRiskWarning(event: CommunicationEvent | "", market: Market | ""): boolean {
  return (event !== "" && HIGH_RISK_EVENTS.includes(event)) || (market !== "" && HIGH_RISK_MARKETS.includes(market));
}

export type RequiredFields = Pick<
  EvaluationRequest,
  | "communication_event"
  | "communication_format"
  | "primary_audience"
  | "setting"
  | "market"
  | "goal"
  | "audience_scope"
>;

export type DraftFields = { [K in keyof RequiredFields]: RequiredFields[K] | "" };

export const EMPTY_FIELDS: DraftFields = {
  communication_event: "",
  communication_format: "",
  primary_audience: "",
  setting: "",
  market: "",
  goal: "",
  audience_scope: "",
};

export function fieldsComplete(fields: DraftFields): fields is RequiredFields {
  return Object.values(fields).every((v) => v !== "");
}

/**
 * The Evaluate button stays disabled until all required fields are set.
 * The draft counts as set when it is within the word range, or, for the
 * Section 12 demo drafts (which are under 50 words by design), non-empty.
 */
export function canEvaluate(draft: string, fields: DraftFields, isDemo: boolean): boolean {
  const words = wordCount(draft);
  const draftOk = isDemo ? words > 0 && words <= MAX_WORDS : words >= MIN_WORDS && words <= MAX_WORDS;
  return draftOk && fieldsComplete(fields);
}
