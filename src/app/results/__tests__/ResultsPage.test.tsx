// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { CONTROL, DEMO_1 } from "../../../engine/fixtures.js";
import { CORE_PRINCIPLE, REPORTER_QUESTION } from "../../copy.js";
import { ResultsPage } from "../ResultsPage.js";
import { APOLOGY_PROTOCOL } from "../../../engine/protocols.js";
import { ceilingWithoutContext } from "../../../engine/scoring.js";

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"));
  if (!file) throw new Error(`no captured result for ${prefix}`);
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

afterEach(cleanup);

describe("ResultsPage with the captured Demo 1 analysis", () => {
  const result = load("demo1");

  it("renders the executive summary with score, band, confidence label and readiness", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.getByRole("link", { name: /Score 13 out of 100/ })).toBeTruthy();
    expect(screen.getByText(result.band)).toBeTruthy();
    expect(screen.getByText(result.confidence_label)).toBeTruthy();
    expect(screen.getByText("Communications readiness")).toBeTruthy();
    expect(screen.getByText("Do not issue until material gaps are resolved")).toBeTruthy();
    expect(screen.queryByText(/\bApproval\b|\bCleared\b/)).toBeNull();
  });

  it("shows specialist review chips beside readiness", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const chips = screen.getByLabelText("Specialist review required");
    expect(within(chips).getByText("HR")).toBeTruthy();
    expect(within(chips).getByText("Labor")).toBeTruthy();
  });

  it("shows every finding in one merged section, most serious first", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const section = screen.getByRole("region", { name: /^Findings/ });
    // All eleven, not a top-five with a link to a separate register.
    expect(within(section).getAllByRole("article")).toHaveLength(11);
    expect(screen.queryByText(/Show all findings/)).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("prints no text from the draft anywhere in the findings", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const section = screen.getByRole("region", { name: /^Findings/ });
    // The quotation, the nested phrases and the flagged-phrase list are all gone.
    expect(within(section).queryByText("Language in the draft that causes this")).toBeNull();
    expect(within(section).queryByText(/All flagged phrases/)).toBeNull();
    expect(section.querySelector("blockquote")).toBeNull();
    expect(document.querySelector(".draft-view")).toBeNull();

    // The engine still produced quotations; the page simply never shows them.
    const quoted = result.analysis.findings.find((f) => f.excerpt !== null);
    expect(quoted, "fixture should contain a quoting finding").toBeTruthy();
    expect(section.textContent).not.toContain(quoted!.excerpt);
  });

  it("renames the fix label and drops the status dropdowns", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const section = screen.getByRole("region", { name: /^Findings/ });
    expect(within(section).getAllByText("Ways to fix this").length).toBeGreaterThan(0);
    expect(within(section).queryByText("Ways this could be rectified")).toBeNull();
    expect(within(section).queryAllByRole("combobox")).toHaveLength(0);
  });

  it("still filters the findings", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const section = screen.getByRole("region", { name: /^Findings/ });
    expect(within(section).getAllByRole("article")).toHaveLength(11);
    fireEvent.click(screen.getByRole("button", { name: "High only" }));
    expect(within(section).getAllByRole("article")).toHaveLength(8);
  });

  it("shows one merged question section, with review functions tagged in place", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    // The separate specialist checklist is gone: it was these same questions.
    expect(screen.queryByText("Questions for subject matter reviewers")).toBeNull();
    expect(screen.getByText("Questions worth asking")).toBeTruthy();

    const panel = document.getElementById("questions")!;
    expect(panel.querySelectorAll("ol > li")).toHaveLength(result.analysis.questions_before_publication.length);
    const tags = panel.querySelectorAll(".question-tag");
    expect(tags.length).toBeGreaterThan(0);
    expect(screen.getByText(/name a review function\. Settle those before this is issued\./)).toBeTruthy();

    // No question appears twice anywhere on the page.
    const first = result.analysis.questions_before_publication[0]!;
    expect(document.body.textContent!.split(first).length - 1).toBe(1);
  });

  it("renders the remaining collapsed panels and the footer", () => {
    const { container } = render(<ResultsPage result={result} request={DEMO_1.request} />);
    const panels = Array.from(container.querySelectorAll("details.panel"));
    // The register, the scorecard and the scan are no longer panels of their own.
    expect(panels.map((p) => p.id)).toEqual(["devils-advocate", "questions"]);
    expect(panels.every((p) => !(p as HTMLDetailsElement).open)).toBe(true);
    expect(screen.getByText(CORE_PRINCIPLE)).toBeTruthy();
    expect(screen.getByText(/decision-support software/)).toBeTruthy();
  });

  it("shows the ten scorecard rows with rationale on expand", () => {
    const { container } = render(<ResultsPage result={result} request={DEMO_1.request} />);
    const rows = container.querySelectorAll("details.score-row");
    expect(rows).toHaveLength(10);
    const first = rows[0] as HTMLDetailsElement;
    expect(first.id).toBe("dimension-accountability_agency");
    expect(within(first).getByText(/What would raise this/)).toBeTruthy();
  });

});

