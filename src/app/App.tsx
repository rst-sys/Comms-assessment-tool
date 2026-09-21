import { useEffect, useState } from "react";
import type { EvaluationResult } from "../engine/evaluate.js";
import type { EvaluationRequest } from "../engine/types.js";
import type { ComparisonResult } from "../engine/compare.js";
import type { SavedReview } from "../engine/savedReview.js";
import { ApiError, compare, evaluate, fetchConfig } from "./api.js";
import { CompareRevisions } from "./compare/CompareRevisions.js";
import { StandardsLibrary } from "./StandardsLibrary.js";
import { ToolOverview } from "./ToolOverview.js";
import { WelcomeScreen } from "./WelcomeScreen.js";
import { SignIn } from "./SignIn.js";
import { COMING_SOON, FEATURES } from "./features.js";
import { APP_NAME, INTRO } from "./copy.js";
import { IntakeScreen } from "./intake/IntakeScreen.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";
import { ResultsPage } from "./results/ResultsPage.js";
import { STUB_PAGES, type StubKey } from "./stubs.js";
import type { EvaluationRequest as Req } from "../engine/types.js";

export interface AppOptions {
  /** Settings and draft to load on first render. */
  initialRequest?: Req;
  /** Whether Import from URL is available in this runtime. */
  urlImport?: boolean;
  /** Whether the hosted web search for public context is available. */
  publicSearch?: boolean;
  /** Extra line for the intake screen describing this runtime, if any. */
  runtimeNote?: string;
}

type View = "review" | "overview" | "compare" | "standards" | StubKey;

interface Review {
  request: EvaluationRequest;
  result: EvaluationResult;
}

/**
 * The single-page app. Draft text and results live in component state only:
 * no storage, no URL parameters, no page-title changes. "Discard" remounts
 * the intake screen blank.
 */
export function App({ initialRequest, urlImport = true, publicSearch = true, runtimeNote }: AppOptions = {}) {
  const [view, setView] = useState<View>("review");
  const [config, setConfig] = useState<PrivacyConfig | null>(null);
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intakeKey, setIntakeKey] = useState(0);
  const [baseline, setBaseline] = useState<SavedReview | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchConfig().then((c) => {
      if (cancelled) return;
      setConfig(c);
      // A hosted deployment asks for the shared password before anything that
      // costs money. If the config call itself failed we let the app through:
      // the server still refuses every paid call without the password, so the
      // worst case is a clear refusal rather than a page that never loads.
      setSignedIn(!(c?.gate_enabled && !c.signed_in));
      setConfigLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runEvaluation = async (request: EvaluationRequest) => {
    setBusy(true);
    setError(null);
    setComparison(null);
    setComparisonError(null);
    try {
      const result = await evaluate(request);
      setReview({ request, result });
      window.scrollTo({ top: 0 });
      if (baseline) {
        try {
          setComparison(await compare(baseline, request, result));
        } catch (e) {
          console.error(`comparison failed: ${e instanceof ApiError ? e.kind : "unknown"}`);
          setComparisonError(e instanceof ApiError ? e.message : "The comparison failed, but the review above is complete.");
        }
      }
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
    setBaseline(null);
    setComparison(null);
    setComparisonError(null);
    setIntakeKey((k) => k + 1);
    setView("review");
    window.scrollTo({ top: 0 });
  };

  const stub = STUB_PAGES.find((s) => s.key === view);

  // Wait for the config before deciding: showing the password screen to someone
  // already signed in, or the app to someone who is not, would both be wrong.
  if (!configLoaded) return <main className="page" aria-busy="true" />;
  if (!signedIn) return <SignIn onDone={() => setSignedIn(true)} />;

  if (!welcomeDone) {
    return (
      <WelcomeScreen
        config={config}
        runtimeNote={runtimeNote}
        onStart={() => setWelcomeDone(true)}
        onOverview={() => {
          setView("overview");
          setWelcomeDone(true);
        }}
      />
    );
  }

  return (
    <>
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
              <li>
                <button type="button" className={view === "overview" ? "nav-link nav-active" : "nav-link"} aria-current={view === "overview" ? "page" : undefined} onClick={() => setView("overview")}>
                  Tool Overview
                </button>
              </li>
              <li>
                {FEATURES.compareRevisions ? (
                  <button type="button" className={view === "compare" ? "nav-link nav-active" : "nav-link"} aria-current={view === "compare" ? "page" : undefined} onClick={() => setView("compare")}>
                    Compare Revisions
                  </button>
                ) : (
                  <button type="button" className="nav-link nav-soon" disabled title={COMING_SOON}>
                    Compare Revisions
                  </button>
                )}
              </li>
              <li>
                <button type="button" className={view === "standards" ? "nav-link nav-active" : "nav-link"} aria-current={view === "standards" ? "page" : undefined} onClick={() => setView("standards")}>
                  Standards Library
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
      {view === "overview" ? (
        <ToolOverview config={config} runtimeNote={runtimeNote} />
      ) : view === "standards" ? (
        <StandardsLibrary />
      ) : view === "compare" && FEATURES.compareRevisions ? (
        <CompareRevisions
          baseline={baseline}
          onLoad={(saved: SavedReview) => {
            setBaseline(saved);
            setReview(null);
            setComparison(null);
            setComparisonError(null);
          }}
          onClear={() => setBaseline(null)}
          onStart={() => {
            setIntakeKey((k) => k + 1);
            setView("review");
            window.scrollTo({ top: 0 });
          }}
        />
      ) : stub ? (
        <main className="page">
          <h2>{stub.title}</h2>
          <p className="prose">{stub.text}</p>
        </main>
      ) : review ? (
        <ResultsPage result={review.result} request={review.request} config={config} onDiscard={discard} baseline={baseline} comparison={comparison} comparisonError={comparisonError} />
      ) : (
        <>
          {runtimeNote ? <p className="page muted small" style={{ paddingBottom: 0 }}>{runtimeNote}</p> : null}
          <IntakeScreen
            key={intakeKey}
            config={config}
            busy={busy}
            error={error}
            onEvaluate={runEvaluation}
            initialRequest={baseline ? baselineRequest(baseline, initialRequest) : initialRequest}
            baseline={baseline}
            urlImport={urlImport}
            publicSearch={publicSearch}
          />
        </>
      )}
    </>
  );
}

/** Turns a saved review's settings and context into an empty request to pre-fill the intake. */
function baselineRequest(saved: SavedReview, fallback?: Req): Req {
  const s = saved.settings;
  return {
    ...(fallback ?? ({} as Req)),
    draft: "",
    communication_event: s.communication_event as Req["communication_event"],
    communication_format: s.communication_format as Req["communication_format"],
    primary_audience: s.primary_audience as Req["primary_audience"],
    setting: s.setting as Req["setting"],
    market: s.market as Req["market"],
    goal: s.goal as Req["goal"],
    audience_scope: s.audience_scope as Req["audience_scope"],
    context: { ...saved.context },
    heightened_review: s.heightened_review,
    already_published: s.already_published,
    stance: s.stance as Req["stance"],
    reacting_to: s.reacting_to,
    audience_documents: [],
  };
}
