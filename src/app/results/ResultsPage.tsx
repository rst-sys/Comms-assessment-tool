import { useEffect } from "react";
import type { EvaluationResult } from "../../engine/evaluate.js";
import type { EvaluationRequest } from "../../engine/types.js";
import { AgencyScan } from "./AgencyScan.js";
import { DevilsAdvocate } from "./DevilsAdvocate.js";
import { EscalationChecklist } from "./EscalationChecklist.js";
import { ExecutiveSummary } from "./ExecutiveSummary.js";
import { FindingsRegister } from "./FindingsRegister.js";
import { Footer } from "./Footer.js";
import { Questions } from "./Questions.js";
import { Scorecard } from "./Scorecard.js";
import { TopFindings } from "./TopFindings.js";

interface Props {
  result: EvaluationResult;
  request: EvaluationRequest;
}

/**
 * The results page (PROMPT.md Section 9). Summary and top findings render
 * open; the remaining sections are collapsed disclosure panels. Printing
 * expands every panel and restores the previous state afterwards.
 */
export function ResultsPage({ result, request }: Props) {
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

  return (
    <main className="page">
      <ExecutiveSummary result={result} request={request} />
      {request.heightened_review ? <EscalationChecklist questions={a.questions_before_publication} /> : null}
      <TopFindings findings={a.findings} />
      <FindingsRegister findings={a.findings} />
      <Scorecard dimensions={a.dimensions} />
      <AgencyScan draft={request.draft} scan={a.agency_scan} />
      <DevilsAdvocate data={a.devils_advocate} />
      <Questions questions={a.questions_before_publication} />
      <Footer />
    </main>
  );
}
