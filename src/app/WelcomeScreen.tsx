import { APP_NAME, INTRO } from "./copy.js";
import { CONFIDENTIALITY_NOTICE, NOT_THIS_SHORT, privacyPoints } from "./overviewContent.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

export { CONFIDENTIALITY_NOTICE };

interface Props {
  config: PrivacyConfig | null;
  runtimeNote?: string;
  onStart: () => void;
  onOverview: () => void;
  onStandards: () => void;
}

/**
 * The welcome screen (revision 11): the same points as the Tool Overview
 * page, in one screen, with the privacy callout and a link to the fuller
 * explanation.
 */
export function WelcomeScreen({ config, runtimeNote, onStart, onOverview, onStandards }: Props) {
  const privacy = privacyPoints(config ? `${config.provider} (${config.model})` : null, null);
  return (
    <main className="page welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">{APP_NAME}</h1>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card welcome-card" aria-labelledby="what-heading">
        <h2 id="what-heading">What it does</h2>
        <p className="prose">
          {APP_NAME} reads your draft the way a thoughtful, skeptical member of your audience would, asking one question
          throughout: does this message give an account of the decision behind it, or does it only sound reassuring?
        </p>
        <p className="prose">
          In about a minute you get a score out of 100, a headline takeaway, the findings that matter with ways to fix
          each one, the most damaging way the draft could reasonably be read, what five audiences might say, questions
          worth settling before you publish, and a PDF of it all.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="standard-heading">
        <h2 id="standard-heading">What it judges against</h2>
        <p className="prose">
          Every draft is scored on the same ten weighted dimensions, so two messages reviewed a month apart are held to
          the same standard.
        </p>
        <p className="prose">
          You also say which high-stakes event the message is about — a workforce reduction, a data incident, a recall, a
          departure, and ten more. Naming it brings in the checks that any serious event needs, and where a standard has
          been written for that particular event, that too. More are being added.
        </p>
        <p className="prose">
          Nothing is applied that the tool will not show you. The{" "}
          <button type="button" className="linklike" onClick={onStandards}>Standards Library</button> lists every standard
          in use, what each one checks, the research or regulation it rests on, and what it cannot judge.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="how-heading">
        <h2 id="how-heading">What you tell it</h2>
        <p className="prose">
          Three questions, each doing one job. <strong>The event</strong> — what happened — decides which standard
          applies. <strong>The format</strong> — press release, employee announcement, manager toolkit — decides what the
          document should contain. <strong>The audience</strong> decides who the harm lands on.
        </p>
        <p className="prose">
          Your draft is treated as claims; the context you supply is treated as fact. It never invents a metric, a date or
          a name.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="not-heading">
        <h2 id="not-heading">What it is not</h2>
        <ul className="tight prose">
          {NOT_THIS_SHORT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="prose muted">It is decision-support software. The judgement, and the words, stay yours.</p>
      </section>

      <section className="card callout-privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your draft and your privacy</h2>
        <ul className="tight prose">
          {privacy.slice(0, 4).map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
          <li><strong>Redaction is not available yet.</strong> Nothing is removed from your text before it is sent, so do not paste privileged, material nonpublic or regulated personal information without your legal, privacy and security teams' approval.</li>
        </ul>
      </section>

      <p className="prose welcome-more">
        A fuller explanation of the framework, the ten dimensions and everything you get back is in the{" "}
        <button type="button" className="linklike" onClick={onOverview}>Tool Overview</button> tab.
      </p>

      {runtimeNote ? <p className="muted small prose welcome-runtime">{runtimeNote}</p> : null}

      <p className="welcome-start">
        <button type="button" className="primary" onClick={onStart} autoFocus>
          Start a review
        </button>
      </p>
    </main>
  );
}
