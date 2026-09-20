import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { PROTOCOLS, LAYOFF_PROTOCOL_SUMMARY } from "../engine/protocols.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { ACCOUNT_ELEMENTS } from "./overviewContent.js";

/**
 * The Standards Library (revision 14): what the engine actually applies, and
 * where each standard comes from. The protocol entries are rendered from the
 * same objects the engine sends to the model, so the page cannot claim a
 * standard the tool does not apply.
 */
export function StandardsLibrary() {
  return (
    <main className="page welcome" aria-labelledby="standards-heading">
      <h1 id="standards-heading">Standards library</h1>
      <p className="welcome-intro">
        What this tool measures against, and where each standard comes from. Everything listed here is applied by the
        review engine, not aspiration.
      </p>

      <section className="card welcome-card" aria-labelledby="core-heading">
        <h2 id="core-heading">The core framework</h2>
        <p className="muted small">Applied to every draft.</p>
        <h3>The account a message should give</h3>
        <p className="prose">Nine things a reader should be able to see.</p>
        <dl className="account-list">
          {ACCOUNT_ELEMENTS.map(([name, meaning]) => (
            <div key={name} className="account-item">
              <dt>{name}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
        <h3>Ten weighted dimensions</h3>
        <ul className="weights">
          {DIMENSION_IDS.map((id) => (
            <li key={id}>
              <span>{DIMENSION_LABELS[id]}</span>
              <span className="weight">{DIMENSION_WEIGHTS[id]}</span>
            </li>
          ))}
        </ul>
        <h3>Agency and abstraction scan</h3>
        <p className="prose">
          Six categories of language that let responsibility disappear: external weather, institutional abstraction,
          audience displacement, passive accountability, values without action, and vague action. A phrase is flagged only
          where it is doing the explaining.
        </p>
        <p className="muted small">Source: the build specification for this tool.</p>
      </section>

      {PROTOCOLS.map((protocol) => (
        <section key={protocol.id} className="card welcome-card" aria-labelledby={`${protocol.id}-heading`}>
          <h2 id={`${protocol.id}-heading`}>{protocol.name}</h2>
          <p className="muted small">Applied when: {protocol.appliesTo}</p>
          <p className="prose">{protocol.basis}</p>
          <dl className="account-list not-list">
            {protocol.elements.map((e) => (
              <div key={e.name} className="account-item">
                <dt>{e.name}</dt>
                <dd>
                  {e.meaning} <span className="muted">{e.importance}</span>
                  <div className="muted small">Scored under: {DIMENSION_LABELS[e.dimension]}</div>
                </dd>
              </div>
            ))}
          </dl>
          <p className="prose">
            These elements are a lens on the ten dimensions above, not an eleventh score. A missing element shows up in
            the dimension it belongs to.
          </p>
          <p className="muted small prose">Source: {protocol.source}</p>
        </section>
      ))}

      <section className="card welcome-card" aria-labelledby="layoff-heading">
        <h2 id="layoff-heading">{LAYOFF_PROTOCOL_SUMMARY.name}</h2>
        <p className="muted small">Applied when: {LAYOFF_PROTOCOL_SUMMARY.appliesTo}</p>
        <p className="prose">{LAYOFF_PROTOCOL_SUMMARY.basis}</p>
        <p className="prose">Each of these raises a High-severity finding, and every finding in the set is marked for HR or labour review:</p>
        <ul className="tight prose">
          {LAYOFF_PROTOCOL_SUMMARY.checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="muted small prose">Source: {LAYOFF_PROTOCOL_SUMMARY.source}</p>
      </section>

      <section className="card welcome-card" aria-labelledby="planned-heading">
        <h2 id="planned-heading">Planned</h2>
        <p className="prose">
          Type-specific protocols for financial disclosure, privacy incidents, AI and surveillance, and health and safety
          are planned and not in this build. A draft of those types is still reviewed against the core framework.
        </p>
      </section>
    </main>
  );
}
