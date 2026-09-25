import { useId, useState, type ReactNode } from "react";
import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { PROTOCOLS } from "../engine/protocols.js";
import type { ProtocolFile } from "../engine/protocolFormat.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { PageNav } from "./PageNav.js";
import { Clock } from "./Icons.js";
import { proseBlocks, protocolSection } from "./protocolProse.js";
import {
  ACCOUNT_CARD,
  CLAIM_LABELS,
  CODES,
  CODE_SHORT,
  CODES_INTRO,
  CORE_INTRO,
  GROUNDING,
  HOW_TO_READ,
  HOW_TO_READ_INTRO,
  JUDGEMENT_INTRO,
  ownJudgment,
  PROTOCOLS_INTRO,
  PROTOCOLS_PLANNED,
  SCAN_CARD,
  STANDARDS_EYEBROW,
  STANDARDS_LEDE,
  STANDARDS_SECTIONS,
  STANDARDS_TITLE,
  type ClaimKind,
} from "./standardsContent.js";

/** The heaviest dimension sets the bar scale, so the longest bar is always full. */
const MAX_WEIGHT = Math.max(...DIMENSION_IDS.map((id) => DIMENSION_WEIGHTS[id]));

/**
 * The Standards Library (the owner's desktop artboard, revision 30).
 *
 * The page answers one question — what is my draft being measured against —
 * and its job is to keep three kinds of claim apart while doing so: what the
 * engine runs, what the framework was built from, and what is nobody's
 * published code but ours. Each section carries the tag that says which.
 *
 * Everything under "Applied" is rendered from the same objects the engine
 * sends, so the page cannot come to describe a tool that no longer exists.
 */
