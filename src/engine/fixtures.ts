/**
 * Demo fixtures, the control draft, and the expected findings from
 * PROMPT.md Section 12. All drafts are fictional. The expectations are the
 * build's test suite; scripts/run-fixtures.ts evaluates them against the
 * live engine.
 */
import type {
  EvaluationRequest,
  Readiness,
  ScanAssessment,
  ScanCategory,
  Severity,
  SpecialistReviewType,
} from "./types.js";

export interface HighFindingExpectation {
  label: string;
  /** Tested against the concatenated text of each finding at or above min_severity. */
  pattern: RegExp;
  /** Lowest severity that satisfies this expectation. Defaults to High. */
  min_severity?: Severity;
}

export interface ScanExpectation {
  phrase: RegExp;
  category?: ScanCategory;
  severity?: Severity;
  assessment?: ScanAssessment;
}

export interface FixtureExpectation {
  max_score?: number;
  min_score?: number;
  readiness?: Readiness[];
  high_findings?: HighFindingExpectation[];
  scan_flags?: ScanExpectation[];
  /** Upper bound on agency-scan entries (the false-positive ceiling). */
  max_scan_flags?: number;
  /** Every scan entry must be at or below this severity. */
  max_scan_severity?: Severity;
  specialist_review?: SpecialistReviewType[];
  personas?: RegExp[];
  most_damaging?: RegExp;
}

export interface Fixture {
  key: string;
  name: string;
  request: EvaluationRequest;
  expect: FixtureExpectation;
}

const demo1Request: EvaluationRequest = {
  draft:
    "Rapid growth brought complexity. Based on feedback from employees, we are eliminating roles to become leaner and more agile. These changes will help us focus on what matters most.",
  communication_type: "Layoff or restructuring",
  primary_audience: "All employees",
  setting: "High stakes",
  market: "United States",
  goal: "Announce a difficult employment action",
  audience_scope: "Internal",
  context: {},
  heightened_review: true,
  already_published: false,
};

export const DEMO_1: Fixture = {
  key: "demo1",
  name: "Demo 1 — Restructuring memo",
  request: demo1Request,
  expect: {
    max_score: 39,
    readiness: ["Do not issue until material gaps are resolved"],
    high_findings: [
      { label: "growth as a nonhuman cause", pattern: /growth|complexity/i },
      { label: "employee feedback near an adverse decision", pattern: /feedback/i },
      { label: "no leadership ownership", pattern: /leadership|leaders|who (made|decided)|decision[- ]maker|owner/i },
      { label: "no decision rights", pattern: /decision rights|authority|approv|who decided|decided by/i },
      { label: "no selection criteria or support", pattern: /criteria|selection|support|transition|severance|appeal/i },
      { label: "no redeployment", pattern: /redeploy|reskill|internal mobility|redeployment/i },
      { label: "no correction beyond headcount", pattern: /beyond|headcount|only (action|change)|other than|solely|correction/i },
      { label: "no learning plan", pattern: /learn|recurr|prevent|governance|operating model/i },
      { label: "no verification", pattern: /verif|metric|milestone|update|measur|follow[- ]through/i },
    ],
    scan_flags: [
      { phrase: /rapid growth brought complexity/i, category: "Institutional abstraction", severity: "High" },
      { phrase: /leaner and more agile/i, category: "Vague action" },
    ],
    specialist_review: ["HR", "Labor"],
    personas: [/affected employee/i, /remaining employee/i],
  },
};

export const DEMO_1_WITH_CONTEXT: Fixture = {
  key: "demo1-context",
  name: "Demo 1 with known facts (calibration 1)",
  request: {
    ...demo1Request,
    context: {
      known_facts:
        "The CEO and the executive team made the decision to eliminate the roles. A redeployment program exists and affected employees are eligible to apply for open roles through it.",
    },
  },
  expect: {},
};

