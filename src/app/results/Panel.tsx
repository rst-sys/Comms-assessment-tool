import type { ReactNode } from "react";

interface PanelProps {
  id: string;
  title: string;
  note?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A collapsed section as a native disclosure element (Section 9 and 11). */
export function Panel({ id, title, note, defaultOpen = false, children }: PanelProps) {
  return (
    <details className="panel" id={id} open={defaultOpen}>
      <summary>
        <h2>{title}</h2>
        {note ? <span className="panel-note">{note}</span> : null}
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

/** Opens a panel by id and scrolls to it, for "one click from its rationale" links. */
export function openPanel(id: string, scrollTo?: string) {
  const el = document.getElementById(id);
  if (el instanceof HTMLDetailsElement) el.open = true;
  const target = scrollTo ? document.getElementById(scrollTo) : el;
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}
