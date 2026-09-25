import { useEffect, useState } from "react";
import type { EvaluationResult } from "../engine/evaluate.js";
import type { EvaluationRequest } from "../engine/types.js";
import type { ComparisonResult } from "../engine/compare.js";
import type { SavedReview } from "../engine/savedReview.js";
import { ApiError, compare, evaluate, fetchConfig } from "./api.js";
import { CompareRevisions } from "./compare/CompareRevisions.js";
import { StandardsLibrary } from "./StandardsLibrary.js";
import { ToolOverview } from "./ToolOverview.js";
import { Footer } from "./results/Footer.js";
import type { EvaluationFailure } from "./intake/rules.js";
import { WelcomeScreen } from "./WelcomeScreen.js";
import { SignIn } from "./SignIn.js";
import { FEATURES } from "./features.js";
import { APP_NAME } from "./copy.js";
import { ShieldCheck } from "./Icons.js";
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
  const [error, setError] = useState<EvaluationFailure | null>(null);
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
    const startedAt = Date.now();
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
      // The reference and the elapsed time go on screen as well as in the log.
      // "Try again" on its own leaves a tester with nothing to report and no
      // way to tell a slow failure from an instant one, which are different
      // faults with different causes.
      setError({
        message,
        requestId: e instanceof ApiError ? e.requestId : undefined,
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
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

  const go = (next: View) => {
    setView(next);
    setWelcomeDone(true);
  };

  if (!welcomeDone) {
    return (
      <>
        <SiteHeader view="review" onGo={go} />
        {/* No footer here: the welcome screen has to fit one desktop window,
            and everything the footer carries is on the next screen. */}
        <WelcomeScreen
          config={config}
          onStart={() => setWelcomeDone(true)}
          onOverview={() => go("overview")}
          onStandards={() => go("standards")}
        />
      </>
    );
  }

  return (
    <>
      <SiteHeader view={view} onGo={setView} />
      {view === "overview" ? (
        <ToolOverview config={config} runtimeNote={runtimeNote} onStandards={() => setView("standards")} />
      ) : view === "standards" ? (
        <StandardsLibrary onOverview={() => setView("overview")} />
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
          <h1>{stub.title}</h1>
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
      <div className={view === "overview" ? "page overview-foot" : "page"} style={{ paddingTop: 0 }}>
        <Footer />
      </div>
    </>
  );
}

/** Turns a saved review's settings and context into an empty request to pre-fill the intake. */
function baselineRequest(saved: SavedReview, fallback?: Req): Req {
  const s = saved.settings;
  return {
    ...(fallback ?? ({} as Req)),
    draft: "",
    organization: {
      type: s.organization_type as Req["organization"]["type"],
      ...(s.listed_where ? { listed_where: s.listed_where } : {}),
      headquarters: s.headquarters,
    },
    communication_event: s.communication_event as Req["communication_event"],
    ...(s.event_description ? { event_description: s.event_description } : {}),
    communication_format: s.communication_format as Req["communication_format"],
    ...(s.format_description ? { format_description: s.format_description } : {}),
    audiences: splitList(s.audiences) as Req["audiences"],
    situation: s.situation as Req["situation"],
    people_at_risk: s.people_at_risk,
    locations: splitList(s.locations),
    context: saved.context,
    already_published: s.already_published,
    purpose: s.purpose as Req["purpose"],
    audience_documents: [],
  };
}

/** A saved review stores lists as one comma-separated line; this reads it back. */
function splitList(value: string): string[] {
  return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
}

/**
 * The 72px bar every screen carries: the mark on the left, the areas on the
 * right. It used to be inside the signed-in branch, so the welcome screen had
 * no way to reach the other tabs — which is also why the app's name was an
 * <h1> here and every page had two.
 */
function SiteHeader({ view, onGo }: { view: View; onGo: (next: View) => void }) {
  // Seven areas do not fit a phone. Above 640px the CSS shows the list and
  // hides the button; below it, the button is the only way in, so the list
  // has to be closed until it is pressed.
  const [open, setOpen] = useState(false);
  const go = (next: View) => {
    setOpen(false);
    onGo(next);
  };
  return (
  <header className="site-header no-print">
    <div className="page">
      <div className="wordmark">
        <ShieldCheck />
        {APP_NAME}
      </div>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((v) => !v)}>
        Menu
      </button>
      <nav aria-label="Main" id="main-nav" className={open ? "nav-open" : undefined}>
        <ul className="nav">
          <li>
            <button type="button" className={view === "review" ? "nav-link nav-active" : "nav-link"} aria-current={view === "review" ? "page" : undefined} onClick={() => go("review")}>
              Review
            </button>
          </li>
          <li>
            <button type="button" className={view === "overview" ? "nav-link nav-active" : "nav-link"} aria-current={view === "overview" ? "page" : undefined} onClick={() => go("overview")}>
              Tool Overview
            </button>
          </li>
          {/* A tab that cannot be opened is a question every tester has
              to ask. The flag still guards the page, so bringing it back
              is a one-line change. */}
          {FEATURES.compareRevisions ? (
            <li>
              <button type="button" className={view === "compare" ? "nav-link nav-active" : "nav-link"} aria-current={view === "compare" ? "page" : undefined} onClick={() => go("compare")}>
                Compare Revisions
              </button>
            </li>
          ) : null}
          <li>
            <button type="button" className={view === "standards" ? "nav-link nav-active" : "nav-link"} aria-current={view === "standards" ? "page" : undefined} onClick={() => go("standards")}>
              Standards Library
            </button>
          </li>
          {STUB_PAGES.map((s) => (
            <li key={s.key}>
              <button type="button" className={view === s.key ? "nav-link nav-active" : "nav-link"} aria-current={view === s.key ? "page" : undefined} onClick={() => go(s.key)}>
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
  );
}
