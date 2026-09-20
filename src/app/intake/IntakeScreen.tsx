import { useEffect, useState, type ReactNode } from "react";
import { DEMOS, type Fixture } from "../../engine/fixtures.js";
import type { SavedReview } from "../../engine/savedReview.js";
import {
  AUDIENCE_SCOPES,
  COMMUNICATION_TYPES,
  CONTEXT_FIELDS,
  GOALS,
  MARKETS,
  PRIMARY_AUDIENCES,
  SETTINGS,
  type ContextFields,
  type EvaluationRequest,
  type AudienceDocument,
  type Stance,
} from "../../engine/types.js";
import { AudienceDocuments } from "./AudienceDocuments.js";
import { importUrl, type ImportedPage } from "../api.js";
import { PrivacyPanel, type PrivacyConfig } from "../PrivacyPanel.js";
import {
  canEvaluate,
  EMPTY_FIELDS,
  fieldsComplete,
  heightenedByDefault,
  HIGH_RISK_WARNING,
  MAX_WORDS,
  MIN_WORDS,
  showHighRiskWarning,
  wordCount,
  type DraftFields,
} from "./rules.js";

interface Props {
  config: PrivacyConfig | null;
  busy: boolean;
  error: string | null;
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

const FIELD_OPTIONS: { key: keyof DraftFields; label: string; options: readonly string[] }[] = [
  { key: "communication_type", label: "Communication type", options: COMMUNICATION_TYPES },
  { key: "primary_audience", label: "Primary audience", options: PRIMARY_AUDIENCES },
  { key: "setting", label: "Setting", options: SETTINGS },
  { key: "market", label: "Market", options: MARKETS },
  { key: "goal", label: "Goal", options: GOALS },
  { key: "audience_scope", label: "Audience scope", options: AUDIENCE_SCOPES },
];

/**
 * The intake screen (Section 3): draft on the left, context on the right,
 * privacy panel above both. All state lives in this component; nothing is
 * written to storage, the URL or the page title.
 */
export function IntakeScreen({ config, busy, error, onEvaluate, initialRequest, baseline = null, urlImport = true, publicSearch = true }: Props) {
  const init = initialRequest;
  const [tab, setTab] = useState<SourceTab>("paste");
  const [draft, setDraft] = useState(init?.draft ?? "");
  const [fields, setFields] = useState<DraftFields>(
    init
      ? { communication_type: init.communication_type, primary_audience: init.primary_audience, setting: init.setting, market: init.market, goal: init.goal, audience_scope: init.audience_scope }
      : EMPTY_FIELDS,
  );
  const [context, setContext] = useState<ContextFields>(init ? { ...init.context } : {});
  const [heightened, setHeightened] = useState(init?.heightened_review ?? false);
  const [documents, setDocuments] = useState<AudienceDocument[]>(init?.audience_documents ?? []);
  const [stance, setStance] = useState<Stance>(init?.stance ?? "proactive");
  const [reactingTo, setReactingTo] = useState(init?.reacting_to ?? "");
  const [isDemo, setIsDemo] = useState(Boolean(init));
  const [url, setUrl] = useState("");
  const [imported, setImported] = useState<ImportedPage | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Auto-check heightened review when type or setting calls for it; the user may uncheck afterwards.
  useEffect(() => {
    if (heightenedByDefault(fields.communication_type, fields.setting)) setHeightened(true);
  }, [fields.communication_type, fields.setting]);

  const words = wordCount(draft);
  const stanceOk = stance === "proactive" || reactingTo.trim().length > 0;
  const ready = canEvaluate(draft, fields, isDemo) && stanceOk && !busy;

  const setField = (key: keyof DraftFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value as DraftFields[typeof key] }));
  };

  const loadDemo = (fixture: Fixture) => {
    const r = fixture.request;
    setTab("paste");
    setDraft(r.draft);
    setFields({
      communication_type: r.communication_type,
      primary_audience: r.primary_audience,
      setting: r.setting,
      market: r.market,
      goal: r.goal,
      audience_scope: r.audience_scope,
    });
    setContext({ ...r.context });
    setHeightened(r.heightened_review);
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
      if (page.suggested_type && fields.communication_type === "") setField("communication_type", page.suggested_type);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Couldn't extract readable text from this page. Paste the text instead.");
    } finally {
      setImporting(false);
    }
  };

  const submit = () => {
    if (!fieldsComplete(fields) || !ready) return;
    onEvaluate({
      draft: draft.trim(),
      ...fields,
      context: Object.fromEntries(Object.entries(context).filter(([, v]) => (v ?? "").trim().length > 0)),
      heightened_review: heightened,
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

          <div className="fields-grid">
            {FIELD_OPTIONS.map((f) => (
              <label key={f.key} className="field">
                <span className="label">{f.label}</span>
                <select value={fields[f.key]} onChange={(e) => setField(f.key, e.target.value)} required>
                  <option value="">Select…</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
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

          <label className="checkbox">
            <input type="checkbox" checked={heightened} onChange={(e) => setHeightened(e.target.checked)} />
            Apply heightened review for employment, restructuring, health and safety, AI, surveillance, privacy, financial disclosure, public policy, litigation-sensitive topics, or vulnerable audiences.
          </label>

          {showHighRiskWarning(fields.communication_type, fields.market) ? (
            <p className="warning" role="note">{HIGH_RISK_WARNING}</p>
          ) : null}
          {error ? <p className="error" role="alert">{error}</p> : null}
          <p>
            <button type="button" className="primary" onClick={submit} disabled={!ready} aria-disabled={!ready}>
              {busy ? "Evaluating…" : baseline ? "Evaluate and compare" : "Evaluate draft"}
            </button>
          </p>
        </section>

        <section className="card" aria-labelledby="context-heading">
          <h2 id="context-heading">Provide additional context</h2>
          <p className="muted small">These fields are the engine's only source of ground truth. Everything in the draft is treated as a claim; what you put here is treated as fact. All optional.</p>
          {CONTEXT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea rows={2} value={context[key] ?? ""} onChange={(e) => setContext((prev) => ({ ...prev, [key]: e.target.value }))} />
            </Field>
          ))}
          <AudienceDocuments documents={documents} onChange={setDocuments} publicSearch={publicSearch} />
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
