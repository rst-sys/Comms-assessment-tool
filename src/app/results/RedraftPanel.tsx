import { useState } from "react";
import type { EvaluationResult } from "../../engine/evaluate.js";
import type { RedraftResult } from "../../engine/redraft.js";
import type { EvaluationRequest } from "../../engine/types.js";
import { ApiError, redraft as requestRedraft } from "../api.js";
import { diffText } from "./diff.js";

interface Props {
  result: EvaluationResult;
  request: EvaluationRequest;
}

/**
 * Minimal-risk redraft, on request (Section 9). One button, one provider
 * call, then original and revision side by side with changes marked, the
 * change log, and the placeholders the user must fill.
 */
export function RedraftPanel({ result, request }: Props) {
  const [redraft, setRedraft] = useState<RedraftResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      setRedraft(await requestRedraft(request, result.analysis));
    } catch (e) {
      console.error(`redraft failed: ${e instanceof ApiError ? `${e.kind}${e.requestId ? ` [${e.requestId}]` : ""}` : "unknown"}`);
      setError(e instanceof ApiError ? e.message : "The revision failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" id="redraft" aria-labelledby="redraft-heading">
      <h2 id="redraft-heading">Minimal-risk revision</h2>
      {request.already_published ? (
        <p className="muted">This draft has already been issued. A revision here is a model for a future statement or a follow-up message, not a fix to the original.</p>
      ) : (
        <p className="muted">A revision that keeps the original's structure and tone and changes only what a finding justifies. Facts the draft does not contain appear as bracketed placeholders for you to fill.</p>
      )}
      {!redraft ? (
        <p className="no-print">
          <button type="button" className="primary" onClick={run} disabled={busy}>
            {busy ? "Drafting…" : "Draft a minimal-risk revision"}
          </button>
        </p>
      ) : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      {redraft ? <RedraftView original={request.draft} redraft={redraft} /> : null}
    </section>
  );
}

function RedraftView({ original, redraft }: { original: string; redraft: RedraftResult }) {
  const ops = diffText(original, redraft.revised_draft);
  return (
    <div>
      <div className="redraft-grid">
        <div>
          <h3>Original</h3>
          <div className="draft-view" aria-label="Original draft with deletions marked">
            {ops.map((op, i) =>
              op.type === "insert" ? null : op.type === "delete" ? <del key={i}>{op.text}</del> : <span key={i}>{op.text}</span>,
            )}
          </div>
        </div>
        <div>
          <h3>{redraft.retrospective ? "Model for a future statement" : "Revised"}</h3>
          <div className="draft-view" aria-label="Revised draft with additions marked">
            {ops.map((op, i) =>
              op.type === "delete" ? null : op.type === "insert" ? <ins key={i}>{op.text}</ins> : <span key={i}>{op.text}</span>,
            )}
          </div>
        </div>
      </div>
      <h3>Change log</h3>
      {redraft.change_log.length === 0 ? <p className="muted">No changes were made.</p> : null}
      <ol className="tight">
        {redraft.change_log.map((c, i) => (
          <li key={i}>
            {c.finding_id ? <span className="chip">{c.finding_id}</span> : <span className="chip">placeholder</span>}{" "}
            {c.original ? <><del>{c.original}</del> → </> : null}
            <ins>{c.revised}</ins>
            <div className="muted small">{c.reason}</div>
          </li>
        ))}
      </ol>
      <h3>Placeholders to fill</h3>
      {redraft.placeholders.length === 0 ? (
        <p className="muted">None. Every change uses facts already in the draft or context.</p>
      ) : (
        <ul className="tight">
          {redraft.placeholders.map((p) => (
            <li key={p}><code>{p}</code></li>
          ))}
        </ul>
      )}
      <p className="muted small">Revised by {redraft.provider.provider} ({redraft.provider.model}). Review every change and fill each placeholder before use.</p>
    </div>
  );
}
