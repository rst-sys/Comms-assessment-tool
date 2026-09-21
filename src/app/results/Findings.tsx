import { useState } from "react";
import type { Finding } from "../../engine/types.js";
import { FindingCard } from "./FindingCard.js";
import { matchesFilters, REGISTER_FILTERS, sortFindings, type RegisterFilter } from "./model.js";

/**
 * The findings (revision 21).
 *
 * No text from the draft appears in this section. The owner reviewed a real
 * report and found the quotations inconsistent — some findings had them, some
 * did not — and heavy where they appeared. The agency and abstraction scan
 * still runs and still shapes what the engine finds and how it scores; its
 * flagged phrases are simply not printed back at a reader who wrote the draft.
 *
 * The per-finding status dropdown is gone too, on the same instruction.
 */
export function Findings({ findings }: { findings: Finding[] }) {
  const [active, setActive] = useState<Set<RegisterFilter>>(new Set());

  const rows = sortFindings(findings.filter((f) => matchesFilters(f, active)), { key: "severity", direction: "asc" });

  return (
    <section id="findings" aria-labelledby="findings-heading">
      <h2 id="findings-heading">
        Findings <span className="muted">({findings.length})</span>
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>Most serious first.</p>

      <div className="filter-row no-print" role="group" aria-label="Filter findings">
        {REGISTER_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip chip-button ${active.has(f) ? "chip-active" : ""}`}
            aria-pressed={active.has(f)}
            onClick={() =>
              setActive((prev) => {
                const next = new Set(prev);
                if (next.has(f)) next.delete(f);
                else next.add(f);
                return next;
              })
            }
          >
            {f}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">
          {findings.length === 0 ? "No findings were raised." : "No findings match the active filters."}
        </p>
      ) : null}

      <div className="finding-list">
        {rows.map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
      </div>
    </section>
  );
}
