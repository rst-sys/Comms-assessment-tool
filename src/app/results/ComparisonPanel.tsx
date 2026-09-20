import type { ComparisonResult, Verdict } from "../../engine/compare.js";
import type { SavedReview } from "../../engine/savedReview.js";

const VERDICT_CLASS: Record<Verdict, string> = {
  Resolved: "verdict-resolved",
  "Partly addressed": "verdict-partly",
  "Still open": "verdict-open",
  "No longer applicable": "verdict-moot",
};

const ORDER: Verdict[] = ["Still open", "Partly addressed", "Resolved", "No longer applicable"];

interface Props {
  comparison: ComparisonResult;
  baseline: SavedReview;
}

/**
 * How this version compares with the saved review (revision 12). Findings
 * lead; the score movement follows, with a note that small changes mean
 * little.
 */
export function ComparisonPanel({ comparison, baseline }: Props) {
  const byId = new Map(baseline.findings.map((f) => [f.id, f]));
  const counts = ORDER.map((v) => [v, comparison.verdicts.filter((x) => x.verdict === v).length] as const).filter(([, n]) => n > 0);
  const delta = comparison.score_after - comparison.score_before;
  const sorted = [...comparison.verdicts].sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict));
  const moved = comparison.movements.filter((m) => m.after !== m.before).sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));

  return (
    <section className="card comparison" id="comparison" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Compared with your saved review</h2>
      <p className="muted small" style={{ marginTop: "-8px" }}>
        Saved {baseline.saved_at.slice(0, 10)} · {baseline.settings.communication_type}
      </p>

      {comparison.drift.length > 0 ? (
        <p className="warning" role="note">
          These two reviews are not like-for-like: {comparison.drift.join(", ").toLowerCase()} changed since the saved
          review. Treat the comparison as a guide only.
        </p>
      ) : null}

      <p className="prose comparison-summary">{comparison.summary}</p>

      <div className="verdict-counts">
        {counts.map(([verdict, n]) => (
          <span key={verdict} className={`chip ${VERDICT_CLASS[verdict]}`}>
            {n} {verdict.toLowerCase()}
          </span>
        ))}
        {comparison.new_concerns.length > 0 ? (
          <span className="chip verdict-new">{comparison.new_concerns.length} newly raised</span>
        ) : null}
      </div>

      <div className="label">Earlier findings</div>
      <ul className="verdict-list">
        {sorted.map((v) => {
          const f = byId.get(v.finding_id);
          return (
            <li key={v.finding_id} className="verdict-item">
              <span className={`chip ${VERDICT_CLASS[v.verdict]}`}>{v.verdict}</span>
              <div>
                <div>{f?.finding ?? v.finding_id}</div>
                <div className="muted small">{v.evidence}</div>
              </div>
            </li>
          );
        })}
        {sorted.length === 0 ? <li className="muted">The saved review raised no findings to check.</li> : null}
      </ul>

      {comparison.new_concerns.length > 0 ? (
        <p className="muted small">
          Newly raised in this version: {comparison.new_concerns.join(", ")}. They are in the findings below.
        </p>
      ) : null}

      <div className="label">Score</div>
      <p className="score-move">
        <span>{comparison.score_before}</span>
        <span aria-hidden="true" className="muted"> → </span>
        <span><strong>{comparison.score_after}</strong></span>
        <span className="muted"> ({delta > 0 ? `+${delta}` : delta}) · {comparison.band_after}</span>
      </p>
      <p className="muted small prose">
        A score can move a point or two between reviews of the same text, so read small changes lightly. What you closed
        matters more than the number.
      </p>
      {moved.length > 0 ? (
        <details className="settings-detail">
          <summary>Dimensions that moved ({moved.length})</summary>
          <ul className="tight">
            {moved.map((m) => (
              <li key={m.id}>
                {m.label}: {m.before.toFixed(1)} → {m.after.toFixed(1)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
