export const CONFIDENTIALITY_NOTICE =
  "This prototype sends your draft to an external AI provider for analysis and stores nothing. Do not submit attorney-client privileged, material nonpublic, or regulated personal information unless your legal, privacy, and security teams have approved this provider and mode. Redaction is not available in this build.";

/** Shown once on first load, dismissable (Section 4). */
export function ConfidentialityNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="notice no-print" role="dialog" aria-labelledby="notice-heading" aria-modal="false">
      <div className="card notice-card">
        <h3 id="notice-heading" style={{ marginTop: 0 }}>Before you paste anything</h3>
        <p>{CONFIDENTIALITY_NOTICE}</p>
        <button type="button" className="primary" onClick={onDismiss} autoFocus>
          I understand
        </button>
      </div>
    </div>
  );
}
