export interface PrivacyConfig {
  provider: string;
  model: string;
  processing_mode: string;
  training_term: string;
  /** Hosted deployments ask for a shared password before any paid call (revision 15). */
  gate_enabled?: boolean;
  signed_in?: boolean;
  daily_limit_per_visitor?: number;
  daily_limit_total?: number;
}

/**
 * Privacy panel (Section 4). Shows only what the code enforces; the provider
 * and model come from config, never from the UI. Rendered on intake and on
 * every results page.
 */
export function PrivacyPanel({ config }: { config: PrivacyConfig | null }) {
  const rows: [string, string][] = [
    ["Processing mode", config?.processing_mode ?? "Reading configuration…"],
    ["Provider and model", config ? `${config.provider} · ${config.model}` : "Reading configuration…"],
    ["Retention", "Sent for this analysis only. Not stored by this app."],
    ["Training", config?.training_term ?? "Reading configuration…"],
    ["Storage", "Nothing is saved. Closing this tab discards everything."],
    ["Classification", "Confidential"],
  ];
  return (
    <aside className="card privacy-panel" aria-labelledby="privacy-heading">
      <h3 id="privacy-heading" className="privacy-heading">
        <svg width="13" height="15" viewBox="0 0 13 15" aria-hidden="true" focusable="false">
          <path d="M3 6V4a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="1" y="6" width="11" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Privacy
      </h3>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="privacy-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="muted small" style={{ margin: 0 }}>
        Enterprise controls — customer-controlled processing, redaction, retention policies, data residency, and audit logging — are planned and not in this build.
      </p>
    </aside>
  );
}
