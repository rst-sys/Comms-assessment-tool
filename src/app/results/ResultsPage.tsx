import { useEffect, useState } from "react";
import type { ComparisonResult } from "../../engine/compare.js";
import { buildSavedReview, savedReviewFilename, type SavedReview } from "../../engine/savedReview.js";
import { ApiError, saveFile } from "../api.js";
import { ComparisonPanel } from "./ComparisonPanel.js";
import { Findings } from "./Findings.js";
import { COMING_SOON, FEATURES } from "../features.js";
import { buildReviewPdf, reviewPdfFilename } from "./pdf.js";
import type { EvaluationResult } from "../../engine/evaluate.js";
import type { EvaluationRequest } from "../../engine/types.js";
import { PrivacyPanel, type PrivacyConfig } from "../PrivacyPanel.js";
import { DevilsAdvocate } from "./DevilsAdvocate.js";
import { EscalationChecklist } from "./EscalationChecklist.js";
import { ExecutiveSummary } from "./ExecutiveSummary.js";
import { Footer } from "./Footer.js";
import { ProtocolPanel } from "./ProtocolPanel.js";
import { Questions } from "./Questions.js";

interface Props {
  result: EvaluationResult;
  request: EvaluationRequest;
  /** Provider and model for the privacy panel; null while loading. */
  config?: PrivacyConfig | null;
  /** Clears all state and returns to a blank intake (Section 4). */
  onDiscard?: () => void;
  /** The saved review this one was compared against, when there is one. */
  baseline?: SavedReview | null;
  comparison?: ComparisonResult | null;
  comparisonError?: string | null;
}

/**
 * The results page (PROMPT.md Section 9). Summary and top findings render
 * open; the remaining sections are collapsed disclosure panels. Printing
 * expands every panel and restores the previous state afterwards.
 */
export function ResultsPage({ result, request, config = null, onDiscard, baseline = null, comparison = null, comparisonError = null }: Props) {
  const a = result.analysis;

  useEffect(() => {
    let previous: HTMLDetailsElement[] = [];
    const before = () => {
      previous = Array.from(document.querySelectorAll("details")).filter((d) => !d.open);
      for (const d of previous) d.open = true;
    };
    const after = () => {
      for (const d of previous) d.open = false;
      previous = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [includeExcerpts, setIncludeExcerpts] = useState(true);

  const saveReview = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const saved = buildSavedReview(result, request, { includeExcerpts });
      const blob = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" });
      await saveFile(savedReviewFilename(saved), blob);
      setSaveStatus("Review saved. Open it later in Compare revisions.");
    } catch (e) {
      setSaveStatus(e instanceof ApiError ? e.message : "The review could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  const savePdf = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const doc = buildReviewPdf(result, request);
      const blob = doc.output("blob");
      await saveFile(reviewPdfFilename(request), blob);
      setSaveStatus("PDF saved.");
    } catch (e) {
      setSaveStatus(e instanceof ApiError ? e.message : "The PDF could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page results">
      <div className="no-print results-actions">
        <button type="button" onClick={savePdf} disabled={saving}>{saving ? "Working…" : "Save as PDF"}</button>
        {FEATURES.saveReview ? (
          <button type="button" onClick={saveReview} disabled={saving}>Save this review</button>
        ) : (
          <button type="button" disabled title={COMING_SOON}>Save this review (coming soon)</button>
        )}
        <label className="checkbox save-option" hidden={!FEATURES.saveReview}>
          <input type="checkbox" checked={includeExcerpts} onChange={(e) => setIncludeExcerpts(e.target.checked)} />
          Keep quoted passages in the saved review
        </label>
        {onDiscard ? <button type="button" onClick={onDiscard}>Discard and start over</button> : null}
        {saveStatus ? <span className="status" role="status">{saveStatus}</span> : null}
      </div>
      <p className="no-print muted small prose save-note">
        A saved review holds the score, the findings and your settings, not your draft and not the contents of any
        documents you attached. The findings themselves quote short passages of your draft; unticking the box above leaves
        out the pulled-out quotations, but the written findings may still mention a phrase.
      </p>
      {comparisonError ? <p className="error" role="alert">{comparisonError}</p> : null}
      {comparison && baseline ? <ComparisonPanel comparison={comparison} baseline={baseline} protocol={a.protocol_review} /> : null}
      <div className="results-grid">
        <ExecutiveSummary result={result} request={request} />
        <PrivacyPanel config={config} />
      </div>
      {request.heightened_review ? <EscalationChecklist questions={a.questions_before_publication} /> : null}
      {a.protocol_review && a.protocol_review.elements.length > 0 ? <ProtocolPanel review={a.protocol_review} /> : null}
      <Findings findings={a.findings} scan={a.agency_scan} />
      <DevilsAdvocate data={a.devils_advocate} />
      <Questions questions={a.questions_before_publication} />
      <Footer />
    </main>
  );
}
