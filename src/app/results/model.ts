/**
 * Pure helpers for the results page. No React here so they can be unit-tested
 * without a DOM.
 */
import { rankFindings } from "../../engine/scoring.js";
import type { DimensionId, Finding, Severity, SpecialistReviewType } from "../../engine/types.js";

/** The five highest-severity findings, in display order. */
export function topFindings(findings: ReadonlyArray<Finding>, count = 5): Finding[] {
  return rankFindings(findings).slice(0, count);
}

/**
 * Which review function a question names, if any (revision 21).
 *
 * The specialist questions were never a separate list: they are these same
 * questions, filtered. Showing them in their own section meant a reader under
 * heightened review met some questions twice. Now there is one list, and a
 * question that needs a named reviewer says which.
 */
const REVIEW_FUNCTIONS: [SpecialistReviewType, RegExp][] = [
  ["Legal", /\b(legal|counsel|lawyer|attorney|litigation)\b/i],
  ["HR", /\b(HR|human resources|personnel)\b/i],
  ["Labor", /\b(labou?r|works[- ]council|consultation|union|collective)\b/i],
  ["Privacy", /\b(privacy|data protection|personal data|data subjects?)\b/i],
  // Restored and given a real category. The previous filter matched the bare
  // word "security" with nothing behind it, so a breach question was flagged as
  // needing "a specialist" without ever naming which one.
  ["Information security", /\b(information security|infosec|cyber\w*|breach|intrusion|attacker|threat actor|malware|ransomware|vulnerabilit\w*|forensics?|containment|exfiltrat\w*|credentials?)\b/i],
  ["Investor relations", /\b(investor relations|investors|shareholders?|disclosure|securities)\b/i],
  ["Local market", /\b(local[- ]market|jurisdiction|each market|country)\b/i],
  ["Executive", /\b(executive|board|leadership team)\b/i],
];

/** Every review function a question names. Empty when it names none. */
export function reviewTagsFor(question: string): SpecialistReviewType[] {
  return REVIEW_FUNCTIONS.filter(([, re]) => re.test(question)).map(([name]) => name);
}

export function specialistQuestions(questions: ReadonlyArray<string>): string[] {
  return questions.filter((q) => reviewTagsFor(q).length > 0);
}

export const REGISTER_FILTERS = [
  "High only",
  "Accountability",
  "Employee voice",
  "Clarity",
  "Impact",
  "Commitments and verification",
  "Specialist review",
] as const;
export type RegisterFilter = (typeof REGISTER_FILTERS)[number];

const FILTER_DIMENSIONS: Partial<Record<RegisterFilter, DimensionId[]>> = {
  Accountability: ["accountability_agency"],
  "Employee voice": ["listening_employee_voice"],
  Clarity: ["clarity_plain_language"],
  Impact: ["stakeholder_respect_impact"],
  "Commitments and verification": ["corrective_action_proof", "verification_follow_through"],
};

/** A finding passes when it satisfies every active filter. */
export function matchesFilters(finding: Finding, active: ReadonlySet<RegisterFilter>): boolean {
  for (const filter of active) {
    if (filter === "High only" && finding.severity !== "High") return false;
    if (filter === "Specialist review" && !finding.specialist_review_needed) return false;
    const dims = FILTER_DIMENSIONS[filter];
    if (dims && !dims.includes(finding.dimension)) return false;
  }
  return true;
}

export type RegisterSort = { key: "severity" | "dimension"; direction: "asc" | "desc" };

const SEVERITY_ORDER: Record<Severity, number> = { High: 0, Moderate: 1, Low: 2 };

export function sortFindings(findings: ReadonlyArray<Finding>, sort: RegisterSort): Finding[] {
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...findings].sort((a, b) => {
    const cmp =
      sort.key === "severity"
        ? SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        : a.dimension.localeCompare(b.dimension);
    return cmp * sign || a.id.localeCompare(b.id);
  });
}

export const FINDING_STATUSES = ["Open", "Accepted risk", "Not applicable", "Resolved", "Needs review"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];
