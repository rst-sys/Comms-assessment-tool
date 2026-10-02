import type { Severity } from "../../engine/types.js";

/** Severity shown by a small filled square and a text label, never by color alone. */
export function SeverityMarker({ severity }: { severity: Severity }) {
  return (
    <span className={`sev sev-${severity.toLowerCase()}`}>
      <span className="sev-square" aria-hidden="true" />
      {severity}
    </span>
  );
}
