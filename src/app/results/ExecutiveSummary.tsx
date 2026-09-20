import type { EvaluationResult } from "../../engine/evaluate.js";
import { ceilingWithoutContext, DIMENSION_LABELS } from "../../engine/scoring.js";
import type { EvaluationRequest } from "../../engine/types.js";
import { KIND_LABEL, REACH_LABEL } from "../intake/AudienceDocuments.js";
import { openPanel } from "./Panel.js";

interface Props {
  result: EvaluationResult;
  request: EvaluationRequest;
}

export function ExecutiveSummary({ result, request }: Props) {
  const s = result.analysis.executive_summary;
  const chips = result.analysis.specialist_review_summary;
  return (
    <section className="card" id="executive-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Executive summary</h2>
      {s.headline ? <p className="summary-headline">{s.headline}</p> : null}
      <div className="summary-grid">
        <div className="score-block">
          <div className="label">Accountable Communication Score</div>
          <button
            type="button"
            className="score-number"
            onClick={() => openPanel("scorecard")}
            aria-label={`Score ${result.score} out of 100. Open the scorecard for the rationale behind each dimension.`}
          >
            {result.score}
          </button>
          <span className="score-band">{result.band}</span>
          <p className="muted" style={{ marginTop: 8 }}>{result.confidence_label}</p>
          {!s.context_supplied ? (
            <p className="muted small prose" style={{ marginTop: 4 }}>
              With no context supplied, three dimensions — accountability and agency, causation and explanation, and
              corrective action and proof — cannot score above 3.5 of 5, because nothing here confirms what the draft
              claims. The most any draft can score on this run is {ceilingWithoutContext()} of 100. Filling in "Provide
              additional context" lifts that cap on whatever it confirms.
            </p>
          ) : null}
          <div className="label">Risk level</div>
          <div>{s.risk_level}</div>
        </div>
        <div>
          <div className="label">Communications readiness</div>
          <div className="readiness-row">
            <strong>{s.readiness}</strong>
            {chips.length > 0 ? (
              <span className="chips" aria-label="Specialist review required">
                {chips.map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </span>
            ) : null}
          </div>
          {request.already_published ? <p className="muted">Retrospective review — already issued</p> : null}
          {request.stance === "reactive" ? (
            <>
              <div className="label">Reacting to</div>
              <p className="prose" style={{ margin: 0 }}>{request.reacting_to}</p>
            </>
          ) : null}
          {request.audience_documents?.length ? (
            <>
              <div className="label">Audience context considered</div>
              <ul className="tight">
                {request.audience_documents.map((d, i) => (
                  <li key={i}><span className="chip">{KIND_LABEL[d.kind]}</span> <strong>{d.title}</strong>{d.description ? ` — ${d.description}` : ""} <span className="muted">({REACH_LABEL[d.reach].toLowerCase()}{d.kind === "supporting" ? (d.same_time ? ", same time" : ", later") : ""})</span></li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="label">Assessment</div>
          <p className="prose" style={{ margin: 0 }}>{s.assessment}</p>
          <div className="two-col" style={{ marginTop: 16 }}>
            <div>
              <div className="label">Strongest elements</div>
              <ul className="tight">
                {s.strongest_elements.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="label">Priority improvements</div>
              <ul className="tight">
                {s.priority_improvements.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
            Evaluated across {Object.keys(DIMENSION_LABELS).length} dimensions by {result.provider.provider} ({result.provider.model}).
            Decision support only; not legal, employment, labor, financial-disclosure, regulatory, privacy, or tax advice.
          </p>
        </div>
      </div>
    </section>
  );
}
