/**
 * Intake rules from PROMPT.md Sections 3 and 4, kept free of React so they
 * can be unit-tested.
 */
import type { CommunicationType, EvaluationRequest, Market, Setting } from "../../engine/types.js";

export const MIN_WORDS = 50;
export const MAX_WORDS = 5000;

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

const HEIGHTENED_TYPES: CommunicationType[] = ["Layoff or restructuring", "Crisis statement", "Investor communication", "Apology"];
const HEIGHTENED_SETTINGS: Setting[] = ["Crisis", "Material corporate event"];

/** Auto-check heightened review for these types and settings; the user can uncheck it. */
export function heightenedByDefault(type: CommunicationType | "", setting: Setting | ""): boolean {
  return (type !== "" && HEIGHTENED_TYPES.includes(type)) || (setting !== "" && HEIGHTENED_SETTINGS.includes(setting));
}

const HIGH_RISK_TYPES: CommunicationType[] = ["Layoff or restructuring", "Investor communication", "Crisis statement"];
const HIGH_RISK_MARKETS: Market[] = ["European Union", "Germany", "France"];

export const HIGH_RISK_WARNING =
  "This topic typically requires legal, HR, labor, or investor-relations review. This tool does not provide it.";

export function showHighRiskWarning(type: CommunicationType | "", market: Market | ""): boolean {
  return (type !== "" && HIGH_RISK_TYPES.includes(type)) || (market !== "" && HIGH_RISK_MARKETS.includes(market));
}

export type RequiredFields = Pick<
  EvaluationRequest,
  "communication_type" | "primary_audience" | "setting" | "market" | "goal" | "audience_scope"
>;

export type DraftFields = { [K in keyof RequiredFields]: RequiredFields[K] | "" };

export const EMPTY_FIELDS: DraftFields = {
  communication_type: "",
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
 * The Evaluate button stays disabled until all seven required fields are set.
 * The draft counts as set when it is within the word range, or, for the
 * Section 12 demo drafts (which are under 50 words by design), non-empty.
 */
export function canEvaluate(draft: string, fields: DraftFields, isDemo: boolean): boolean {
  const words = wordCount(draft);
  const draftOk = isDemo ? words > 0 && words <= MAX_WORDS : words >= MIN_WORDS && words <= MAX_WORDS;
  return draftOk && fieldsComplete(fields);
}
