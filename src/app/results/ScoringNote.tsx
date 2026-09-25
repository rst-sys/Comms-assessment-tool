import type { EvaluationResult } from "../../engine/evaluate.js";
import { ceilingWithoutContext, DIMENSION_LABELS } from "../../engine/scoring.js";

/**
 * How the scoring works (revision 25, wording by the owner).
 *
 * One place for what used to be three disclaimers: the confidence line, the
 * paragraph explaining the cap when no context was supplied, and the
 * provider-and-advice footnote.
 *
 * The numbers are computed, not written down — the dimension count from the
 * labels and the ceiling from the weights — so the sentence cannot come to
 * claim something the scoring no longer does.
 *
 * Returned as paragraphs so the page and the PDF render the same words in the
 * same order and cannot drift apart.
 */
export function scoringNoteParagraphs(result: EvaluationResult, contextSupplied: boolean): string[] {
  const dimensions = Object.keys(DIMENSION_LABELS).length;
  const opening = `${result.provider.provider} (${result.provider.model}) scored this draft across ${dimensions} weighted dimensions, out of 100.`;

  const scoring = contextSupplied
    ? `${opening} The context you supplied was weighed against the draft, so what it confirms counts as established rather than claimed. Add more under "Anything else we should know?" to enhance the depth of the scoring.`
    : `${opening} As no context was supplied, the maximum score for three dimensions — accountability, causation and corrective action — is restricted to 3.5 out of 5, which caps this review at ${ceilingWithoutContext()} out of 100. Fill in "Anything else we should know?" to enhance the depth of the scoring.`;

  const caveat =
    "NB: This is decision support, not advice. It does not replace review by key partners such as legal counsel, HR, investor relations, security, subject-matter experts or local-market experts.";

  return [scoring, caveat];
}

export function ScoringNote({
  result,
  contextSupplied,
}: {
  result: EvaluationResult;
  contextSupplied: boolean;
}) {
  return (
    <section className="scoring-note" aria-labelledby="scoring-note-heading">
      <h3 id="scoring-note-heading" className="label">How the scoring works</h3>
      {scoringNoteParagraphs(result, contextSupplied).map((text, i) => (
        <p key={i} className="prose small muted">{text}</p>
      ))}
    </section>
  );
}
