import type { DevilsAdvocate as DevilsAdvocateData } from "../../engine/types.js";
import { REPORTER_QUESTION } from "../copy.js";
import { Panel } from "./Panel.js";

/**
 * How skeptical audiences may read the draft (revision 21).
 *
 * Cut to what the owner found useful. The most damaging plausible
 * interpretation leads. Each audience gets one line in its own voice, rather
 * than the four-paragraph breakdown that made five short insights look like a
 * dashboard. The closing question is not answered by the tool: it is put to
 * the reader, because deciding what a journalist would lift is the author's
 * judgement and nobody else's.
 */
export function DevilsAdvocate({ data }: { data: DevilsAdvocateData }) {
  return (
    <Panel id="devils-advocate" title="Devil's Advocate: how skeptical audiences may read this">
      <div className="callout-material" role="note">
        <div className="label">Most damaging plausible interpretation if issued unchanged</div>
        <p style={{ margin: 0 }}>{data.most_damaging_interpretation}</p>
      </div>

      <p className="muted prose" style={{ marginTop: 16 }}>{data.disclaimer}</p>

      <ul className="might-say">
        {data.personas.map((p) => (
          <li key={p.persona}>
            <strong>{p.persona}</strong> might say: “{p.might_say}”
          </li>
        ))}
      </ul>

      <div className="callout-reflect" role="note">
        <div className="label">Ask yourself</div>
        <p style={{ margin: 0 }}>{REPORTER_QUESTION}</p>
      </div>
    </Panel>
  );
}
