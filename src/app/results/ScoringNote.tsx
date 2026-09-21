import type { EvaluationResult } from "../../engine/evaluate.js";
import { ceilingWithoutContext, DIMENSION_LABELS } from "../../engine/scoring.js";

/**
 * How the scoring works (revision 23).
 *
 * One paragraph in place of three separate disclaimers: the confidence line,
 * the paragraph explaining the cap when no context was supplied, and the
 * provider-and-advice footnote. Between them they said much the same thing
 * three times, in three registers, and two were written in exactly the stiff
 * style the owner objected to in the engine's own output.
 *
 * It cannot be fixed text — whether context was supplied changes what is true
 * about the score, and so does the model that ran the review — but it can be
 * short and plain. The page and the PDF render the same string, so the two
 * cannot drift apart.
 */
export function scoringNoteText(result: EvaluationResult, contextSupplied: boolean): string {
  const dimensions = Object.keys(DIMENSION_LABELS).length;
  const who = `${result.provider.provider} (${result.provider.model}) scored this draft across ${dimensions} weighted dimensions, out of 100.`;
  const context = contextSupplied
    ? "It weighed the draft against the context you supplied, so what that context confirms counts as established rather than merely claimed."
    : `You supplied no context, so nothing here confirms what the draft claims. That holds three dimensions — accountability, causation and corrective action — to 3.5 out of 5, and caps this review at ${ceilingWithoutContext()} out of 100. Fill in "Provide additional context" to lift it.`;
  const advice =
    "This is decision support, not advice. It does not replace review by counsel, HR, investor relations, security or your local-market experts.";
  return `${who} ${context} ${advice}`;
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
      <p className="prose small muted">{scoringNoteText(result, contextSupplied)}</p>
    </section>
  );
}
