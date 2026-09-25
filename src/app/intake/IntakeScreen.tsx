import { useEffect, useState, type ReactNode } from "react";
import { DEMOS, type Fixture } from "../../engine/fixtures.js";
import type { SavedReview } from "../../engine/savedReview.js";
import { type EvaluationRequest, type AudienceDocument } from "../../engine/types.js";
import {
  AudienceQuestion,
  CountryList,
  EventQuestion,
  FormatQuestion,
  LocationQuestion,
  OrganizationQuestion,
  PurposeQuestion,
  SituationQuestion,
} from "./Questions.js";
import { AudienceDocuments } from "./AudienceDocuments.js";
import { FEATURES } from "../features.js";
import { Progress } from "../Progress.js";
import { importUrl, type ImportedPage } from "../api.js";
import { PrivacyPanel, type PrivacyConfig } from "../PrivacyPanel.js";
import {
  canEvaluate,
  defaultAudiences,
  EMPTY_INTAKE,
  HIGH_RISK_WARNING,
  intakeComplete,
  intakeFields,
  intakeFromRequest,
  MAX_WORDS,
  MIN_WORDS,
  missingAnswers,
  showHighRiskWarning,
  wordCount,
  type IntakeState,
  type EvaluationFailure,
} from "./rules.js";

interface Props {
  config: PrivacyConfig | null;
  busy: boolean;
  error: EvaluationFailure | null;
  onEvaluate: (request: EvaluationRequest) => void;
  /** Settings and context to load on first render (a demo, or a saved review's settings). */
  initialRequest?: EvaluationRequest;
  /** A saved review this draft will be compared against. */
  baseline?: SavedReview | null;
  /** Whether Import from URL is available in this runtime. */
  urlImport?: boolean;
  /** Whether the hosted web search for public context is available. */
  publicSearch?: boolean;
}

type SourceTab = "paste" | "url";

/**
 * The Review screen: three steps down one column.
 *
 * Step 1 is who the organization is, step 2 is six dropdowns about the
 * situation, step 3 is the draft. The six were panels of radio buttons and
 * the screen was five of them tall; the options and their grouping have not
 * changed, only where they live until they are needed.
 *
 * The thirteen labelled context fields are gone. One optional box under the
 * draft carries the same ground truth: almost nobody filled more than two of
 * the thirteen, and the rest went to the engine as twelve lines of "(not
 * supplied)" on every review.
 *
 * All state lives in this component; nothing is written to storage, the URL
 * or the page title.
 */
