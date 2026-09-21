/**
 * Pure helpers for the results page. No React here so they can be unit-tested
 * without a DOM.
 */
import { rankFindings } from "../../engine/scoring.js";
import type { AgencyScanItem, DimensionId, Finding, ScanCategory, Severity, SpecialistReviewType } from "../../engine/types.js";

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

// ---------------------------------------------------------------------------
// Agency scan highlighting
// ---------------------------------------------------------------------------

export interface HighlightSegment {
  text: string;
  /** Index into the agency_scan array, or null for plain text. */
  scanIndex: number | null;
}

/**
 * Splits the draft into plain and highlighted segments. Each scan phrase is
 * matched at its first occurrence in the draft; when two phrases overlap the
 * one that starts first wins, and a later-starting phrase inside it is dropped
 * from the highlights (its card is still reachable from the list below the
 * draft). Phrases are verbatim by construction (validate.ts), so a phrase that
 * is not found is simply not highlighted.
 */
export function highlightSegments(draft: string, scan: ReadonlyArray<AgencyScanItem>): HighlightSegment[] {
  const spans: { start: number; end: number; scanIndex: number }[] = [];
  scan.forEach((item, scanIndex) => {
    const start = draft.indexOf(item.phrase);
    if (start >= 0) spans.push({ start, end: start + item.phrase.length, scanIndex });
  });
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue; // overlaps a highlight already emitted
    if (span.start > cursor) segments.push({ text: draft.slice(cursor, span.start), scanIndex: null });
    segments.push({ text: draft.slice(span.start, span.end), scanIndex: span.scanIndex });
    cursor = span.end;
  }
  if (cursor < draft.length) segments.push({ text: draft.slice(cursor), scanIndex: null });
  return segments;
}

export const SCAN_CATEGORY_CLASS: Record<ScanCategory, string> = {
  "External weather": "cat-weather",
  "Institutional abstraction": "cat-institution",
  "Audience displacement": "cat-audience",
  "Passive accountability": "cat-passive",
  "Values without action": "cat-values",
  "Vague action": "cat-vague",
};

// ---------------------------------------------------------------------------
// Findings register filters
// ---------------------------------------------------------------------------

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

/**
 * Flagged phrases grouped by the finding they belong to (revision 19).
 *
 * The scan and the findings used to be two sections saying related things in
 * different places. Nesting a phrase under the finding it evidences makes one
 * argument out of two lists: here is the problem, and here is the language in
 * the draft that causes it.
 */
export function phrasesByFinding(scan: ReadonlyArray<AgencyScanItem>): Map<string, AgencyScanItem[]> {
  const byFinding = new Map<string, AgencyScanItem[]>();
  for (const item of scan) {
    if (!item.finding_id) continue;
    const existing = byFinding.get(item.finding_id);
    if (existing) existing.push(item);
    else byFinding.set(item.finding_id, [item]);
  }
  return byFinding;
}

/** Phrases the engine flagged without tying them to a finding. They still belong on the page. */
export function unlinkedPhrases(
  scan: ReadonlyArray<AgencyScanItem>,
  findings: ReadonlyArray<Finding>,
): AgencyScanItem[] {
  const known = new Set(findings.map((f) => f.id));
  return scan.filter((s) => !s.finding_id || !known.has(s.finding_id));
}