export function StandardsLibrary({ onOverview }: { onOverview?: () => void }) {
  return (
    <div className="page overview standards">
      <PageNav sections={STANDARDS_SECTIONS} />

      <main className="overview-main" aria-labelledby="standards-heading">
        <p className="eyebrow">{STANDARDS_EYEBROW}</p>
        <h1 id="standards-heading" className="overview-title">{STANDARDS_TITLE}</h1>
        <p className="overview-lede">{STANDARDS_LEDE}</p>

        <Section id="read" title="How to read this page">
          <p className="prose">{HOW_TO_READ_INTRO}</p>
          <div className="tile-grid tile-grid-three">
            {HOW_TO_READ.map((card) => (
              <div className="card tile" key={card.kind}>
                <Tag kind={card.kind} />
                <p>
                  {card.body}
                  {card.strong ? <> <strong>{card.strong}</strong></> : null}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="core" title="The core framework" tag="applied">
          <p className="prose">{CORE_INTRO}</p>

          <div className="card panel-card">
            <table className="dimension-table">
              <thead>
                <tr>
                  <th scope="col">Dimension and weight</th>
                  <th scope="col">Grounded in</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSION_IDS.map((id) => (
                  <tr key={id}>
                    <th scope="row">
                      <span className="dimension-name">{DIMENSION_LABELS[id]}</span>
                      <span className="dimension-weight">
                        <span className="weight-track" aria-hidden="true">
                          <span className="weight-fill" style={{ width: `${(DIMENSION_WEIGHTS[id] / MAX_WEIGHT) * 100}%` }} />
                        </span>
                        <span className="weight-value">{DIMENSION_WEIGHTS[id]}</span>
                      </span>
                    </th>
                    <td>
                      <ul className="principle-list">
                        {GROUNDING[id].map((g) => (
                          <li key={g.principle}>
                            {g.principle} <span className="muted">· {CODE_SHORT[g.code] ?? g.code}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted small weights-total">
              Weights add up to 100. No published code assigns weights; they are <a href="#judgement">our own judgment</a>.
            </p>
          </div>

          <div className="tile-grid">
            <div className="card tile">
              <h3>The account a message should give</h3>
              <p>{ACCOUNT_CARD}</p>
              {onOverview ? (
                <p>
                  <button type="button" className="linklike" onClick={onOverview}>See the definitions in the Tool Overview</button>
                </p>
              ) : null}
            </div>
            <div className="card tile">
              <h3>Agency and abstraction scan</h3>
              <p>{SCAN_CARD}</p>
            </div>
          </div>
        </Section>

        <Section id="protocols" title="Event protocols" tag="applied">
          {PROTOCOLS_INTRO.map((text) => (
            <p className="prose" key={text}>{text}</p>
          ))}
          {PROTOCOLS.map((protocol, i) => (
            <ProtocolCard key={protocol.id} protocol={protocol} openByDefault={i === 0} />
          ))}
          <p className="planned-note" role="note">
            <Clock />
            <span>
              <strong>{PROTOCOLS_PLANNED[0]}</strong> {PROTOCOLS_PLANNED[1]}
            </span>
          </p>
        </Section>

        <Section id="codes" title="Published codes" tag="grounded">
          <p className="prose">{CODES_INTRO}</p>
          <div className="tile-grid">
            {CODES.map((code) => (
              <div className="card tile" key={code.id}>
                <h3>
                  {code.name}
                  {code.year ? ` (${code.year})` : ""}
                </h3>
                <p className="muted small code-body">{code.body}</p>
                <p>{code.summary}</p>
                <p>
                  <a href={code.url} target="_blank" rel="noopener noreferrer">
                    Read the code <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="judgement" title="Our own judgment" tag="judgement">
          <p className="prose">{JUDGEMENT_INTRO}</p>
          <dl className="judgement-list">
            {ownJudgment().map(([term, meaning]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>
    </div>
  );
}

function Section({ id, title, tag, children }: { id: string; title: string; tag?: ClaimKind; children: ReactNode }) {
  return (
    <section id={id} className="overview-section" aria-labelledby={`${id}-heading`}>
      <div className="section-head">
        <h2 id={`${id}-heading`}>{title}</h2>
        {tag ? <Tag kind={tag} /> : null}
      </div>
      {children}
    </section>
  );
}

/** Which of the three kinds of claim this is. One component, three colors. */
function Tag({ kind }: { kind: ClaimKind }) {
  return <span className={`tag tag-${kind}`}>{CLAIM_LABELS[kind]}</span>;
}

/** When a protocol applies, from its own selection fields. */
function appliedWhen(p: ProtocolFile): string {
  if (p.layer === "posture") {
    const purposes = (p.purposes ?? []).map((g) => `"${g}"`).join(" or ");
    return `Applied when the purpose is ${purposes}, on top of any event or none`;
  }
  const events = (p.events ?? []).map((e) => `"${e}"`);
  const list = events.length <= 1 ? events.join("") : `${events.slice(0, -1).join(", ")} or ${events[events.length - 1]}`;
  return `Applied when the event is ${list}`;
}

/**
 * One protocol, closed until asked for.
 *
 * Five protocols open at once was the page's old fault: the checks are the
 * reason to trust the tool and the reason nobody read the page. The first is
 * open so the shape is obvious without a click; any number can be open.
 */
function ProtocolCard({ protocol, openByDefault }: { protocol: ProtocolFile; openByDefault: boolean }) {
  const [open, setOpen] = useState(openByDefault);
  const bodyId = useId();
  const checks = protocol.elements.length;
  return (
    <section className="card protocol-card" aria-labelledby={`${protocol.id}-heading`}>
      <button
        type="button"
        className="protocol-head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          {/* A real heading for the outline, inside the button that opens the
              card: <h3> is flow content and cannot sit in a <button>, so the
              role carries it instead. */}
          <span className="protocol-title" role="heading" aria-level={3} id={`${protocol.id}-heading`}>
            {protocol.name}
          </span>
          <span className="protocol-meta">
            {appliedWhen(protocol)} · {checks} check{checks === 1 ? "" : "s"} · Version {protocol.version}
          </span>
          <span className="protocol-rests">
            <strong>Rests on:</strong> {protocol.rests_on}
          </span>
        </span>
        <span className={open ? "chevron chevron-open" : "chevron"} aria-hidden="true" />
      </button>

      {open ? (
        <div className="protocol-body" id={bodyId}>
          <table className="check-table">
            <thead>
              <tr>
                <th scope="col">Check</th>
                <th scope="col">What the draft should do</th>
                <th scope="col">Scored under</th>
              </tr>
            </thead>
            <tbody>
              {protocol.elements.map((e) => (
                <tr key={e.name}>
                  <th scope="row">{e.name}</th>
                  <td>{e.means}</td>
                  <td>
                    <span className="chip-dimension">{DIMENSION_LABELS[e.dimension]}</span>
                    {e.weight === "supporting" ? <span className="muted small"> supporting</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="rests-row">
            <div className="label">Rests on</div>
            <p>{protocol.rests_on}</p>
          </div>

          <Sources protocol={protocol} />
        </div>
      ) : null}
    </section>
  );
}

/**
 * The full sources, one click further in.
 *
 * They are the reason to trust any of this, and three thousand words of them
 * were the reason nobody read the page. Kept whole, never on by default.
 */
function Sources({ protocol }: { protocol: ProtocolFile }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const sections: [string, string][] = [
    ["Source", protocolSection(protocol.prose, "Source")],
    ["Basis", protocolSection(protocol.prose, "Basis")],
    [
      "What it cannot do",
      protocolSection(protocol.prose, "What this protocol does not cover") || protocolSection(protocol.prose, "Limits"),
    ],
  ];
  return (
    <div className="sources">
      <button type="button" className="sources-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span className={open ? "chevron chevron-small chevron-open" : "chevron chevron-small"} aria-hidden="true" />
        Sources in full, and what this protocol can't judge
      </button>
      {open ? (
        <div className="sources-body" id={id}>
          {sections.map(([heading, text]) => {
            const blocks = proseBlocks(text);
            if (blocks.length === 0) return null;
            return (
              <div key={heading}>
                <div className="label">{heading}</div>
                {blocks.map((b, i) =>
                  b.kind === "list" ? (
                    <ul key={i} className="tight prose small">
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
        </div>
      ) : null}
    </div>
  );
}
