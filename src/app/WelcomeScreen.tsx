import { APP_NAME, INTRO } from "./copy.js";
import { CONFIDENTIALITY_NOTICE, NOT_THIS_SHORT, privacyPoints } from "./overviewContent.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

export { CONFIDENTIALITY_NOTICE };

interface Props {
  config: PrivacyConfig | null;
  runtimeNote?: string;
  onStart: () => void;
  onOverview: () => void;
}

/**
 * The welcome screen (revision 11): the same points as the Tool Overview
 * page, in one screen, with the privacy callout and a link to the fuller
 * explanation.
 */
export function WelcomeScreen({ config, runtimeNote, onStart, onOverview }: Props) {
  const privacy = privacyPoints(config ? `${config.provider} (${config.model})` : null, null);
  return (
    <main className="page welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">{APP_NAME}</h1>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card welcome-card" aria-labelledby="what-heading">
        <h2 id="what-heading">What it does</h2>
        <p className="prose">
          You paste a draft; {APP_NAME} reads it the way a thoughtful, skeptical member of your audience would, asking one
          question: does this message give an account of the decision behind it, or does it only sound reassuring?
        </p>
        <p className="prose">
          In about two minutes you get a trust score out of 100, a headline takeaway, findings tied to specific passages, a
          scan of language that hides responsibility, five audience perspectives, questions to settle before publishing,
          and a PDF of it all.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <p className="prose">
          One consistent framework every time: the nine things a reader should be able to see (decision, agency, context,
          exposure, impact, correction, ownership, verification, learning), scored across ten weighted dimensions, plus a
          scan for language that hides who decided and five skeptical audience perspectives.
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
