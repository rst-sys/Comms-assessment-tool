import { AI_SUMMARY_DISCLAIMER, AI_SUMMARY_HEADING } from "../copy.js";

/**
 * How an outside AI assistant might sum the draft up, drawn from the draft
 * alone. An illustration, not a finding, and never scored.
 *
 * The disclaimer sits directly under the heading and is part of the section,
 * not an option on it: the summary is never shown without it. With no summary
 * (an older review, or one code dropped) nothing renders at all, heading and
 * disclaimer included.
 */
export function AiSummary({ summary }: { summary?: string }) {
  if (!summary?.trim()) return null;
  return (
    <section id="ai-summary" className="card" aria-labelledby="ai-summary-heading">
      <h2 id="ai-summary-heading">{AI_SUMMARY_HEADING}</h2>
      <p className="muted prose">{AI_SUMMARY_DISCLAIMER}</p>
      <p className="prose">{summary}</p>
    </section>
  );
}
