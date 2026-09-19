import { useEffect, useState } from "react";
import type { EvaluationResult } from "../engine/evaluate.js";
import type { EvaluationRequest } from "../engine/types.js";
import { ApiError, evaluate, fetchConfig } from "./api.js";
import { ConfidentialityNotice } from "./ConfidentialityNotice.js";
import { APP_NAME, INTRO } from "./copy.js";
import { IntakeScreen } from "./intake/IntakeScreen.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";
import { ResultsPage } from "./results/ResultsPage.js";
import { STUB_PAGES, type StubKey } from "./stubs.js";
import type { Fixture } from "../engine/fixtures.js";

export interface AppOptions {
  /** A demo to load on first render. */
  initialFixture?: Fixture;
  /** Whether Import from URL is available in this runtime. */
  urlImport?: boolean;
  /** Extra line for the intake screen describing this runtime, if any. */
  runtimeNote?: string;
}

type View = "review" | StubKey;

interface Review {
  request: EvaluationRequest;
  result: EvaluationResult;
}

/**
 * The single-page app. Draft text and results live in component state only:
 * no storage, no URL parameters, no page-title changes. "Discard" remounts
 * the intake screen blank.
 */
export function App({ initialFixture, urlImport = true, runtimeNote }: AppOptions = {}) {
  const [view, setView] = useState<View>("review");
  const [config, setConfig] = useState<PrivacyConfig | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intakeKey, setIntakeKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchConfig().then((c) => {
      if (!cancelled) setConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runEvaluation = async (request: EvaluationRequest) => {
    setBusy(true);
    setError(null);
    try {
      const result = await evaluate(request);
      setReview({ request, result });
      window.scrollTo({ top: 0 });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "The evaluation failed. Try again.";
      // Log the kind and the hashed request id only; never the draft or the response.
      console.error(`evaluation failed: ${e instanceof ApiError ? `${e.kind}${e.requestId ? ` [${e.requestId}]` : ""}` : "unknown"}`);
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setReview(null);
    setError(null);
    setIntakeKey((k) => k + 1);
    setView("review");
    window.scrollTo({ top: 0 });
  };

  const stub = STUB_PAGES.find((s) => s.key === view);

  return (
    <>
      {!noticeDismissed ? <ConfidentialityNotice onDismiss={() => setNoticeDismissed(true)} /> : null}
      <header className="site-header no-print">
        <div className="page" style={{ paddingBottom: 0 }}>
          <h1 style={{ marginBottom: 4 }}>{APP_NAME}</h1>
          <p className="muted intro" style={{ marginTop: 0 }}>{INTRO}</p>
          <nav aria-label="Areas">
            <ul className="nav">
              <li>
                <button type="button" className={view === "review" ? "nav-link nav-active" : "nav-link"} aria-current={view === "review" ? "page" : undefined} onClick={() => setView("review")}>
                  Review
                </button>
              </li>
              {STUB_PAGES.map((s) => (
                <li key={s.key}>
                  <button type="button" className={view === s.key ? "nav-link nav-active" : "nav-link"} aria-current={view === s.key ? "page" : undefined} onClick={() => setView(s.key)}>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {stub ? (
        <main className="page">
          <h2>{stub.title}</h2>
          <p className="prose">{stub.text}</p>
        </main>
      ) : review ? (
        <ResultsPage result={review.result} request={review.request} config={config} onDiscard={discard} />
      ) : (
        <>
          {runtimeNote ? <p className="page muted small" style={{ paddingBottom: 0 }}>{runtimeNote}</p> : null}
          <IntakeScreen key={intakeKey} config={config} busy={busy} error={error} onEvaluate={runEvaluation} initialFixture={initialFixture} urlImport={urlImport} />
        </>
      )}
    </>
  );
}