export function IntakeScreen({ config, busy, error, onEvaluate, initialRequest, baseline = null, urlImport = true, publicSearch = true }: Props) {
  const init = initialRequest;
  const [tab, setTab] = useState<SourceTab>("paste");
  const [draft, setDraft] = useState(init?.draft ?? "");
  const [intake, setIntake] = useState<IntakeState>(init ? intakeFromRequest(init) : EMPTY_INTAKE);
  // Smart defaults stop as soon as the user has an opinion: the format
  // pre-selects an audience and a holding statement pre-selects "Still
  // unfolding", but neither may overwrite a choice already made. The old
  // heightened-review tick-box set itself and never cleared, which is the
  // bug these two flags exist to prevent.
  const [audiencesTouched, setAudiencesTouched] = useState(Boolean(init));
  const [situationTouched, setSituationTouched] = useState(Boolean(init));
  const [context, setContext] = useState(init?.context ?? "");
  const [documents, setDocuments] = useState<AudienceDocument[]>(init?.audience_documents ?? []);
  const [isDemo, setIsDemo] = useState(Boolean(init));
  const [url, setUrl] = useState("");
  const [imported, setImported] = useState<ImportedPage | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const words = wordCount(draft);
  const ready = canEvaluate(draft, intake, isDemo) && !busy;
  const missing = missingAnswers(intake);

  /**
   * Scrolls to the step that still needs an answer. The disabled button used
   * to be the only signal and the list of names only helps if you can find
   * them; on a three-step page the step is the useful unit, not the field.
   */
  const jumpToFirstMissing = () => {
    const step = intakeComplete(intake) ? "step-draft" : intake.organization_type === "" || intake.headquarters.trim() === "" ? "step-org" : "step-about";
    document.getElementById(step)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadDemo = (fixture: Fixture) => {
    const r = fixture.request;
    setTab("paste");
    setDraft(r.draft);
    setIntake(intakeFromRequest(r));
    setAudiencesTouched(true);
    setSituationTouched(true);
    setContext(r.context);
    setIsDemo(true);
    setImported(null);
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    setIsDemo(false);
    if (value.trim().length === 0) setImported(null);
  };

  const doImport = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const page = await importUrl(url);
      setDraft(page.text);
      setImported(page);
      setIsDemo(false);
      // The same smart default a click on that format would have applied:
      // the import fills the menu, so it fills what the menu fills.
      if (page.suggested_format && intake.communication_format === "") {
        const format = page.suggested_format;
        setIntake((prev) => {
          const next: IntakeState = { ...prev, communication_format: format };
          if (!audiencesTouched) next.audiences = defaultAudiences(format, next);
          return next;
        });
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Couldn't extract readable text from this page. Paste the text instead.");
    } finally {
      setImporting(false);
    }
  };

  const submit = () => {
    if (!intakeComplete(intake) || !ready) return;
    onEvaluate({
      draft: draft.trim(),
      ...intakeFields(intake),
      context: context.trim(),
      already_published: imported !== null,
      ...(documents.length > 0 ? { audience_documents: documents } : {}),
    });
  };

  return (
    <div className="page intake">
      <header className="page-head">
        <div>
          <h1>Start a review</h1>
          <p className="prose">Three steps. Tell us who you are, describe the situation, then paste your draft.</p>
        </div>
      </header>

      {baseline ? (
        <div className="card baseline-banner" role="note">
          <div className="label">Comparing with a saved review</div>
          <p style={{ margin: 0 }}>
            Saved {baseline.saved_at.slice(0, 10)} · score <strong>{baseline.score}</strong> of 100 ·{" "}
            {baseline.findings.length} finding{baseline.findings.length === 1 ? "" : "s"}. The settings below were restored
            from it. Add the new version of your draft, then evaluate.
          </p>
          {baseline.documents.length > 0 ? (
            <p className="muted small" style={{ margin: "8px 0 0" }}>
              Re-attach these for a like-for-like comparison: {baseline.documents.map((d) => d.title).join(", ")}.
            </p>
          ) : null}
        </div>
      ) : null}

      <Step n={1} id="step-org" title="Before you start" hint="Tell us about the organization you communicate for.">
        <OrganizationQuestion state={intake} onChange={setIntake} />
      </Step>

      <Step n={2} id="step-about" title="About this message" hint="Six questions. Your answers decide which standards apply.">
        <div className="menu-grid">
          <EventQuestion state={intake} onChange={setIntake} />
          <FormatQuestion
            state={intake}
            onChange={setIntake}
            audiencesTouched={audiencesTouched}
            situationTouched={situationTouched}
          />
          <AudienceQuestion state={intake} onChange={setIntake} onTouch={() => setAudiencesTouched(true)} />
          <SituationQuestion state={intake} onChange={setIntake} onTouch={() => setSituationTouched(true)} />
          <LocationQuestion state={intake} onChange={setIntake} />
          <PurposeQuestion state={intake} onChange={setIntake} />
        </div>
      </Step>

      <Step
        n={3}
        id="step-draft"
        title="Your draft"
        hint={`Paste the text or import it from a URL. ${MIN_WORDS} to ${MAX_WORDS.toLocaleString()} words.`}
      >
        <div className="draft-head">
          <div className="tabs no-print" role="tablist" aria-label="Draft source">
            <button type="button" role="tab" aria-selected={tab === "paste"} className={tab === "paste" ? "tab tab-active" : "tab"} onClick={() => setTab("paste")}>
              Paste text
            </button>
            {urlImport ? (
              <button type="button" role="tab" aria-selected={tab === "url"} className={tab === "url" ? "tab tab-active" : "tab"} onClick={() => setTab("url")}>
                Import from URL
              </button>
            ) : null}
          </div>
          <p className="demo-link no-print">
            Try a demo:{" "}
            {DEMOS.map((d, i) => (
              <span key={d.key}>
                {i > 0 ? " · " : ""}
                <button type="button" className="linklike" onClick={() => loadDemo(d)}>{d.name.replace(/^Demo \d — /, "")}</button>
              </span>
            ))}
          </p>
        </div>
        {tab === "url" ? (
          <div className="url-row">
            <label htmlFor="import-url" className="label">Address of a published page</label>
            <div className="url-input">
              <input id="import-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/newsroom/statement" disabled={importing} />
              <button type="button" onClick={doImport} disabled={importing || url.trim().length === 0}>
                {importing ? "Fetching…" : "Fetch text"}
              </button>
            </div>
            {importError ? <p className="error" role="alert">{importError}</p> : null}
            <p className="muted small">The page is fetched once and its main text is placed below for you to review and trim. The engine never sees the address or the page itself.</p>
          </div>
        ) : null}
        {imported ? (
          <div className="import-info" aria-live="polite">
            <div className="label">Imported from</div>
            <div>{imported.source_url}</div>
            {imported.title ? <div><strong>{imported.title}</strong></div> : null}
            {imported.published ? <div className="muted small">Published {imported.published}</div> : null}
            <div className="muted small">This draft is already issued; findings will be framed retrospectively.</div>
          </div>
        ) : null}
        <textarea
          id="draft-text"
          aria-label="Draft text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={16}
          placeholder="Paste the draft message here."
        />
        <div className="muted small word-count" aria-live="polite">
          {words} {words === 1 ? "word" : "words"}
          {isDemo ? " (demo draft)" : ` · ${MIN_WORDS}–${MAX_WORDS.toLocaleString()}`}
        </div>

        <label className="field context-field">
          <span className="label">
            Anything else we should know? <span className="label-optional">(optional)</span>
          </span>
          <span className="muted small">
            Facts, constraints or background the draft doesn't show. What you write here is treated as fact; the draft is
            treated as claims.
          </span>
          <textarea
            rows={4}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="For example: what's confirmed so far, what can't be disclosed and why, the planned publication date."
          />
        </label>

        {FEATURES.audienceDocuments ? (
          <AudienceDocuments documents={documents} onChange={setDocuments} publicSearch={publicSearch && FEATURES.publicContextSearch} />
        ) : null}
      </Step>

      {showHighRiskWarning(intake.communication_event, intake.locations) ? (
        <p className="warning" role="note">{HIGH_RISK_WARNING}</p>
      ) : null}
      {error ? (
        <div role="alert">
          <p className="error" style={{ marginBottom: 4 }}>{error.message}</p>
          <p className="muted small" style={{ margin: 0 }}>
            Failed after {error.seconds} second{error.seconds === 1 ? "" : "s"}
            {error.requestId ? <> · reference <code>{error.requestId}</code></> : null}
            {error.requestId ? " · quote it if you report this" : null}
          </p>
        </div>
      ) : null}

      <div className="evaluate-row">
        <button type="button" className="primary" onClick={submit} disabled={!ready} aria-disabled={!ready}>
          {busy ? "Evaluating…" : baseline ? "Evaluate and compare" : "Evaluate draft"}
          {busy || baseline ? null : <span aria-hidden="true" className="button-arrow">→</span>}
        </button>
        {missing.length > 0 ? (
          <p className="muted small" aria-live="polite">
            Still to answer: {missing.join(", ")}.{" "}
            <button type="button" className="linklike" onClick={jumpToFirstMissing}>Jump to the first one</button>
          </p>
        ) : null}
        {busy ? <Progress /> : null}
      </div>

      <PrivacyPanel config={config} />
      <CountryList />
    </div>
  );
}

/** One numbered step. The number is decoration; the heading carries the meaning. */
function Step({ n, id, title, hint, children }: { n: number; id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="card step" id={id} aria-labelledby={`${id}-heading`}>
      <div className="step-head">
        <span className="step-number" aria-hidden="true">{n}</span>
        <div>
          <h2 id={`${id}-heading`}>{title}</h2>
          <p className="muted small step-hint">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
