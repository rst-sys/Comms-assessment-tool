export interface PrivacyConfig {
  provider: string;
  model: string;
  processing_mode: string;
  training_term: string;
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
    ["Retention", "Draft text and any supporting documents are sent to the provider for this analysis only and are not stored by this app."],
    ["Training", config?.training_term ?? "Reading configuration…"],
    ["Storage", "Nothing is saved. Closing this tab discards the draft and results."],
    ["Classification", "Confidential"],
  ];
  return (
    <aside className="card privacy-panel" aria-labelledby="privacy-heading">
      <h3 id="privacy-heading" style={{ marginTop: 0 }}>Privacy</h3>
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
