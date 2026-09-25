import type { EvaluationResult } from "../../engine/evaluate.js";
import { HEIGHTENED_NOTICE } from "../copy.js";
import { ScoringNote } from "./ScoringNote.js";
import { warrantsHeightenedReview, type EvaluationRequest } from "../../engine/types.js";
import { KIND_LABEL, REACH_LABEL } from "../intake/AudienceDocuments.js";
import { Scorecard } from "./Scorecard.js";

interface Props {
  result: EvaluationResult;
  request: EvaluationRequest;
}

/**
 * The executive summary (revision 19).
 *
 * Flattened deliberately. It used to be a 220px column beside a second column
 * that itself held a two-column grid, all nested inside the page's own
 * two-column results grid — so prose wrapped at roughly thirty-five characters
 * and broke in the wrong place on almost every line. Short facts sit in a
 * header row; anything that is a sentence now gets the full width of the card.
 *
 * The scorecard renders here rather than in a panel further down the page: the
 * owner wanted the ten dimension scores beside the headline score.
 */
export function ExecutiveSummary({ result, request }: Props) {
  const s = result.analysis.executive_summary;
  return (
    <section className="card" id="executive-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Executive summary</h2>
      {s.headline ? <p className="summary-headline">{s.headline}</p> : null}

      <div className="summary-head">
        <div className="score-block">
          <div className="label">Accountable Communication Score</div>
          <a
            className="score-number"
            href="#scorecard"
            aria-label={`Score ${result.score} out of 100. Jump to the scorecard for the rationale behind each dimension.`}
          >
            {result.score}
          </a>
          <span className="score-band">{result.band}</span>
        </div>
        <div className="summary-facts">
          <div>
            <div className="label">Risk level</div>
            <div>{s.risk_level}</div>
          </div>
          {request.already_published ? (
            <div>
              <div className="label">Retrospective</div>
              <div>Already issued</div>
            </div>
          ) : null}
        </div>
      </div>

      {warrantsHeightenedReview(request.communication_event, request.people_at_risk) ? (
        <p className="warning heightened-notice" role="note">{HEIGHTENED_NOTICE}</p>
      ) : null}

      <ScoringNote result={result} contextSupplied={s.context_supplied} />

      {request.stance === "reactive" ? (
        <>
          <div className="label">Reacting to</div>
          <p className="prose" style={{ margin: 0 }}>{request.reacting_to}</p>
        </>
      ) : null}
      {request.audience_documents?.length ? (
        <>
          <div className="label">Audience context considered</div>
          <ul className="tight prose">
            {request.audience_documents.map((d, i) => (
              <li key={i}>
                <span className="chip">{KIND_LABEL[d.kind]}</span> <strong>{d.title}</strong>
                {d.description ? ` — ${d.description}` : ""}{" "}
                <span className="muted">
                  ({REACH_LABEL[d.reach].toLowerCase()}
                  {d.kind === "supporting" ? (d.same_time ? ", same time" : ", later") : ""})
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Scorecard dimensions={result.analysis.dimensions} />

      <div className="two-col">
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

    </section>
  );
}
