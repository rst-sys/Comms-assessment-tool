import { CONFIDENTIALITY_NOTICE } from "./overviewContent.js";
import { ArrowRight, CircleSlash, Lock, WarningTriangle } from "./Icons.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

export { CONFIDENTIALITY_NOTICE };

interface Props {
  config: PrivacyConfig | null;
  onStart: () => void;
  onOverview: () => void;
  onStandards: () => void;
}

/**
 * What the reader gets back, in the order the results page shows it. The
 * first phrase of each is the promise and is set in bold; the rest qualifies
 * it.
 */
const WHAT_YOU_GET: [string, string][] = [
  ["A score out of 100", "and a headline takeaway"],
  ["The findings that matter most,", "each with what to address"],
  ["The most damning reasonable reading", "of your draft"],
  ["How five audiences", "might read it"],
  ["Questions for your experts", "before you publish"],
  ["A PDF", "to share with your team"],
];

const PRIVACY_POINTS = (provider: string) => [
  "Nothing is saved. Close the tab and it's gone.",
  `Sent once, only to ${provider}, for analysis.`,
  "No analytics or tracking. Errors are logged without your text.",
  "Public-coverage searches send only the topic you type.",
];

const WONT_DO = [
  "Write or rewrite your message",
  "Edit for grammar, style or readability",
  "Give legal, HR or investor-relations advice, or certify compliance",
  "Judge motives",
];

/**
 * The welcome screen (the owner's desktop artboard, revision 28).
 *
 * One screen, no scrolling at desk size: what the tool is, what comes back,
 * what not to paste into it, and the way in. Everything the old screen said
 * at length — why it matters, the ten dimensions, how the three questions
 * work, the full privacy list — now lives on the Tool Overview, which is
 * where somebody goes when they want it.
 */
export function WelcomeScreen({ config, onStart, onOverview, onStandards }: Props) {
  return (
    <main className="page welcome" aria-labelledby="welcome-heading">
      <div className="hero">
        <div className="hero-main">
          <p className="eyebrow">Decision support for high-stakes messages</p>
          <h1 id="welcome-heading" className="hero-title">
            Know whether your message will be trusted before your audience decides.
          </h1>
          <p className="hero-lede">
            Most messages that lose trust aren't badly written. They sound reassuring without explaining the decision.
            Paste your draft and context, and see it the way a thoughtful, skeptical reader will.
          </p>
          <div className="cta-row">
            <button type="button" className="primary cta" onClick={onStart} autoFocus>
              Start a review
              <ArrowRight />
            </button>
            <span className="cta-meta">About a minute · No account · Nothing saved</span>
          </div>
          <p className="callout-warning" role="note">
            <WarningTriangle />
            <span>
              <strong>WARNING:</strong> Do not paste privileged, material nonpublic or regulated personal information in
              the tool. Redact beforehand.
            </span>
          </p>
        </div>

        <section className="card hero-card" aria-labelledby="get-heading">
          <h2 id="get-heading">What you'll get</h2>
          <ol className="numbered">
            {WHAT_YOU_GET.map(([lead, rest], i) => (
              <li key={lead}>
                <span className="numbered-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{lead}</strong> {rest}
                </span>
              </li>
            ))}
          </ol>
          <p className="muted small hero-foot">
            Every draft is scored on the same ten weighted dimensions, plus any standard written for your type of event.{" "}
            <button type="button" className="linklike" onClick={onStandards}>See every standard in the Standards Library</button>
          </p>
        </section>
      </div>

      <div className="welcome-strip">
        <section aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="strip-heading">
            <Lock />
            Your draft stays private
          </h2>
          <ul className="tight strip-list">
            {PRIVACY_POINTS(config?.provider ?? "Anthropic").map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="wont-heading">
          <h2 id="wont-heading" className="strip-heading">
            <CircleSlash />
            What it won't do
          </h2>
          <ul className="tight strip-list">
            {WONT_DO.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="strip-close">
            The judgment, and the words, stay yours.{" "}
            <button type="button" className="linklike" onClick={onOverview}>Read the full Tool Overview</button>
          </p>
        </section>
      </div>
    </main>
  );
}
