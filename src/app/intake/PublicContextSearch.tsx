import { useState } from "react";
import type { AudienceDocument } from "../../engine/types.js";
import type { PublicContextItem } from "../../engine/publicContext.js";
import { ApiError, findPublicContext } from "../api.js";

interface Props {
  available: boolean;
  onAdd: (documents: AudienceDocument[]) => void;
}

/**
 * Find public context (revision 10): the user types a topic, never the
 * draft; the hosted app searches the public web through the provider's
 * search tool; the user chooses which results become media-report documents.
 */
export function PublicContextSearch({ available, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PublicContextItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searched, setSearched] = useState(false);

  if (!available) {
    return (
      <div className="public-context">
        <h4>Find public context</h4>
        <p className="muted small">Web search is available in the hosted app, not on this page. Paste any media coverage the audience may have seen as a document above.</p>
      </div>
    );
  }

  const search = async () => {
    setBusy(true);
    setError(null);
    setItems([]);
    setSelected(new Set());
    try {
      const result = await findPublicContext(query.trim());
      setItems(result.items);
      setSelected(new Set(result.items.map((_, i) => i)));
      setSearched(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "The search failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const addSelected = () => {
    const docs: AudienceDocument[] = items
      .filter((_, i) => selected.has(i))
      .map((it) => ({
        kind: "media_report",
        title: it.title,
        description: `${it.source}${it.date ? `, ${it.date}` : ""}`,
        delivery: `Public coverage${it.url ? ` (${it.url})` : ""}, found by web search`,
        reach: "unknown",
        same_time: false,
        text: it.summary,
      }));
    onAdd(docs);
    setItems([]);
    setSelected(new Set());
    setSearched(false);
  };

  return (
    <div className="public-context">
      <h4>Find public context</h4>
      <p className="muted small">Type a topic, company or event to look for public coverage the audience may already have seen. Your draft is never used as a search term. Results are added only when you choose them.</p>
      <div className="url-input">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Northwind Foods Denver support center" aria-label="Public context search" disabled={busy} />
        <button type="button" onClick={search} disabled={busy || query.trim().length < 3}>{busy ? "Searching…" : "Search the web"}</button>
      </div>
      {error ? <p className="error" role="alert">{error}</p> : null}
      {searched && items.length === 0 && !error ? <p className="muted small">Nothing relevant was found.</p> : null}
      {items.length > 0 ? (
        <>
          <ul className="doc-list" aria-label="Search results">
            {items.map((it, i) => (
              <li key={i} className="doc-item">
                <label className="checkbox" style={{ margin: 0 }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} />
                  <span>
                    <strong>{it.title}</strong> <span className="muted small">· {it.source}{it.date ? ` · ${it.date}` : ""}</span>
                    <div className="small">{it.summary}</div>
                    {it.url ? <a className="small" href={it.url} target="_blank" rel="noreferrer noopener">{it.url}</a> : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p><button type="button" onClick={addSelected} disabled={selected.size === 0}>Add selected as media reports ({selected.size})</button></p>
        </>
      ) : null}
    </div>
  );
}
