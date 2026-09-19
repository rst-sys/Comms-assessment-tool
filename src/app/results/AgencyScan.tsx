import { useState } from "react";
import { SCAN_CATEGORIES, type AgencyScanItem, type ScanCategory } from "../../engine/types.js";
import { highlightSegments, SCAN_CATEGORY_CLASS } from "./model.js";
import { openPanel, Panel } from "./Panel.js";
import { SeverityMarker } from "./SeverityMarker.js";

interface Props {
  draft: string;
  scan: AgencyScanItem[];
}

export function AgencyScan({ draft, scan }: Props) {
  const [hidden, setHidden] = useState<Set<ScanCategory>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const segments = highlightSegments(draft, scan);
  const item = selected !== null ? scan[selected] : undefined;

  const toggleCategory = (c: ScanCategory) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  return (
    <Panel id="agency-scan" title="Agency and abstraction scan" note={`${scan.length} flagged phrase${scan.length === 1 ? "" : "s"}`}>
      <p className="muted" style={{ marginTop: 0 }}>
        Language that lets decision-making responsibility disappear into abstractions. Click a highlight for the assessment.
      </p>
      <div className="legend no-print" role="group" aria-label="Show or hide categories">
        {SCAN_CATEGORIES.map((c) => (
          <label key={c}>
            <input type="checkbox" checked={!hidden.has(c)} onChange={() => toggleCategory(c)} />
            <span className={`swatch ${SCAN_CATEGORY_CLASS[c]}`} aria-hidden="true" />
            {c}
          </label>
        ))}
      </div>
      <div className="draft-view" lang="en">
        {segments.map((seg, i) => {
          const s = seg.scanIndex !== null ? scan[seg.scanIndex] : undefined;
          if (!s || hidden.has(s.category)) return <span key={i}>{seg.text}</span>;
          return (
            <button
              key={i}
              type="button"
              className={`hl ${SCAN_CATEGORY_CLASS[s.category]} ${selected === seg.scanIndex ? "hl-selected" : ""}`}
              aria-label={`${s.category}: ${seg.text}`}
              aria-pressed={selected === seg.scanIndex}
              onClick={() => setSelected(seg.scanIndex)}
            >
              {seg.text}
            </button>
          );
        })}
      </div>
      {item ? <ScanCard item={item} /> : null}
      <h3>All flagged phrases</h3>
      <ul className="tight">
        {scan.map((s, i) =>
          hidden.has(s.category) ? null : (
            <li key={i}>
              <button type="button" className="hl" onClick={() => setSelected(i)} aria-label={`${s.category}: ${s.phrase}`}>
                “{s.phrase}”
              </button>{" "}
              <span className="muted">{s.category} · {s.severity} · {s.assessment}</span>
            </li>
          ),
        )}
      </ul>
    </Panel>
  );
}

function ScanCard({ item }: { item: AgencyScanItem }) {
  return (
    <div className="card scan-card" style={{ marginTop: 12 }} role="region" aria-label={`Assessment of “${item.phrase}”`}>
      <dl>
        <dt>Phrase</dt><dd>“{item.phrase}”</dd>
        <dt>Category</dt><dd>{item.category}</dd>
        <dt>Severity</dt><dd><SeverityMarker severity={item.severity} /></dd>
        <dt>Assessment</dt><dd>{item.assessment}</dd>
        <dt>Why</dt><dd>{item.why}</dd>
        <dt>What would make it credible</dt><dd>{item.what_would_make_it_credible}</dd>
        <dt>Suggested edit</dt><dd>{item.suggested_edit}</dd>
        <dt>Related finding</dt>
        <dd>
          {item.finding_id ? (
            <a
              href={`#finding-${item.finding_id}`}
              onClick={(e) => {
                e.preventDefault();
                const inTop = document.getElementById(`finding-${item.finding_id}`);
                if (inTop) inTop.scrollIntoView({ behavior: "smooth", block: "start" });
                else openPanel("findings-register", `register-${item.finding_id}`);
              }}
            >
              {item.finding_id}
            </a>
          ) : (
            "none"
          )}
        </dd>
      </dl>
    </div>
  );
}
