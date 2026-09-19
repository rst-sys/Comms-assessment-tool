// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { CONTROL, DEMO_1 } from "../../../engine/fixtures.js";
import { CORE_PRINCIPLE } from "../../copy.js";
import { ResultsPage } from "../ResultsPage.js";

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
    expect(screen.getByText("Resolve with specialists")).toBeTruthy();
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
    expect(screen.queryByText("Resolve with specialists")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^(External weather|Institutional abstraction|Audience displacement|Passive accountability|Values without action|Vague action): / })).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Score 83 out of 100/ })).toBeTruthy();
  });
});
