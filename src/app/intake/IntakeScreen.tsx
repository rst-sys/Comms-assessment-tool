import { useEffect, useState, type ReactNode } from "react";
import { DEMOS, type Fixture } from "../../engine/fixtures.js";
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
} from "../../engine/types.js";
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
  /** A demo to load on first render, so a preview opens in a working state. */
  initialFixture?: Fixture;
  /** Whether Import from URL is available in this runtime. */
  urlImport?: boolean;
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
export function IntakeScreen({ config, busy, error, onEvaluate, initialFixture, urlImport = true }: Props) {
  const init = initialFixture?.request;
  const [tab, setTab] = useState<SourceTab>("paste");
  const [draft, setDraft] = useState(init?.draft ?? "");
  const [fields, setFields] = useState<DraftFields>(
    init
      ? { communication_type: init.communication_type, primary_audience: init.primary_audience, setting: init.setting, market: init.market, goal: init.goal, audience_scope: init.audience_scope }
      : EMPTY_FIELDS,
  );
  const [context, setContext] = useState<ContextFields>(init ? { ...init.context } : {});
  const [heightened, setHeightened] = useState(init?.heightened_review ?? false);
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
  const ready = canEvaluate(draft, fields, isDemo) && !busy;

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
    });
  };

  return (
    <div className="page intake">
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
              {busy ? "Evaluating…" : "Evaluate draft"}
            </button>
          </p>
        </section>

        <section className="card" aria-labelledby="context-heading">
          <h2 id="context-heading">What the engine can rely on</h2>
          <p className="muted small">These fields are the engine's only source of ground truth. Everything in the draft is treated as a claim; what you put here is treated as fact. All optional.</p>
          {CONTEXT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea rows={2} value={context[key] ?? ""} onChange={(e) => setContext((prev) => ({ ...prev, [key]: e.target.value }))} />
            </Field>
          ))}
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
