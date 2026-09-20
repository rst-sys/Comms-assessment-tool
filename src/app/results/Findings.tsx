import { useState } from "react";
import { SCAN_CATEGORIES, type AgencyScanItem, type Finding, type ScanCategory } from "../../engine/types.js";
import { FindingCard } from "./FindingCard.js";
import {
  FINDING_STATUSES,
  matchesFilters,
  phrasesByFinding,
  REGISTER_FILTERS,
  SCAN_CATEGORY_CLASS,
  sortFindings,
  unlinkedPhrases,
  type FindingStatus,
  type RegisterFilter,
} from "./model.js";
import { SeverityMarker } from "./SeverityMarker.js";

interface Props {
  findings: Finding[];
  scan: AgencyScanItem[];
}

/**
 * Findings and the agency scan, as one section (revision 19).
 *
 * They used to be two panels saying related things in different places: a
 * findings register, and a scan that reprinted the whole draft with phrases
 * highlighted. The owner found that hard to digest, and the reprinted draft in
 * particular earned nothing — the reader wrote it.
 *
 * So: one list of findings, most serious first, each carrying the flagged
 * language it rests on. Phrases the engine did not tie to a finding are not
 * dropped; they gather at the end, where they can still be read.
 */
export function Findings({ findings, scan }: Props) {
  const [active, setActive] = useState<Set<RegisterFilter>>(new Set());
  const [hiddenCategories, setHiddenCategories] = useState<Set<ScanCategory>>(new Set());
  // Status is held in component state only and is never persisted (Section 9).
  const [status, setStatus] = useState<Record<string, FindingStatus>>({});

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const visibleScan = scan.filter((s) => !hiddenCategories.has(s.category));
  const byFinding = phrasesByFinding(visibleScan);
  const rows = sortFindings(findings.filter((f) => matchesFilters(f, active)), { key: "severity", direction: "asc" });
  const loose = unlinkedPhrases(visibleScan, findings);

  return (
    <section id="findings" aria-labelledby="findings-heading">
      <h2 id="findings-heading">
        Findings <span className="muted">({findings.length})</span>
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Most serious first. Where the draft's own wording causes a finding, the phrase is shown beneath it.
      </p>

      <div className="filter-row no-print" role="group" aria-label="Filter findings">
        {REGISTER_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip chip-button ${active.has(f) ? "chip-active" : ""}`}
            aria-pressed={active.has(f)}
            onClick={() => setActive((prev) => toggle(prev, f))}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="legend no-print" role="group" aria-label="Show or hide flagged language categories">
        {SCAN_CATEGORIES.map((c) => (
          <label key={c}>
            <input
              type="checkbox"
              checked={!hiddenCategories.has(c)}
              onChange={() => setHiddenCategories((prev) => toggle(prev, c))}
            />
            <span className={`swatch ${SCAN_CATEGORY_CLASS[c]}`} aria-hidden="true" />
            {c}
          </label>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">{findings.length === 0 ? "No findings were raised." : "No findings match the active filters."}</p>
      ) : null}

      <div className="finding-list">
        {rows.map((f) => (
          <div key={f.id}>
            <FindingCard finding={f} phrases={byFinding.get(f.id) ?? []} />
            <label className="no-print finding-status">
              <span className="label">Status</span>
              <select
                aria-label={`Status of ${f.id}`}
                value={status[f.id] ?? "Open"}
                onChange={(e) => setStatus((prev) => ({ ...prev, [f.id]: e.target.value as FindingStatus }))}
              >
                {FINDING_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      <h3>All flagged phrases {visibleScan.length > 0 ? <span className="muted">({visibleScan.length})</span> : null}</h3>
      {visibleScan.length === 0 ? (
        <p className="muted">No phrases flagged.</p>
      ) : (
        <ul className="tight">
          {visibleScan.map((s, i) => (
            <li key={i}>
              <span className={`hl ${SCAN_CATEGORY_CLASS[s.category]}`}>“{s.phrase}”</span>{" "}
              <span className="muted">
                {s.category} · <SeverityMarker severity={s.severity} /> · {s.assessment}
                {s.finding_id ? ` · ${s.finding_id}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {loose.length > 0 ? (
        <p className="muted small">
          {loose.length} of these {loose.length === 1 ? "is" : "are"} not tied to a finding above.
        </p>
      ) : null}
    </section>
  );
}
