/**
 * Pure helpers for the results page. No React here so they can be unit-tested
 * without a DOM.
 */
import { rankFindings } from "../../engine/scoring.js";
import type { AgencyScanItem, DimensionId, Finding, ScanCategory, Severity } from "../../engine/types.js";

/** The five highest-severity findings, in display order. */
export function topFindings(findings: ReadonlyArray<Finding>, count = 5): Finding[] {
  return rankFindings(findings).slice(0, count);
}

/** Questions whose text names a review function, for the "Resolve with specialists" checklist (Section 10). */
const REVIEW_FUNCTION =
  /\b(legal|counsel|lawyer|attorney|HR|human resources|labou?r|works[- ]council|consultation|union|privacy|investor relations|regulat\w*|compliance|local[- ]market|executive|board|audit|security|finance|tax|disclosure)\b/i;

export function specialistQuestions(questions: ReadonlyArray<string>): string[] {
  return questions.filter((q) => REVIEW_FUNCTION.test(q));
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
