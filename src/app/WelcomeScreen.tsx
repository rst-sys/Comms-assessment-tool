import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from "../engine/scoring.js";
import { DIMENSION_IDS } from "../engine/types.js";
import { APP_NAME, INTRO } from "./copy.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

/** Section 4's notice, verbatim; it lives in the privacy callout below (revision 11). */
export const CONFIDENTIALITY_NOTICE =
  "This prototype sends your draft to an external AI provider for analysis and stores nothing. Do not submit attorney-client privileged, material nonpublic, or regulated personal information unless your legal, privacy, and security teams have approved this provider and mode. Redaction is not available in this build.";

/** The nine things a message should make visible (PROMPT.md Section 2). */
const ACCOUNT_ELEMENTS: [string, string][] = [
  ["Decision", "what was decided, announced, changed or corrected"],
  ["Agency", "who had the authority to decide, approve or intervene"],
  ["Context", "the external conditions that mattered, stated specifically"],
  ["Exposure", "the internal choices and assumptions that increased exposure"],
  ["Impact", "who is affected, and how"],
  ["Correction", "what will change"],
  ["Ownership", "who owns the change"],
  ["Verification", "the metric, date or review that lets people judge follow-through"],
  ["Learning", "what changes so it does not happen again"],
];

const NOT_THIS: [string, string][] = [
  ["It does not write for you.", "No drafting, no rewriting, no suggested wording. You are the author and the authority; the tool points at passages and names the kind of information that would strengthen them."],
  ["It is not an editor or copyeditor.", "Grammar, spelling, house style and readability scores are outside its scope."],
  ["It does not certify compliance.", "It is not legal, employment, labor, financial-disclosure, regulatory, privacy or tax advice, and it does not replace review by counsel, HR or investor relations. It flags where that review is needed."],
  ["It does not judge motives.", "It never says an organization lied, acted in bad faith or broke the law. It distinguishes missing information from false information."],
];

interface Props {
  config: PrivacyConfig | null;
  /** Extra line describing this runtime, when it differs from the hosted app. */
  runtimeNote?: string;
  onStart: () => void;
}

/**
 * The welcome screen (revision 11): what the tool does, how it works and on
 * what framework, what you get, what it is not, and a plain-language privacy
 * callout carrying the Section 4 confidentiality notice.
 */
export function WelcomeScreen({ config, runtimeNote, onStart }: Props) {
  return (
    <main className="page welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">{APP_NAME}</h1>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card welcome-card" aria-labelledby="what-heading">
        <h2 id="what-heading">What it does</h2>
        <p className="prose">
          You paste a draft message, say who it is for and what it is trying to do, and the assistant reads it the way a
          thoughtful, skeptical member of that audience would. It asks one question throughout: does this message give an
          account of the decision behind it, or does it only sound reassuring?
        </p>
        <p className="prose">You get back, in about two minutes:</p>
        <ul className="tight prose">
          <li>A trust score out of 100 with a band, and a readiness recommendation.</li>
          <li>A short headline and summary stating the key takeaway.</li>
          <li>Specific findings, each tied to a passage or a gap, with the kind of information that would close it.</li>
          <li>A scan of language that lets responsibility disappear into abstractions, highlighted in your draft.</li>
          <li>Five audience perspectives, each with the concern it would raise.</li>
          <li>Questions to settle before you publish, and the specialist reviews the draft appears to need.</li>
          <li>A PDF of the whole review to keep or to share with colleagues.</li>
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

        <h3>Two lenses on top</h3>
        <ul className="tight prose">
          <li>
            <strong>Agency and abstraction scan.</strong> Six categories of language that hide who decided: external
            weather, institutional abstraction, audience displacement, passive accountability, values without action, and
            vague action. A phrase is flagged only when it is doing the explaining, never because a word appears.
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
          <li><strong>A second opinion before you issue,</strong> when the people who could give one are unavailable or too close to the decision.</li>
          <li><strong>The same standard every time,</strong> across drafts, teams and months, rather than whoever happens to review it.</li>
          <li><strong>Specific, not vague.</strong> It names the passage and the missing information, so you know what to go and find out.</li>
          <li><strong>A record you can share.</strong> The PDF gives counsel, HR or leadership a common reference for what is still unresolved.</li>
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
        <p className="prose muted">
          It is decision-support software. The judgement, and the words, stay yours.
        </p>
      </section>

      <section className="card callout-privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your draft and your privacy</h2>
        <ul className="tight prose">
          <li><strong>Nothing is saved.</strong> Your draft, your context and the results live in this browser tab only. Close the tab and they are gone. There is no account, no history and no database.</li>
          <li><strong>Your draft is sent to one place, once.</strong> It goes to {config ? `${config.provider} (${config.model})` : "the configured AI provider"} to be analysed, and nowhere else. {config?.training_term ? `Training: ${config.training_term.toLowerCase()}.` : ""}</li>
          <li><strong>Nobody is watching you use it.</strong> No analytics, no tracking, no session recording. Errors are logged as a code and a random reference, never as your text.</li>
          <li><strong>Your draft never becomes a web search.</strong> If you search for public coverage, only the topic you type is sent.</li>
          <li><strong>Redaction is not available yet.</strong> Nothing is removed from your text before it is sent.</li>
        </ul>
        <p className="prose notice-text">{CONFIDENTIALITY_NOTICE}</p>
      </section>

      {runtimeNote ? <p className="muted small prose welcome-runtime">{runtimeNote}</p> : null}

      <p className="welcome-start">
        <button type="button" className="primary" onClick={onStart} autoFocus>
          Start a review
        </button>
      </p>
    </main>
  );
}
