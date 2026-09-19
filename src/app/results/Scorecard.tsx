import { DIMENSION_IDS, type Dimension } from "../../engine/types.js";
import { DIMENSION_LABELS, DIMENSION_WEIGHTS, dimensionTone } from "../../engine/scoring.js";
import { Panel } from "./Panel.js";

export function Scorecard({ dimensions }: { dimensions: Dimension[] }) {
  const byId = new Map(dimensions.map((d) => [d.id, d]));
  return (
    <Panel id="scorecard" title="Scorecard" note="ten dimensions, weighted">
      <p className="muted" style={{ marginTop: 0 }}>Click a dimension for its rationale and what would raise it.</p>
      {DIMENSION_IDS.map((id) => {
        const d = byId.get(id);
        if (!d) return null;
        const tone = dimensionTone(d.score);
        return (
          <details className="score-row" key={id} id={`dimension-${id}`}>
            <summary>
              <span>{DIMENSION_LABELS[id]}</span>
              <span className="muted" aria-label={`weight ${DIMENSION_WEIGHTS[id]}`}>w {DIMENSION_WEIGHTS[id]}</span>
              <span className={`bar tone-${tone}`} role="img" aria-label={`${d.score.toFixed(1)} out of 5`}>
                <span style={{ width: `${(d.score / 5) * 100}%` }} />
              </span>
              <strong className={`tone-text-${tone}`}>{d.score.toFixed(1)}</strong>
            </summary>
            <div className="score-detail">
              <p style={{ margin: "0 0 8px" }}>{d.rationale}</p>
              <p style={{ margin: 0 }}><strong>What would raise this:</strong> {d.would_raise}</p>
            </div>
          </details>
        );
      })}
    </Panel>
  );
}
