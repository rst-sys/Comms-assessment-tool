import { DIMENSION_LABELS } from "../../engine/scoring.js";
import type { Finding } from "../../engine/types.js";
import { SeverityMarker } from "./SeverityMarker.js";

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
      {f.excerpt !== null ? (
        <blockquote>{f.excerpt}</blockquote>
      ) : (
        <p className="omission">{f.omission}</p>
      )}
      <h3 id={`finding-${f.id}-title`} style={{ margin: "8px 0 4px" }}>{f.finding}</h3>
      <div className="label">Ways this could be rectified</div>
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