describe("ResultsPage with the captured control analysis", () => {
  it("shows no highlights and no escalation checklist when heightened review is off", () => {
    render(<ResultsPage result={load("control")} request={CONTROL.request} />);
    expect(screen.queryByText(/All flagged phrases/)).toBeNull();
    expect(screen.getByRole("link", { name: /Score 83 out of 100/ })).toBeTruthy();
  });
});

describe("the protocol panel (revision 14)", () => {
  const result = load("demo1");

  function withProtocol(): EvaluationResult {
    return {
      ...result,
      analysis: {
        ...result.analysis,
        protocol_review: {
          protocol: APOLOGY_PROTOCOL.name,
          source: APOLOGY_PROTOCOL.source,
          elements: APOLOGY_PROTOCOL.elements.map((e, i) => ({
            name: e.name,
            status: (["Present", "Partial", "Absent"] as const)[i % 3]!,
            note: `Evidence for ${e.name}.`,
          })),
        },
      },
    };
  }

  it("lists every element with its status, the count present and the source", () => {
    render(<ResultsPage result={withProtocol()} request={DEMO_1.request} />);
    // The panel is a native <details>; its contents are in the DOM either way.
    expect(screen.getByRole("heading", { name: APOLOGY_PROTOCOL.name })).toBeTruthy();
    for (const element of APOLOGY_PROTOCOL.elements) {
      expect(screen.getByText(element.name)).toBeTruthy();
      expect(screen.getByText(`Evidence for ${element.name}.`)).toBeTruthy();
    }
    // Two of the six were marked Present by the rotation above.
    expect(screen.getByText(/2 of 6 present/)).toBeTruthy();
    expect(screen.getByText(/Lewicki/)).toBeTruthy();
    expect(screen.getByText(/not a separate score/)).toBeTruthy();
  });

  it("shows no panel when the analysis carries no protocol review", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.queryByRole("heading", { name: APOLOGY_PROTOCOL.name })).toBeNull();
    expect(document.getElementById("protocol-review")).toBeNull();
  });
});

describe("the score ceiling when no context was supplied", () => {
  it("states the cap and the reachable maximum, so a good draft's score is legible", () => {
    const result = load("demo1");
    result.analysis.executive_summary.context_supplied = false;
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.getByText(/cannot score above 3.5 of 5/)).toBeTruthy();
    expect(screen.getByText(new RegExp(`most any draft can score on this run is ${ceilingWithoutContext()} of 100`))).toBeTruthy();
  });

  it("says nothing of the sort once context is supplied, because the cap is lifted", () => {
    const result = load("demo1");
    result.analysis.executive_summary.context_supplied = true;
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.queryByText(/cannot score above 3.5 of 5/)).toBeNull();
  });

  it("derives the ceiling from the weights rather than a written-down number", () => {
    // 40 of the 100 weight is capped at 3.5/5; the rest can reach 5/5.
    expect(ceilingWithoutContext()).toBe(88);
  });
});

describe("the Devil's Advocate, cut back (revision 21)", () => {
  const result = load("demo1");

  it("gives each audience one line in its own voice, and no four-field breakdown", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    for (const label of ["May hear:", "May question:", "May find missing:", "What would address it:"]) {
      expect(screen.queryByText(label, { exact: false })).toBeNull();
    }
    const said = document.querySelectorAll(".might-say li");
    expect(said).toHaveLength(result.analysis.devils_advocate.personas.length);
    expect(said[0]!.textContent).toMatch(/might say:/);
  });

  it("leads with the most damaging interpretation", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const panel = document.getElementById("devils-advocate")!;
    const damaging = panel.querySelector(".callout-material");
    const first = panel.querySelector(".callout-material, .might-say");
    expect(damaging).toBeTruthy();
    expect(first).toBe(damaging);
  });

  it("puts the reporter question to the reader without answering it", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.getByText(REPORTER_QUESTION)).toBeTruthy();
    expect(screen.getByText("Ask yourself")).toBeTruthy();
    // It is fixed copy, so it can carry no analysis and no quotation.
    expect(REPORTER_QUESTION.endsWith("?")).toBe(true);
  });
});
