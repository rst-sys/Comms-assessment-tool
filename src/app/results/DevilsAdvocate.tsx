import type { DevilsAdvocate as DevilsAdvocateData } from "../../engine/types.js";
import { Panel } from "./Panel.js";

/**
 * How skeptical audiences may read the draft (revision 19).
 *
 * Two changes on the owner's instruction. The most damaging plausible
 * interpretation leads: it was the most useful thing in the section and it
 * used to sit at the bottom, after five cards. And the per-audience tiles are
 * gone — the interpretations are simply displayed, one audience after another,
 * rather than boxed into a grid that made five short paragraphs look like a
 * dashboard.
 */
export function DevilsAdvocate({ data }: { data: DevilsAdvocateData }) {
  return (
    <Panel id="devils-advocate" title="Devil's Advocate: how skeptical audiences may read this">
      <div className="callout-material" role="note">
        <div className="label">Most damaging plausible interpretation if issued unchanged</div>
        <p style={{ margin: 0 }}>{data.most_damaging_interpretation}</p>
      </div>

      <p className="muted prose" style={{ marginTop: 16 }}>{data.disclaimer}</p>

      <div className="interpretations">
        {data.personas.map((p) => (
          <section key={p.persona} className="interpretation" aria-label={p.persona}>
            <div className="label">{p.persona}</div>
            <h3 className="persona-headline">{p.headline}</h3>
            <p className="prose"><strong>May hear:</strong> {p.may_hear}</p>
            <p className="prose"><strong>May question:</strong> {p.may_question}</p>
            <p className="prose"><strong>May find missing:</strong> {p.may_find_missing}</p>
            <p className="prose"><strong>What would address it:</strong> {p.would_address_it}</p>
          </section>
        ))}
      </div>
    </Panel>
  );
}
