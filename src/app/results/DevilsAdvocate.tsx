import type { DevilsAdvocate as DevilsAdvocateData } from "../../engine/types.js";
import { REPORTER_QUESTION } from "../copy.js";

/**
 * How skeptical audiences may read the draft (revision 21).
 *
 * Cut to what the owner found useful. The most damning interpretation is
 * shown as soon as the page opens — it is the single most useful line in the
 * section, and hiding it behind a disclosure meant nobody read it. The
 * stakeholder voices sit behind an expander beneath it. Each audience gets one line in its own voice, rather
 * than the four-paragraph breakdown that made five short insights look like a
 * dashboard. The closing question is not answered by the tool: it is put to
 * the reader, because deciding what a journalist would lift is the author's
 * judgement and nobody else's.
 */
export function DevilsAdvocate({ data }: { data: DevilsAdvocateData }) {
  return (
    <section id="devils-advocate" className="card" aria-labelledby="devils-advocate-heading">
      <h2 id="devils-advocate-heading">Devil's Advocate: how skeptical audiences may read this</h2>

      <div className="callout-material" role="note">
        <div className="label">Most damning interpretation if issued as is</div>
        <p style={{ margin: 0 }}>{data.most_damaging_interpretation}</p>
      </div>

      <details className="stakeholders">
        <summary>
          What each audience might say <span className="muted">({data.personas.length})</span>
        </summary>
        <div className="stakeholders-body">
          <p className="muted prose">{data.disclaimer}</p>
          <ul className="might-say">
            {data.personas.map((p) => (
              <li key={p.persona}>
                <strong>{p.persona}</strong> might say: “{p.might_say}”
              </li>
            ))}
          </ul>
        </div>
      </details>

      <div className="callout-reflect" role="note">
        <div className="label">Ask yourself</div>
        <p style={{ margin: 0 }}>{REPORTER_QUESTION}</p>
      </div>
    </section>
  );
}