export const DEMO_2: Fixture = {
  key: "demo2",
  name: "Demo 2 — Product apology",
  request: {
    draft:
      "Some customers were offended by content that did not reflect our values. We are committed to learning from this.",
    communication_type: "Apology",
    primary_audience: "Customers",
    setting: "Sensitive",
    market: "Global or multi-market",
    goal: "Apologize or repair trust",
    audience_scope: "External",
    context: {},
    heightened_review: true,
    already_published: false,
  },
  expect: {
    max_score: 44,
    high_findings: [
      { label: "audience displacement", pattern: /offended|audience|displace|reaction|reader/i },
      { label: "content treated as autonomous, no approval chain", pattern: /approv|who (created|produced|published|wrote|made)|autonomous|as if|on its own|review process|chain/i },
      { label: "no harm acknowledgment", pattern: /harm|impact|affected|hurt/i },
      { label: "values without action", pattern: /values|committed|commitment/i },
      { label: "no corrective action", pattern: /correct|action|what will change|what (has|is) chang/i },
      { label: "no timeline", pattern: /timeline|date|when|by which/i },
      { label: "no verification", pattern: /verif|measur|metric|update|follow[- ]through/i, min_severity: "Moderate" },
    ],
    scan_flags: [
      { phrase: /some customers were offended/i, category: "Audience displacement" },
      { phrase: /committed to learning/i, category: "Values without action" },
    ],
    most_damaging: /audience|customer|offen|reaction|blame|responsib|fault|sensitiv/i,
  },
};

export const DEMO_3: Fixture = {
  key: "demo3",
  name: "Demo 3 — Investor statement",
  request: {
    draft:
      "Macroeconomic headwinds and sector-wide conditions affected performance. We remain confident in our strategy.",
    communication_type: "Investor communication",
    primary_audience: "Investors",
    setting: "Material corporate event",
    market: "United States",
    goal: "Explain performance or results",
    audience_scope: "External",
    context: {},
    heightened_review: true,
    already_published: false,
  },
  expect: {
    max_score: 49,
    high_findings: [
      { label: "external conditions as the complete explanation", pattern: /headwind|external|macro|sector|conditions/i },
      { label: "no management assumptions or exposure", pattern: /assumption|exposure|management|internal|choices/i },
      { label: "unsupported reassurance", pattern: /confiden|reassur|unsupported|unsubstantiated/i },
      { label: "no strategy correction", pattern: /strategy|correct|chang|adjust/i },
      { label: "no measurable response", pattern: /measur|metric|verif|milestone|target|quantif/i },
    ],
    scan_flags: [
      {
        // The engine may flag the two conditions as separate entries; either satisfies the check.
        phrase: /macroeconomic headwinds|sector-wide conditions/i,
        category: "External weather",
        assessment: "Incomplete explanation",
      },
      { phrase: /remain confident/i, category: "Values without action" },
    ],
    specialist_review: ["Investor relations", "Legal"],
  },
};

export const CONTROL: Fixture = {
  key: "control",
  name: "Control draft (calibration 2)",
  request: {
    draft:
      "On 4 September the executive team, on my recommendation and with board approval, decided to close the Denver support center by 31 December. Demand shifted to chat and self-service faster than we planned for in 2024, and we kept the center staffed on the old forecast for two quarters longer than we should have. That was our misjudgment, not the team's. All 62 affected colleagues have been offered roles in Phoenix or remote positions, with relocation support and a 90-day decision window; details are in the HR portal. Maria Chen owns the transition and will report progress to all of us on the first Monday of each month through March. We are also changing how we set staffing forecasts, moving from annual to quarterly reviews starting in Q1.",
    communication_type: "CEO or executive message",
    primary_audience: "All employees",
    setting: "Sensitive",
    market: "United States",
    goal: "Explain a decision",
    audience_scope: "Internal",
    context: {},
    heightened_review: false,
    already_published: false,
  },
  expect: {
    min_score: 80,
    max_scan_flags: 1,
    max_scan_severity: "Low",
    readiness: ["Ready with minor edits", "Revise before issuing"],
  },
};

/** The three demos offered by the intake screen's demo loader. */
export const DEMOS: Fixture[] = [DEMO_1, DEMO_2, DEMO_3];

export const ALL_FIXTURES: Fixture[] = [DEMO_1, DEMO_1_WITH_CONTEXT, DEMO_2, DEMO_3, CONTROL];
