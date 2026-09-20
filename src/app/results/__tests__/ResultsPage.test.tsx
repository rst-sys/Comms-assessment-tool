// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { CONTROL, DEMO_1 } from "../../../engine/fixtures.js";
import { CORE_PRINCIPLE } from "../../copy.js";
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
    expect(screen.getByRole("button", { name: /Score 13 out of 100/ })).toBeTruthy();
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

  it("renders five top findings and a link to the full register", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const section = screen.getByRole("region", { name: "Top findings" });
    expect(within(section).getAllByRole("article")).toHaveLength(5);
    expect(within(section).getByText(/Show all findings \(11\)/)).toBeTruthy();
  });

  it("shows the escalation checklist under heightened review", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    expect(screen.getByText("Questions for subject matter reviewers")).toBeTruthy();
  });

  it("renders the collapsed panels, the highlighted draft, and the footer", () => {
    const { container } = render(<ResultsPage result={result} request={DEMO_1.request} />);
    const panels = Array.from(container.querySelectorAll("details.panel"));
    expect(panels.map((p) => p.id)).toEqual(["findings-register", "scorecard", "agency-scan", "devils-advocate", "questions"]);
    expect(panels.every((p) => !(p as HTMLDetailsElement).open)).toBe(true);

    const highlights = screen.getAllByRole("button", { name: /^Institutional abstraction: / });
    expect(highlights[0]!.textContent).toBe("Rapid growth brought complexity");
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

  it("filters and sorts the findings register and keeps status in state", () => {
    render(<ResultsPage result={result} request={DEMO_1.request} />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(12); // header + 11
    fireEvent.click(screen.getByRole("button", { name: "High only" }));
    expect(within(table).getAllByRole("row")).toHaveLength(9); // header + 8 High
    const select = within(table).getAllByRole("combobox")[0] as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "Accepted risk" } });
    expect(select.value).toBe("Accepted risk");
  });
});

describe("ResultsPage with the captured control analysis", () => {
  it("shows no highlights and no escalation checklist when heightened review is off", () => {
    render(<ResultsPage result={load("control")} request={CONTROL.request} />);
    expect(screen.queryByText("Questions for subject matter reviewers")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^(External weather|Institutional abstraction|Audience displacement|Passive accountability|Values without action|Vague action): / })).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Score 83 out of 100/ })).toBeTruthy();
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
