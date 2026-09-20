import { useRef, useState, type ChangeEvent } from "react";
import {
  DOCUMENT_KINDS,
  DOCUMENT_REACH,
  MAX_AUDIENCE_DOCUMENTS,
  type AudienceDocument,
  type DocumentKind,
  type DocumentReach,
} from "../../engine/types.js";
import { ACCEPTED_EXTENSIONS, clampDocumentText, readDocumentText } from "./documents.js";
import { PublicContextSearch } from "./PublicContextSearch.js";
import { wordCount } from "./rules.js";

interface Props {
  documents: AudienceDocument[];
  onChange: (documents: AudienceDocument[]) => void;
  /** Whether the hosted "Find public context" search is available in this runtime. */
  publicSearch?: boolean;
}

const EMPTY: AudienceDocument = { kind: "supporting", title: "", description: "", delivery: "", reach: "all", same_time: true, text: "" };

const HINTS: Record<DocumentKind, { description: string; delivery: string }> = {
  supporting: { description: "Questions and answers on selection, timing and support", delivery: "Linked from the email and posted on the intranet the same morning" },
  prior_communication: { description: "The CEO's all-hands note on the reorganization", delivery: "Emailed to all employees on 2 September" },
  media_report: { description: "Trade press report that layoffs are planned", delivery: "Published last week and widely shared internally" },
  other_context: { description: "Town-hall questions submitted last month", delivery: "Collected from the whole company in August" },
};

export const KIND_LABEL = Object.fromEntries(DOCUMENT_KINDS) as Record<DocumentKind, string>;
export const REACH_LABEL = Object.fromEntries(DOCUMENT_REACH) as Record<DocumentReach, string>;

/**
 * What the audience already has or will receive (revision 8): supporting
 * documents, earlier communications, media reports, other background. A
 * file or pasted text, plus what it is and how the audience gets it. Held
 * in component state only.
 */
export function AudienceDocuments({ documents, onChange, publicSearch = true }: Props) {
  const [draft, setDraft] = useState<AudienceDocument>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [trimmed, setTrimmed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    setError(null);
    try {
      const raw = await readDocumentText(file);
      const { text, trimmed: wasTrimmed } = clampDocumentText(raw);
      setTrimmed(wasTrimmed);
      setDraft((d) => ({ ...d, text, title: d.title || file.name.replace(/\.[^.]+$/, "") }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The file could not be read.");
    } finally {
      setReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const add = () => {
    if (!draft.text.trim()) {
      setError("Add the document's text, by file or by pasting, before adding it.");
      return;
    }
    onChange([...documents, { ...draft, title: draft.title.trim() || `Document ${documents.length + 1}`, text: draft.text.trim(), same_time: draft.kind === "supporting" ? draft.same_time : false }]);
    setDraft(EMPTY);
    setTrimmed(false);
    setError(null);
  };

  const addMany = (items: AudienceDocument[]) => {
    onChange([...documents, ...items].slice(0, MAX_AUDIENCE_DOCUMENTS));
  };

  const remove = (index: number) => onChange(documents.filter((_, i) => i !== index));
  const full = documents.length >= MAX_AUDIENCE_DOCUMENTS;
  const hint = HINTS[draft.kind];

  return (
    <section className="supporting" aria-labelledby="audience-docs-heading">
      <h3 id="audience-docs-heading">What the audience already has or will receive</h3>
      <p className="muted small">Optional. Documents provided with this message (an FAQ, a manager toolkit), earlier communications from you on the topic, media reports or public commentary the audience may have seen, and other background. The engine reads them as the audience's starting point: what a supporting document supplies counts as visible, earlier statements are checked for consistency, and public claims should be addressed, not assumed true.</p>

      {documents.length > 0 ? (
        <ul className="doc-list">
          {documents.map((d, i) => (
            <li key={i} className="doc-item">
              <div>
                <span className="chip">{KIND_LABEL[d.kind]}</span> <strong>{d.title}</strong> <span className="muted small">· {wordCount(d.text)} words</span>
                {d.description ? <div className="small">{d.description}</div> : null}
                <div className="muted small">{d.delivery || "Delivery not described"} · {REACH_LABEL[d.reach].toLowerCase()}{d.kind === "supporting" ? (d.same_time ? " · same time" : " · later") : ""}</div>
              </div>
              <button type="button" className="linklike" onClick={() => remove(i)} aria-label={`Remove ${d.title}`}>Remove</button>
            </li>
          ))}
        </ul>
      ) : null}

      {full ? (
        <p className="muted small">Up to {MAX_AUDIENCE_DOCUMENTS} documents.</p>
      ) : (
        <div className="doc-form">
          <label className="field">
            <span className="label">Kind</span>
            <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as DocumentKind })} aria-label="Document kind">
              {DOCUMENT_KINDS.map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Title</span>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Employee FAQ" />
          </label>
          <label className="field">
            <span className="label">What it is</span>
            <input type="text" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder={hint.description} aria-label="What the document is" />
          </label>
          <label className="field">
            <span className="label">{draft.kind === "supporting" ? "How and when the audience receives it" : "How and when the audience encountered it"}</span>
            <input type="text" value={draft.delivery} onChange={(e) => setDraft({ ...draft, delivery: e.target.value })} placeholder={hint.delivery} aria-label="How and when the audience receives or encountered it" />
          </label>
          <label className="field">
            <span className="label">{draft.kind === "supporting" ? "Who receives it" : "Who has seen it"}</span>
            <select value={draft.reach} onChange={(e) => setDraft({ ...draft, reach: e.target.value as DocumentReach })} aria-label="Audience reach">
              {DOCUMENT_REACH.map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </label>
          {draft.kind === "supporting" ? (
            <label className="checkbox">
              <input type="checkbox" checked={draft.same_time} onChange={(e) => setDraft({ ...draft, same_time: e.target.checked })} />
              Arrives at the same time as the main communication
            </label>
          ) : null}
          <label className="field">
            <span className="label">File (.txt, .md, .docx or .pdf)</span>
            <input ref={fileInput} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} onChange={onFile} disabled={reading} aria-label="Document file" />
          </label>
          <label className="field">
            <span className="label">Or paste the text</span>
            <textarea rows={4} value={draft.text} onChange={(e) => { const { text, trimmed: t } = clampDocumentText(e.target.value); setDraft({ ...draft, text }); setTrimmed(t); }} placeholder="Paste the document's text here." aria-label="Document text" />
          </label>
          <div className="muted small">{wordCount(draft.text)} words{trimmed ? " (trimmed to the 20,000-character limit)" : ""}{reading ? " · reading file…" : ""}</div>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <p><button type="button" onClick={add} disabled={reading}>Add document</button></p>
        </div>
      )}

      <PublicContextSearch available={publicSearch && !full} onAdd={addMany} />
    </section>
  );
}
