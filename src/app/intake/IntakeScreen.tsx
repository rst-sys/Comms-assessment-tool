import { useState, type ReactNode } from "react";
import type { SavedReview } from "../../engine/savedReview.js";
import { type EvaluationRequest, type AudienceDocument } from "../../engine/types.js";
import {
  AudienceQuestion,
  EventQuestion,
  FormatQuestion,
  LocationQuestion,
  OrganizationQuestion,
  PurposeQuestion,
  SituationQuestion,
} from "./Questions.js";
import { AudienceDocuments } from "./AudienceDocuments.js";
import { FEATURES } from "../features.js";
import { Progress } from "../Progress.js";
import { PrivacyPanel, type PrivacyConfig } from "../PrivacyPanel.js";
import {
  canEvaluate,
  EARLIER_STATEMENT_HINT,
  EMPTY_INTAKE,
  HIGH_RISK_WARNING,
  intakeComplete,
  intakeFields,
  intakeFromRequest,
  MAX_WORDS,
  MIN_WORDS,
  missingAnswers,
  SHORT_DRAFT_WARNING,
  showShortDraftWarning,
  showTooShortWarning,
  TOO_SHORT_WARNING,
  showEarlierStatementHint,
  showHighRiskWarning,
  wordCount,
  type IntakeState,
  type EvaluationFailure,
} from "./rules.js";

interface Props {
  config: PrivacyConfig | null;
  busy: boolean;
  error: EvaluationFailure | null;
  onEvaluate: (request: EvaluationRequest) => void;
  /** Settings and context to load on first render (a previous review's, or a saved review's settings). */
  initialRequest?: EvaluationRequest;
  /** Whether initialRequest is the settings and context carried over from the last review. */
  carriedOver?: boolean;
  /** A saved review this draft will be compared against. */
  baseline?: SavedReview | null;
  /** Whether the hosted web search for public context is available. */
  publicSearch?: boolean;
}

/**
 * The Review screen: three steps down one column.
 *
 * Step 1 is who the organization is, step 2 is six dropdowns about the
 * situation, step 3 is the draft. The six were panels of radio buttons and
 * the screen was five of them tall; the options and their grouping have not
 * changed, only where they live until they are needed.
 *
 * The thirteen labelled context fields are gone. One optional box under the
 * draft carries the same ground truth: almost nobody filled more than two of
 * the thirteen, and the rest went to the engine as twelve lines of "(not
 * supplied)" on every review.
 *
 * All state lives in this component; nothing is written to storage, the URL
 * or the page title.
 */
