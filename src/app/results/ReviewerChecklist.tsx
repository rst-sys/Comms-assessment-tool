import { useState } from "react";
import { CHECKLIST_INTRO, CHECKLIST_TITLE, checklistSize, type ChecklistGroup } from "../../engine/checklist.js";
import { Panel } from "./Panel.js";

/**
 * The protocols' own questions, shown rather than sent to the model.
 *
 * Fixed text for the situation the intake describes, so it is the same on
 * every run of the same answers — which the model's selection was not, because
 * it was choosing eight from as many as twenty-two. Grouped by the reviewer
 * who has to answer each one, so it can be forwarded rather than read through.
 *
 * Collapsed by group: nine groups open at once is the wall the results page
 * was redesigned to get rid of. The counts are on the summaries, so a reader
 * can see where the weight is without opening anything.
 */
export function ReviewerChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const [copied, setCopied] = useState(false);
  const total = checklistSize(groups);
  if (total === 0) return null;

  const asText = () =>
    groups
      .map((g) => `${g.name} (${g.questions.length})\n` + g.questions.map((q) => `  - ${q.ask}${q.also.length ? `  [also ${q.also.join(", ")}]` : ""}`).join("\n"))
      .join("\n\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel id="reviewer-checklist" title={CHECKLIST_TITLE} note={`${total}`}>
      <p className="muted prose" style={{ marginTop: 0 }}>{CHECKLIST_INTRO}</p>
      {groups.map((group) => (
        <details className="checklist-group" key={group.name}>
          <summary>
            <span className="checklist-group-name">{group.name}</span>
            <span className="panel-note">{group.questions.length}</span>
          </summary>
          <ul className="tight">
            {group.questions.map((q) => (
              <li key={`${q.protocol}:${q.ask}`}>
                {q.ask}
                {q.also.map((t) => (
                  <span key={t} className="chip question-tag">{t}</span>
                ))}
              </li>
            ))}
          </ul>
        </details>
      ))}
      <p className="no-print">
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy checklist"}</button>
      </p>
    </Panel>
  );
}
