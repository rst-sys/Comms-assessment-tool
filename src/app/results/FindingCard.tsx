import { DIMENSION_LABELS } from "../../engine/scoring.js";
import type { Finding } from "../../engine/types.js";
import { SeverityMarker } from "./SeverityMarker.js";

/**
 * One finding: the diagnosis and how to fix it (revision 21).
 *
 * No text from the draft appears here. The owner found it inconsistent —
 * only some findings carried a quotation — and cluttered where it did. The
 * engine still quotes the draft internally, and the quote is still checked
 * character-for-character against the real text so a finding about language
 * that is not there is discarded before anyone reads it. That check is the
 * reason the field survives; it is never rendered.
 */
export function FindingCard({ finding }: { finding: Finding }) {
  const f = finding;
  return (
    <article className="card finding-card" id={`finding-${f.id}`} aria-labelledby={`finding-${f.id}-title`}>
      <div className="finding-head">
        <SeverityMarker severity={f.severity} />
        <span className="muted">{f.id}</span>
        <span>{DIMENSION_LABELS[f.dimension]}</span>
        {f.claim_status ? <span className="chip">{f.claim_status}</span> : null}
      </div>
      <h3 id={`finding-${f.id}-title`} style={{ margin: "8px 0 4px" }}>{f.finding}</h3>
      <div className="label">Ways to fix this</div>
      <p style={{ margin: 0 }}>{f.recommended_action}</p>
      <div className="flags">
        <span className={`flag ${f.fact_validation_needed ? "flag-on" : ""}`}>
          Fact validation: {f.fact_validation_needed ? "needed" : "not flagged"}
        </span>
        <span className={`flag ${f.specialist_review_needed ? "flag-on" : ""}`}>
          Specialist review: {f.specialist_review_needed ? f.specialist_review_type ?? "needed" : "not flagged"}
        </span>
      </div>
    </article>
  );
}
