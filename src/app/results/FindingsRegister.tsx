import { useState } from "react";
import { DIMENSION_LABELS } from "../../engine/scoring.js";
import type { Finding } from "../../engine/types.js";
import {
  FINDING_STATUSES,
  matchesFilters,
  REGISTER_FILTERS,
  sortFindings,
  type FindingStatus,
  type RegisterFilter,
  type RegisterSort,
} from "./model.js";
import { Panel } from "./Panel.js";
import { SeverityMarker } from "./SeverityMarker.js";

export function FindingsRegister({ findings }: { findings: Finding[] }) {
  const [active, setActive] = useState<Set<RegisterFilter>>(new Set());
  const [sort, setSort] = useState<RegisterSort>({ key: "severity", direction: "asc" });
  // Status is held in component state only and is never persisted (Section 9).
  const [status, setStatus] = useState<Record<string, FindingStatus>>({});

  const toggle = (filter: RegisterFilter) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };
  const sortBy = (key: RegisterSort["key"]) => {
    setSort((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  };
  const rows = sortFindings(findings.filter((f) => matchesFilters(f, active)), sort);
  const arrow = (key: RegisterSort["key"]) => (sort.key === key ? (sort.direction === "asc" ? " ▲" : " ▼") : "");

  return (
    <Panel id="findings-register" title="All findings" note={`${findings.length} total`}>
      <div className="filter-row no-print" role="group" aria-label="Filter findings">
        {REGISTER_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip chip-button ${active.has(f) ? "chip-active" : ""}`}
            aria-pressed={active.has(f)}
            onClick={() => toggle(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="register-wrap">
        <table className="register">
          <thead>
            <tr>
              <th scope="col">
                <button type="button" onClick={() => sortBy("severity")} aria-label="Sort by severity">
                  Severity{arrow("severity")}
                </button>
              </th>
              <th scope="col">
                <button type="button" onClick={() => sortBy("dimension")} aria-label="Sort by dimension">
                  Dimension{arrow("dimension")}
                </button>
              </th>
              <th scope="col">Excerpt or omission</th>
              <th scope="col">Finding</th>
              <th scope="col">What to add or clarify</th>
              <th scope="col">Fact validation</th>
              <th scope="col">Specialist review</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} id={`register-${f.id}`}>
                <td><SeverityMarker severity={f.severity} /><div className="muted">{f.id}</div></td>
                <td>{DIMENSION_LABELS[f.dimension]}</td>
                <td>{f.excerpt !== null ? <q>{f.excerpt}</q> : <span className="omission">{f.omission}</span>}</td>
                <td>{f.finding}</td>
                <td>{f.recommended_action}</td>
                <td>{f.fact_validation_needed ? "Needed" : "—"}</td>
                <td>{f.specialist_review_needed ? f.specialist_review_type ?? "Needed" : "—"}</td>
                <td>
                  <select
                    className="no-print"
                    aria-label={`Status of ${f.id}`}
                    value={status[f.id] ?? "Open"}
                    onChange={(e) => setStatus((prev) => ({ ...prev, [f.id]: e.target.value as FindingStatus }))}
                  >
                    {FINDING_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="print-only" hidden>{status[f.id] ?? "Open"}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="muted">No findings match the active filters.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