export function IntakeScreen({ config, busy, error, onEvaluate, initialRequest, carriedOver = false, baseline = null, publicSearch = true }: Props) {
  const init = initialRequest;
  const [draft, setDraft] = useState(init?.draft ?? "");
  const [intake, setIntake] = useState<IntakeState>(init ? intakeFromRequest(init) : EMPTY_INTAKE);
  // Smart defaults stop as soon as the user has an opinion: the format
  // pre-selects an audience and a holding statement pre-selects "Still
  // unfolding", but neither may overwrite a choice already made. The old
  // heightened-review tick-box set itself and never cleared, which is the
  // bug these two flags exist to prevent.
  const [audiencesTouched, setAudiencesTouched] = useState(Boolean(init));
  const [situationTouched, setSituationTouched] = useState(Boolean(init));
  const [context, setContext] = useState(init?.context ?? "");
  const [documents, setDocuments] = useState<AudienceDocument[]>(init?.audience_documents ?? []);

  const words = wordCount(draft);
  const ready = canEvaluate(draft, intake) && !busy;
  const missing = missingAnswers(intake);

  /**
   * Scrolls to the step that still needs an answer. The disabled button used
   * to be the only signal and the list of names only helps if you can find
   * them; on a three-step page the step is the useful unit, not the field.
   */
  const jumpToFirstMissing = () => {
    const step = intakeComplete(intake) ? "step-draft" : intake.organization_type === "" || intake.headquarters.trim() === "" ? "step-org" : "step-about";
    document.getElementById(step)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  const submit = () => {
    if (!intakeComplete(intake) || !ready) return;
    onEvaluate({
      draft: draft.trim(),
      ...intakeFields(intake),
      context: context.trim(),
      already_published: false,
      ...(documents.length > 0 ? { audience_documents: documents } : {}),
    });
  };

  return (
    <main className="page intake">
      <header className="page-head">
        <div>
          <h1>Start a review</h1>
          <p className="prose">Three steps. Tell us who you are, describe the situation, then paste your draft.</p>
        </div>
      </header>

      {carriedOver && !baseline ? (
        <div className="card baseline-banner" role="note">
          <div className="label">Carried over from your last review</div>
          <p style={{ margin: 0 }}>
            Your answers in steps 1 and 2, and anything you wrote in <em>Anything else we should know?</em>, are the same
            as last time. Your draft is still in step 3 — edit it, or paste a new version over it, then evaluate again.
            Use <em>Discard and start over</em> on a results page to clear everything instead.
          </p>
        </div>
      ) : null}

      {baseline ? (
        <div className="card baseline-banner" role="note">
          <div className="label">Comparing with a saved review</div>
          <p style={{ margin: 0 }}>
            Saved {baseline.saved_at.slice(0, 10)} · score <strong>{baseline.score}</strong> of 100 ·{" "}
            {baseline.findings.length} finding{baseline.findings.length === 1 ? "" : "s"}. The settings below were restored
            from it. Add the new version of your draft, then evaluate.
          </p>
          {baseline.documents.length > 0 ? (
            <p className="muted small" style={{ margin: "8px 0 0" }}>
              Re-attach these for a like-for-like comparison: {baseline.documents.map((d) => d.title).join(", ")}.
            </p>
          ) : null}
        </div>
      ) : null}

      <Step n={1} id="step-org" title="Before you start" hint="Tell us about the organization you communicate for.">
        <OrganizationQuestion state={intake} onChange={setIntake} />
      </Step>

      <Step n={2} id="step-about" title="About this message" hint="Six questions. Your answers decide which standards apply.">
        <div className="menu-grid">
          <EventQuestion state={intake} onChange={setIntake} />
          <FormatQuestion
            state={intake}
            onChange={setIntake}
            audiencesTouched={audiencesTouched}
            situationTouched={situationTouched}
          />
          <AudienceQuestion state={intake} onChange={setIntake} onTouch={() => setAudiencesTouched(true)} />
          <SituationQuestion state={intake} onChange={setIntake} onTouch={() => setSituationTouched(true)} />
          <LocationQuestion state={intake} onChange={setIntake} />
          <PurposeQuestion state={intake} onChange={setIntake} />
        </div>
      </Step>

      <Step
        n={3}
        id="step-draft"
        title="Your draft"
        hint={`Paste the text of your draft. ${MIN_WORDS} to ${MAX_WORDS.toLocaleString()} words.`}
      >
        <textarea
          id="draft-text"
          aria-label="Draft text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={16}
          placeholder="Paste the draft message here."
        />
        <div className="muted small word-count" aria-live="polite">
          {words} {words === 1 ? "word" : "words"} · {MIN_WORDS}–{MAX_WORDS.toLocaleString()}
        </div>
        {showShortDraftWarning(draft) ? (
          <p className="warning short-draft" role="note">{SHORT_DRAFT_WARNING}</p>
        ) : null}

        <label className="field context-field">
          <span className="label">
            Anything else we should know? <span className="label-optional">(optional)</span>
          </span>
          <span className="muted small">
            Facts, constraints or background the draft doesn't show. What you write here is treated as fact; the draft is
            treated as claims.
          </span>
          {showEarlierStatementHint(intake.situation) ? (
            <span className="muted small earlier-statement-hint">{EARLIER_STATEMENT_HINT}</span>
          ) : null}
          <textarea
            rows={4}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="For example: what's confirmed so far, what can't be disclosed and why, the planned publication date."
          />
        </label>

        {FEATURES.audienceDocuments ? (
          <AudienceDocuments documents={documents} onChange={setDocuments} publicSearch={publicSearch && FEATURES.publicContextSearch} />
        ) : null}
      </Step>

      {showHighRiskWarning(intake.communication_event, intake.locations) ? (
        <p className="warning" role="note">{HIGH_RISK_WARNING}</p>
      ) : null}
      {error ? (
        <div role="alert">
          <p className="error" style={{ marginBottom: 4 }}>{error.message}</p>
          <p className="muted small" style={{ margin: 0 }}>
            Stopped after {error.seconds} second{error.seconds === 1 ? "" : "s"}
            {error.requestId ? <> · reference number <code>{error.requestId}</code></> : null}
            {error.requestId ? " · quote it if you report this" : null}
          </p>
        </div>
      ) : null}

      <div className="evaluate-row">
        <button type="button" className="primary" onClick={submit} disabled={!ready} aria-disabled={!ready}>
          {busy ? "Evaluating…" : baseline ? "Evaluate and compare" : "Evaluate draft"}
          {busy || baseline ? null : <span aria-hidden="true" className="button-arrow">→</span>}
        </button>
        {showTooShortWarning(draft) ? (
          <p className="muted small" aria-live="polite">{TOO_SHORT_WARNING}</p>
        ) : null}
        {missing.length > 0 ? (
          <p className="muted small" aria-live="polite">
            Still to answer: {missing.join(", ")}.{" "}
            <button type="button" className="linklike" onClick={jumpToFirstMissing}>Jump to the first one</button>
          </p>
        ) : null}
        {busy ? <Progress /> : null}
      </div>

      <PrivacyPanel config={config} />
    </main>
  );
}

/** One numbered step. The number is decoration; the heading carries the meaning. */
function Step({ n, id, title, hint, children }: { n: number; id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="card step" id={id} aria-labelledby={`${id}-heading`}>
      <div className="step-head">
        <span className="step-number" aria-hidden="true">{n}</span>
        <div>
          <h2 id={`${id}-heading`}>{title}</h2>
          <p className="muted small step-hint">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
