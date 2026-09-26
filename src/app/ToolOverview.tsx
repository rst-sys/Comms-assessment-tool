import { type ReactNode } from "react";
import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { WarningTriangle } from "./Icons.js";
import { PageNav } from "./PageNav.js";
import {
  ACCOUNT_ELEMENTS,
  DIMENSIONS_NOTE,
  EVIDENCE_RULE,
  LENSES,
  LENSES_INTRO,
  NOT_THIS,
  NOT_THIS_CLOSE,
  OVERVIEW_EYEBROW,
  OVERVIEW_QUESTION,
  OVERVIEW_SECTIONS,
  OVERVIEW_TITLE,
  privacyPoints,
  REDACTION_WARNING,
  REVIEW_STEPS,
  SCORE_INTRO,
  VALUE_POINTS,
  WHAT_YOU_GET,
  WHY_USE_IT,
} from "./overviewContent.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

interface Props {
  config: PrivacyConfig | null;
  runtimeNote?: string;
  onStandards?: () => void;
}

/** The heaviest dimension sets the bar scale, so the longest bar is always full. */
const MAX_WEIGHT = Math.max(...DIMENSION_IDS.map((id) => DIMENSION_WEIGHTS[id]));

/**
 * The Tool Overview (the owner's desktop artboard, revision 29).
 *
 * One long read with a contents list beside it, rather than six cards of
 * equal weight: this is the page somebody opens with a question, so it is
 * built to be skimmed to the answer. Sections in the order a reader asks
 * them — why, how, what comes back, how it is scored, what else is applied,
 * what it won't do, what happens to the draft.
 */
export function ToolOverview({ config, runtimeNote, onStandards }: Props) {
  const provider = config ? `${config.provider} (${config.model})` : null;

  return (
    <div className="page overview">
      <PageNav sections={OVERVIEW_SECTIONS} />

      <main className="overview-main" aria-labelledby="overview-heading">
        <p className="eyebrow">{OVERVIEW_EYEBROW}</p>
        <h1 id="overview-heading" className="overview-title">{OVERVIEW_TITLE}</h1>
        <p className="overview-lede">
          It reads your draft the way a thoughtful, skeptical member of your audience would, and asks one question
          throughout: <em>{OVERVIEW_QUESTION}</em>
        </p>

        <Section id="why" title="Why use it">
          <p className="prose">{WHY_USE_IT}</p>
          <div className="tile-grid">
            {VALUE_POINTS.map(([title, body]) => (
              <div className="card tile" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="how" title="How a review works">
          <ol className="steps">
            {REVIEW_STEPS.map(([title, body], i) => (
              <li key={title}>
                <span className="step-label">Step {i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className="evidence-rule">
            <h3>The evidence rule</h3>
            <p>
              <strong>{EVIDENCE_RULE[0]}</strong> {EVIDENCE_RULE[1]}
            </p>
          </div>
        </Section>

        <Section id="get" title="What you get back">
          <ol className="numbered numbered-two">
            {WHAT_YOU_GET.map(([lead, rest], i) => (
              <li key={lead}>
                <span className="numbered-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{lead}</strong> {rest}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="score" title="How the score is built">
          <p className="prose">{SCORE_INTRO}</p>

          <div className="card panel-card">
            <h3>The account a message should give</h3>
            <p className="muted small">Ten things a reader should be able to see.</p>
            <dl className="account-grid">
              {ACCOUNT_ELEMENTS.map(([name, meaning]) => (
                <div key={name} className="account-row">
                  <dt>{name}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card panel-card">
            <h3>Ten weighted dimensions</h3>
            <p className="muted small">{DIMENSIONS_NOTE}</p>
            <ul className="weight-bars">
              {DIMENSION_IDS.map((id, i) => (
                <li key={id} className={i === 0 ? "weight-lead" : undefined}>
                  <span className="weight-name">{DIMENSION_LABELS[id]}</span>
                  <span className="weight-track" aria-hidden="true">
                    <span className="weight-fill" style={{ width: `${(DIMENSION_WEIGHTS[id] / MAX_WEIGHT) * 100}%` }} />
                  </span>
                  <span className="weight-value">{DIMENSION_WEIGHTS[id]}</span>
                </li>
              ))}
            </ul>
            <p className="muted small weights-total">Weights add up to 100.</p>
          </div>
        </Section>

        <Section id="lenses" title="Event standards and lenses">
          <p className="prose">{LENSES_INTRO}</p>
          <div className="tile-grid tile-grid-three">
            {LENSES.map((lens) => (
              <div className="card tile" key={lens.title}>
                <h3>{lens.title}</h3>
                {lens.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
                {lens.title === "Event standards" && onStandards ? (
                  <p>
                    <button type="button" className="linklike" onClick={onStandards}>Browse the Standards Library</button>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>

        <Section id="wont" title="What it won't do">
          <div className="def-grid">
            {NOT_THIS.map(([title, body]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="closing-line">{NOT_THIS_CLOSE}</p>
        </Section>

        <Section id="privacy" title="Your draft and your privacy">
          <div className="tile-grid">
            {privacyPoints(provider, config?.training_term ?? null).map(([title, body]) => (
              <div className="card tile" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="callout-warning" role="note">
            <WarningTriangle />
            <span>
              <strong>WARNING:</strong> {REDACTION_WARNING}
            </span>
          </p>
        </Section>

        {runtimeNote ? <p className="muted small prose welcome-runtime">{runtimeNote}</p> : null}
      </main>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="overview-section" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}
