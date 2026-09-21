import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { APP_NAME, INTRO } from "./copy.js";
import {
  ACCOUNT_ELEMENTS,
  CONFIDENTIALITY_NOTICE,
  NOT_THIS,
  privacyPoints,
  VALUE_POINTS,
  WHAT_YOU_GET,
} from "./overviewContent.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

/** The full explanation of the tool, reachable from the Tool Overview tab. */
export function ToolOverview({ config, runtimeNote }: { config: PrivacyConfig | null; runtimeNote?: string }) {
  return (
    <main className="page welcome" aria-labelledby="overview-heading">
      <h1 id="overview-heading">Tool overview</h1>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card welcome-card" aria-labelledby="what-heading">
        <h2 id="what-heading">What it does</h2>
        <p className="prose">
          You paste a draft message and answer three questions: what happened, what kind of document this is, and who it
          is for. {APP_NAME} then reads it the way a thoughtful, skeptical member of that audience would. It asks one
          question throughout: does this message give an account of the decision behind it, or does it only sound
          reassuring?
        </p>
        <p className="prose">You get back, in about a minute:</p>
        <ul className="tight prose">
          {WHAT_YOU_GET.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card welcome-card" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <p className="prose">
          The assistant applies one consistent framework to every draft, so two messages reviewed a month apart are held to
          the same standard.
        </p>

        <h3>The account a message should give</h3>
        <p className="prose">Nine things a reader should be able to see:</p>
        <dl className="account-list">
          {ACCOUNT_ELEMENTS.map(([name, meaning]) => (
            <div key={name} className="account-item">
              <dt>{name}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>

        <h3>Ten weighted dimensions</h3>
        <p className="prose">
          Each is scored from 0 to 5 with a written rationale, then weighted into the score out of 100. Accountability and
          agency carries the most weight, because it is where trust is most often lost.
        </p>
        <ul className="weights">
          {DIMENSION_IDS.map((id) => (
            <li key={id}>
              <span>{DIMENSION_LABELS[id]}</span>
              <span className="weight">{DIMENSION_WEIGHTS[id]}</span>
            </li>
          ))}
        </ul>

        <h3>The standard for what happened</h3>
        <p className="prose">
          The event you name brings in a further set of checks. Every high-stakes event shares a core — who decided and
          who owns the response, who is affected, what is confirmed against what is assumed, what the reader should do,
          when the next update comes, and whether the hard fact is said plainly. Some events also have a standard of
          their own, written from published research or regulation.
        </p>
        <p className="prose">
          These are a lens on the ten dimensions above, never an eleventh score, and they never produce a section of
          their own: what they find appears as an ordinary finding or question. Every one of them is set out in the
          Standards Library, with its source and its limits. Choose "None of these" and the draft is judged on the ten
          dimensions alone.
        </p>

        <h3>Two lenses on top</h3>
        <ul className="tight prose">
          <li>
            <strong>Agency and abstraction scan.</strong> Six categories of language that hide who decided: external
            weather, institutional abstraction, audience displacement, passive accountability, values without action, and
            vague action. A phrase is flagged only when it is doing the explaining, never because a word appears. The
            scan shapes the findings and the scores; its flagged phrases are no longer printed back at you.
          </li>
          <li>
            <strong>Devil's advocate.</strong> Five audience perspectives chosen for your message type, each stating what a
            reasonable but skeptical reader may hear, question and find missing.
          </li>
        </ul>

        <h3>The evidence rule</h3>
        <p className="prose">
          Your draft is treated as claims; the context you supply is treated as fact. The assistant never invents a metric,
          a date, a commitment or a name, and it says plainly when a score reflects the draft's language alone. Supporting
          documents, earlier communications and media coverage you add are read as what the audience already has.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="value-heading">
        <h2 id="value-heading">Why use it</h2>
        <ul className="tight prose">
          {VALUE_POINTS.map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
        </ul>
      </section>

      <section className="card welcome-card" aria-labelledby="not-heading">
        <h2 id="not-heading">What it is not</h2>
        <dl className="account-list not-list">
          {NOT_THIS.map(([name, meaning]) => (
            <div key={name} className="account-item">
              <dt>{name}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="prose muted">It is decision-support software. The judgement, and the words, stay yours.</p>
      </section>

      <section className="card callout-privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your draft and your privacy</h2>
        <ul className="tight prose">
          {privacyPoints(config ? `${config.provider} (${config.model})` : null, config?.training_term ?? null).map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
        </ul>
        <p className="prose notice-text">{CONFIDENTIALITY_NOTICE}</p>
      </section>

      {runtimeNote ? <p className="muted small prose welcome-runtime">{runtimeNote}</p> : null}
    </main>
  );
}
