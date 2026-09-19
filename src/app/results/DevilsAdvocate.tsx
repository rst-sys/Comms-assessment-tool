import type { DevilsAdvocate as DevilsAdvocateData } from "../../engine/types.js";
import { Panel } from "./Panel.js";

export function DevilsAdvocate({ data }: { data: DevilsAdvocateData }) {
  return (
    <Panel id="devils-advocate" title="Devil's Advocate: how skeptical audiences may read this">
      <p className="muted" style={{ marginTop: 0 }}>{data.disclaimer}</p>
      <div className="persona-grid">
        {data.personas.map((p) => (
          <article key={p.persona} className="card persona" aria-label={p.persona}>
            <div className="label">{p.persona}</div>
            <h3 className="persona-headline">{p.headline}</h3>
            <div className="label">May hear</div><p style={{ margin: 0 }}>{p.may_hear}</p>
            <div className="label">May question</div><p style={{ margin: 0 }}>{p.may_question}</p>
            <div className="label">May find missing</div><p style={{ margin: 0 }}>{p.may_find_missing}</p>
            <div className="label">What would address it</div><p style={{ margin: 0 }}>{p.would_address_it}</p>
          </article>
        ))}
      </div>
      <div className="callout-material" role="note">
        <div className="label">Most damaging plausible interpretation if issued unchanged</div>
        <p style={{ margin: 0 }}>{data.most_damaging_interpretation}</p>
      </div>
    </Panel>
  );
}
