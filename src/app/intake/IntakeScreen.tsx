import { useEffect, useState, type ReactNode } from "react";
import { DEMOS, type Fixture } from "../../engine/fixtures.js";
import type { SavedReview } from "../../engine/savedReview.js";
import {
  CONTEXT_FIELDS,
  type ContextFields,
  type EvaluationRequest,
  type AudienceDocument,
  type Stance,
} from "../../engine/types.js";
import {
  AudienceQuestion,
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
 * The intake screen: the seven questions first, then the draft and the
 * context fields.
 *
 * The questions come before the paste box because they change what the
 * paste box is for. A holding statement from a charity to its donors and a
 * market disclosure from a listed company are judged against different
 * duties, and asking afterwards made the whole thing feel like paperwork
 * attached to a text area.
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
  const [context, setContext] = useState<ContextFields>(init ? { ...init.context } : {});
  const [documents, setDocuments] = useState<AudienceDocument[]>(init?.audience_documents ?? []);
  const [stance, setStance] = useState<Stance>(init?.stance ?? "proactive");
  const [reactingTo, setReactingTo] = useState(init?.reacting_to ?? "");
  const [isDemo, setIsDemo] = useState(Boolean(init));
  const [url, setUrl] = useState("");
  const [imported, setImported] = useState<ImportedPage | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const words = wordCount(draft);
  const stanceOk = stance === "proactive" || reactingTo.trim().length > 0;
  const ready = canEvaluate(draft, intake, isDemo) && stanceOk && !busy;
  const missing = missingAnswers(intake);

  const loadDemo = (fixture: Fixture) => {
    const r = fixture.request;
    setTab("paste");
    setDraft(r.draft);
    setIntake(intakeFromRequest(r));
    setAudiencesTouched(true);
    setSituationTouched(true);
    setContext({ ...r.context });
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
      context: Object.fromEntries(Object.entries(context).filter(([, v]) => (v ?? "").trim().length > 0)),
      already_published: imported !== null,
      ...(documents.length > 0 ? { audience_documents: documents } : {}),
      stance,
      ...(stance === "reactive" ? { reacting_to: reactingTo.trim() } : {}),
    });
  };

  return (
    <div className="page intake">
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
      <PrivacyPanel config={config} />
      <div className="intake-questions">
        <OrganizationQuestion state={intake} onChange={setIntake} />
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
      <div className="intake-grid">
        <section className="card" aria-labelledby="draft-heading">
          <h2 id="draft-heading">Draft</h2>
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
          {tab === "url" ? (
            <div className="url-row">
              <label htmlFor="import-url">Address of a published page</label>
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
          <p className="demo-link no-print">
            Load a demo draft:{" "}
            {DEMOS.map((d, i) => (
              <span key={d.key}>
                {i > 0 ? " · " : ""}
                <button type="button" className="linklike" onClick={() => loadDemo(d)}>{d.name.replace(/^Demo \d — /, "")}</button>
              </span>
            ))}
          </p>
          {imported ? (
            <div className="import-info" aria-live="polite">
              <div className="label">Imported from</div>
              <div>{imported.source_url}</div>
              {imported.title ? <div><strong>{imported.title}</strong></div> : null}
              {imported.published ? <div className="muted small">Published {imported.published}</div> : null}
              <div className="muted small">This draft is already issued; findings will be framed retrospectively.</div>
            </div>
          ) : null}
          <label htmlFor="draft-text" className="label">Draft text</label>
          <textarea id="draft-text" value={draft} onChange={(e) => onDraftChange(e.target.value)} rows={16} placeholder="Paste the draft message here." />
          <div className="muted small" aria-live="polite">
            {words} {words === 1 ? "word" : "words"}
            {isDemo ? " (demo draft)" : ` · ${MIN_WORDS}–${MAX_WORDS.toLocaleString()} words`}
          </div>

          <fieldset className="stance">
            <legend className="label">Stance</legend>
            <label className="checkbox">
              <input type="radio" name="stance" value="proactive" checked={stance === "proactive"} onChange={() => setStance("proactive")} />
              Proactive: we are initiating this
            </label>
            <label className="checkbox">
              <input type="radio" name="stance" value="reactive" checked={stance === "reactive"} onChange={() => setStance("reactive")} />
              Reactive: this responds to something the audience already knows about
            </label>
            {stance === "reactive" ? (
              <label className="field">
                <span className="label">What is this reacting to?</span>
                <textarea rows={2} value={reactingTo} onChange={(e) => setReactingTo(e.target.value)} placeholder="A press report on 12 September claiming the Denver center will close without notice; employee questions at the town hall." aria-label="What is this reacting to" />
              </label>
            ) : null}
          </fieldset>

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
          <p>
            <button type="button" className="primary" onClick={submit} disabled={!ready} aria-disabled={!ready}>
              {busy ? "Evaluating…" : baseline ? "Evaluate and compare" : "Evaluate draft"}
            </button>
          </p>
          {missing.length > 0 ? (
            <p className="muted small" aria-live="polite">
              Still to answer above: {missing.join(", ")}.
            </p>
          ) : null}
          {busy ? <Progress /> : null}
        </section>

        <section className="card" aria-labelledby="context-heading">
          <h2 id="context-heading">Provide additional context</h2>
          <p className="muted small">These fields are the engine's only source of ground truth. Everything in the draft is treated as a claim; what you put here is treated as fact. All optional.</p>
          {CONTEXT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea rows={2} value={context[key] ?? ""} onChange={(e) => setContext((prev) => ({ ...prev, [key]: e.target.value }))} />
            </Field>
          ))}
          {/* Switched off features are absent, not greyed out. A control a
              tester cannot use is a question they have to ask and an answer
              they have to read past; the feature flag still guards the code,
              so switching it back on is one line. */}
          {FEATURES.audienceDocuments ? (
            <AudienceDocuments documents={documents} onChange={setDocuments} publicSearch={publicSearch && FEATURES.publicContextSearch} />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
