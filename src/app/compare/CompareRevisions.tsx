import { useRef, useState, type ChangeEvent } from "react";
import { parseSavedReview, SavedReviewError, SETTING_LABELS, type SavedReview } from "../../engine/savedReview.js";

interface Props {
  baseline: SavedReview | null;
  onLoad: (saved: SavedReview) => void;
  onClear: () => void;
  onStart: () => void;
}

/**
 * Compare Revisions (revision 12): load the review file you saved earlier,
 * then review a new version of the draft against it. The file holds the
 * earlier review, not the earlier draft.
 */
export function CompareRevisions({ baseline, onLoad, onClear, onStart }: Props) {
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      onLoad(parseSavedReview(await file.text()));
    } catch (err) {
      setError(err instanceof SavedReviewError ? err.message : "That file could not be read.");
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  return (
    <main className="page" aria-labelledby="compare-heading">
      <h2 id="compare-heading">Compare revisions</h2>
      <p className="prose">
        Review a new version of a draft against a review you saved earlier, and see which problems you closed. Save a
        review from the results page after any review; the file holds what the tool said and the settings you chose, not
        your draft, though the findings in it quote short passages.
      </p>

      <section className="card" aria-labelledby="load-heading">
        <h3 id="load-heading" style={{ marginTop: 0 }}>Load a saved review</h3>
        <label className="field">
          <span className="label">Saved review file</span>
          <input ref={input} type="file" accept=".json,application/json" onChange={onFile} aria-label="Saved review file" />
        </label>
        {error ? <p className="error" role="alert">{error}</p> : null}

        {baseline ? (
          <>
            <div className="baseline-card">
              <div className="label">Loaded</div>
              <p style={{ margin: "0 0 8px" }}>
                <strong>{baseline.settings.communication_event}</strong> to {baseline.settings.audiences.toLowerCase()},
                saved {baseline.saved_at.slice(0, 10)}.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                Score <strong>{baseline.score}</strong> of 100 — {baseline.band}. {baseline.findings.length}{" "}
                finding{baseline.findings.length === 1 ? "" : "s"}.
              </p>
              {baseline.summary.headline ? <p className="muted" style={{ margin: 0 }}>{baseline.summary.headline}</p> : null}
              {!baseline.excerpts_included ? (
                <p className="muted small" style={{ marginTop: 8 }}>This file was saved without pulled-out quotations, so the comparison works from the written findings alone.</p>
              ) : null}
              {baseline.documents.length > 0 ? (
                <p className="muted small" style={{ marginTop: 8 }}>
                  Documents attached last time (their contents were not saved; re-attach them for a like-for-like
                  comparison): {baseline.documents.map((d) => d.title).join(", ")}.
                </p>
              ) : null}
            </div>
            <details className="settings-detail">
              <summary>Settings that will be restored</summary>
              <ul className="tight">
                {(Object.keys(SETTING_LABELS) as (keyof typeof SETTING_LABELS)[])
                  .filter((k) => baseline.settings[k] !== "" && baseline.settings[k] !== false)
                  .map((k) => (
                    <li key={k}>
                      {SETTING_LABELS[k]}: {String(baseline.settings[k])}
                    </li>
                  ))}
              </ul>
            </details>
            <p className="results-actions">
              <button type="button" className="primary" onClick={onStart}>Add the new draft</button>
              <button type="button" onClick={onClear}>Clear</button>
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}
