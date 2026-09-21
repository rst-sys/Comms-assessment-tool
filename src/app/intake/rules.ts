/**
 * Intake rules from PROMPT.md Sections 3 and 4, kept free of React so they
 * can be unit-tested.
 */
import type { CommunicationEvent, EvaluationRequest, Market, Setting } from "../../engine/types.js";

export const MIN_WORDS = 50;
export const MAX_WORDS = 5000;

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Events that turn heightened review on by default. Not every high-stakes
 * event: these are the ones where a misstatement carries legal, financial or
 * physical consequence, which is what the stricter thresholds are for. The
 * user can always uncheck it.
 */
const HEIGHTENED_EVENTS: CommunicationEvent[] = [
  "Workforce reduction or major reorganization",
  "Cyberattack or data incident",
  "Workplace safety event or facility emergency",
  "Regulatory investigation, litigation or ethics allegation",
  "Acquisition, divestiture or major integration",
  "Poor financial results, site closure or strategic retreat",
];
const HEIGHTENED_SETTINGS: Setting[] = ["Crisis", "Material corporate event"];

/** Auto-check heightened review for these events and settings; the user can uncheck it. */
export function heightenedByDefault(event: CommunicationEvent | "", setting: Setting | ""): boolean {
  return (event !== "" && HEIGHTENED_EVENTS.includes(event)) || (setting !== "" && HEIGHTENED_SETTINGS.includes(setting));
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
