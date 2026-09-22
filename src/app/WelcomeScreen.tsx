import { APP_NAME, INTRO, TAGLINE } from "./copy.js";
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

/** What the reader gets back, in the order the results page shows it. */
const WHAT_YOU_GET_HERE: string[] = [
  "A score out of 100 and a headline takeaway",
  "The findings that matter most, each with what to address",
  "The most damning reasonable reading of your draft — the reaction you'd least want to see",
  "How five audiences might read it",
  "Questions to put to your subject matter experts before you publish",
  "A PDF of the full assessment to share with your team or bring to the review meeting",
];

/**
 * The welcome screen (owner's copy, revision 27).
 *
 * Every word here is the owner's. The structure follows it: the problem first,
 * then what you get, then the three things that make the judgement worth
 * having — one standard every time, a standard chosen for the event, and no
 * standard the reader cannot go and read. The three intake questions come
 * last, because they only make sense once you know what they are for.
 *
 * The privacy points and the "what it won't do" list are the shared copy, so
 * this screen and the Tool Overview cannot promise different things.
 */
export function WelcomeScreen({ config, runtimeNote, onStart, onOverview, onStandards }: Props) {
  const privacy = privacyPoints(config ? `${config.provider} (${config.model})` : null, null);
  return (
    <main className="page welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">{APP_NAME}</h1>
      <p className="welcome-tagline">{TAGLINE}</p>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card welcome-card" aria-labelledby="why-heading">
        <h2 id="why-heading">Why it matters</h2>
        <p className="prose">
          High-stakes messages rarely fail because they're badly written. They fail because they sound reassuring without
          explaining anything: what was decided, why, who it affects and what happens next. Readers spot that gap right
          away. You usually find out later, in the comments, the coverage or the town hall.
        </p>
        <p className="prose">
          {APP_NAME} reads your draft the way a thoughtful, skeptical member of your audience would. It asks one question
          throughout: does this message give an account of the decision, or does it only sound reassuring?
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="get-heading">
        <h2 id="get-heading">What you get</h2>
        <p className="prose">In about a minute, you receive:</p>
        <ul className="tight prose">
          {WHAT_YOU_GET_HERE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card welcome-card" aria-labelledby="standard-heading">
        <h2 id="standard-heading">Consistent, tailored and transparent</h2>
        <p className="prose">
          <strong>One standard, every time.</strong> Every draft is scored on the same ten weighted dimensions. A message
          reviewed today and one reviewed next month are held to the same bar.
        </p>
        <p className="prose">
          <strong>Tailored to the moment.</strong> Tell it what kind of event you're communicating about, such as a
          workforce reduction, a data incident, a product recall, a leadership departure, or one of ten others. It applies
          the checks every serious event needs. Where a standard has been written for that specific event, it applies that
          standard too. More are being added.
        </p>
        <p className="prose">
          <strong>No black box.</strong> Nothing is applied that you can't see. The{" "}
          <button type="button" className="linklike" onClick={onStandards}>Standards Library</button> lists every standard
          in use, what each one checks, the research or regulation behind it, and what it can't judge.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works: three questions</h2>
        <ol className="tight prose">
          <li>
            <strong>What happened?</strong> The event determines which standards apply.
          </li>
          <li>
            <strong>What are you writing?</strong> The format (press release, employee announcement, manager toolkit)
            determines what the document should contain.
          </li>
          <li>
            <strong>Who is it for?</strong> The audience determines who bears the impact.
          </li>
        </ol>
        <p className="prose">
          Your draft is treated as claims to be tested. The context you provide is treated as fact. The tool never invents
          a metric, a date or a name.
        </p>
      </section>

      <section className="card welcome-card" aria-labelledby="not-heading">
        <h2 id="not-heading">What it won't do</h2>
        <p className="prose">It's built to sharpen your judgement, not replace it.</p>
        <ul className="tight prose">
          {NOT_THIS_SHORT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="prose muted">This is decision-support software. The judgement, and the words, stay yours.</p>
      </section>

      <section className="card callout-privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your draft stays private</h2>
        <ul className="tight prose">
          {privacy.slice(0, 4).map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
          <li>
            <strong>Redaction isn't available yet.</strong> Nothing is removed from your text before it's sent. Don't
            paste privileged, material nonpublic or regulated personal information without approval from your legal,
            privacy and security teams.
          </li>
        </ul>
      </section>

      <p className="prose welcome-more">
        For the full framework, the ten dimensions and a walkthrough of everything you get back, see the{" "}
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
