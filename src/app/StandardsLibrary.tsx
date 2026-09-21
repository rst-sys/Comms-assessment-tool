import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { PROTOCOLS } from "../engine/protocols.js";
import { appliesTo, proseBlocks, protocolSection } from "./protocolProse.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { ACCOUNT_ELEMENTS } from "./overviewContent.js";
import { CODES, CODES_BY_ID, GROUNDING, OWNER_S_OWN } from "./standardsContent.js";

/**
 * The Standards Library (revision 20).
 *
 * Two kinds of claim, kept apart on purpose.
 *
 * What the engine applies: the protocols, rendered from the same objects the
 * engine sends to the model, so the page cannot claim a standard the tool does
 * not use.
 *
 * What the framework rests on: the published codes below. These are not sent
 * to the model and change no review. Saying otherwise — "based on PRSA" on a
 * tool that never references it — would be the unsubstantiated claim this tool
 * marks other people down for. So the page states the distinction, cites each
 * source, and labels what the owner devised as the owner's own.
 */
export function StandardsLibrary() {
  return (
    <main className="page welcome" aria-labelledby="standards-heading">
      <h1 id="standards-heading">Standards library</h1>
      <p className="welcome-intro">
        What this tool measures against, where each standard comes from, and — just as important — which parts are our
        own judgement rather than anyone's published code.
      </p>

      <section className="card welcome-card" aria-labelledby="how-heading">
        <h2 id="how-heading">How to read this page</h2>
        <p className="prose">
          There are two different kinds of claim here, and conflating them would be the sort of thing this tool exists
          to catch.
        </p>
        <dl className="account-list">
          <div className="account-item">
            <dt>Applied</dt>
            <dd>
              Rules the review engine actually runs: the ten dimensions, the agency scan, and the protocols below. These
              determine your score.
            </dd>
          </div>
          <div className="account-item">
            <dt>Grounded in</dt>
            <dd>
              Published codes the framework was built from. These are <strong>not</strong> sent to the engine and change
              no review. They are cited so you can check the framework against codes you already know.
            </dd>
          </div>
        </dl>
      </section>

      <section className="card welcome-card" aria-labelledby="codes-heading">
        <h2 id="codes-heading">The codes this framework rests on</h2>
        <p className="prose">
          Established standards in professional communication and public relations. Each is linked; read them yourself
          rather than taking our summary for it.
        </p>
        {CODES.map((c) => (
          <div key={c.id} className="code-entry">
            <h3>
              {c.body} — {c.name}
              {c.year ? ` (${c.year})` : ""}
            </h3>
            <p className="prose">{c.summary}</p>
            <p className="muted small">
              <a href={c.url} target="_blank" rel="noopener noreferrer">{c.url}</a>
            </p>
          </div>
        ))}
      </section>

      <section className="card welcome-card" aria-labelledby="grounding-heading">
        <h2 id="grounding-heading">Each dimension, and the principle behind it</h2>
        <p className="prose">
          The ten dimensions the engine scores, with the published principle each one rests on. A dimension nobody can
          trace to an established principle has no business carrying weight in a score.
        </p>
        {DIMENSION_IDS.map((id) => (
          <div key={id} className="grounding-entry">
            <h3>
              {DIMENSION_LABELS[id]} <span className="muted">— weight {DIMENSION_WEIGHTS[id]}</span>
            </h3>
            <ul className="tight">
              {GROUNDING[id].map((g, i) => (
                <li key={i}>
                  {g.principle} <span className="muted">— {CODES_BY_ID[g.code]?.body ?? g.code}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="card welcome-card" aria-labelledby="own-heading">
        <h2 id="own-heading">What is our own judgement</h2>
        <p className="prose">
          No published code supplies the following. They are this tool's construction — informed by the codes above, not
          dictated by them. If you disagree with one, you are disagreeing with us, not with PRSA.
        </p>
        <dl className="account-list">
          {OWNER_S_OWN.map(([name, meaning]) => (
            <div key={name} className="account-item">
              <dt>{name}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

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
      </section>

      {PROTOCOLS.map((protocol) => (
        <section key={protocol.id} className="card welcome-card" aria-labelledby={`${protocol.id}-heading`}>
          <h2 id={`${protocol.id}-heading`}>{protocol.name}</h2>
          <p className="muted small">
            Applied when: {appliesTo(protocol)} · Version {protocol.version}
          </p>

          <div className="label">What it checks</div>
          <dl className="account-list not-list">
            {protocol.elements.map((e) => (
              <div key={e.name} className="account-item">
                <dt>{e.name}</dt>
                <dd>
                  {e.means}
                  <div className="muted small">
                    Scored under: {DIMENSION_LABELS[e.dimension]}
                    {e.weight === "supporting" ? " · supporting" : ""}
                    {e.only_when === "failure" ? " · only where something failed" : ""}
                  </div>
                </dd>
              </div>
            ))}
          </dl>
          <p className="prose">
            These elements are a lens on the ten dimensions above, not an eleventh score. A missing element shows up in
            the dimension it belongs to.
          </p>

          {["Source", "Basis"].map((heading) => {
            const blocks = proseBlocks(protocolSection(protocol.prose, heading));
            if (blocks.length === 0) return null;
            return (
              <div key={heading}>
                <div className="label">{heading}</div>
                {blocks.map((b, i) =>
                  b.kind === "list" ? (
                    <ul key={i} className="tight prose">
                      {(b.items ?? []).map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="prose small">{b.text}</p>
                  ),
                )}
              </div>
            );
          })}

          {(() => {
            const limits = proseBlocks(protocolSection(protocol.prose, "What this protocol does not cover") || protocolSection(protocol.prose, "Limits"));
            if (limits.length === 0) return null;
            return (
              <>
                <div className="label">What it cannot do</div>
                {limits.map((b, i) =>
                  b.kind === "list" ? (
                    <ul key={i} className="tight prose">
                      {(b.items ?? []).map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="prose small">{b.text}</p>
                  ),
                )}
              </>
            );
          })()}
        </section>
      ))}

      <section className="card welcome-card" aria-labelledby="planned-heading">
        <h2 id="planned-heading">Planned</h2>
        <p className="prose">
          The library covers thirteen high-stakes events. Protocols for the rest are planned and not in this build: a
          draft about an event with no protocol is still judged against the core framework above, and against the
          high-stakes event core where an event is named.
        </p>
      </section>
    </main>
  );
}
