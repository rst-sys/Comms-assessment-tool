import type { Finding } from "../../engine/types.js";
import { FindingCard } from "./FindingCard.js";
import { topFindings } from "./model.js";
import { openPanel } from "./Panel.js";

export function TopFindings({ findings }: { findings: Finding[] }) {
  const top = topFindings(findings);
  return (
    <section id="top-findings" aria-labelledby="top-findings-heading">
      <h2 id="top-findings-heading">Top findings</h2>
      {top.length === 0 ? <p className="muted">No findings were raised.</p> : null}
      <div className="finding-list">
        {top.map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
      </div>
      {findings.length > top.length ? (
        <p className="no-print">
          <a
            href="#findings-register"
            onClick={(e) => {
              e.preventDefault();
              openPanel("findings-register");
            }}
          >
            Show all findings ({findings.length})
          </a>
        </p>
      ) : null}
    </section>
  );
}
