// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { DEMO_1 } from "../../../engine/fixtures.js";
import { RedraftPanel } from "../RedraftPanel.js";

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RedraftPanel", () => {
  const result = load("demo1");
  const redraft = {
    revised_draft: "Rapid growth brought complexity. [Accountable executive or team] decided to eliminate [number] roles; feedback from employees described the problem, but the decision was leadership's. These changes will help us focus on what matters most.",
    change_log: [{ finding_id: "F-001", original: "Based on feedback from employees, we are eliminating roles to become leaner and more agile.", revised: "[Accountable executive or team] decided to eliminate [number] roles; feedback from employees described the problem, but the decision was leadership's.", reason: "Names the decision-maker and separates feedback from the decision." }],
    placeholders: ["[Accountable executive or team]", "[number]"],
    request_id: "abc",
    retrospective: false,
    provider: { provider: "Anthropic", model: "claude-opus-5" },
    usage: { input_tokens: 1, output_tokens: 2, cache_read_input_tokens: null, cache_creation_input_tokens: null },
  };

  it("shows the button, then the side-by-side view, change log and placeholders after a call", async () => {
    let sent: unknown = null;
    vi.stubGlobal("fetch", vi.fn(async (_url: unknown, init?: RequestInit) => {
      sent = JSON.parse(String(init?.body));
      return new Response(JSON.stringify(redraft), { status: 200 });
    }));
    render(<RedraftPanel result={result} request={DEMO_1.request} />);
    fireEvent.click(screen.getByRole("button", { name: "Draft a minimal-risk revision" }));
    expect(await screen.findByText("Change log")).toBeTruthy();
    expect((sent as { analysis: { schema_version: string } }).analysis.schema_version).toBe("1.0");
    const original = screen.getByLabelText("Original draft with deletions marked");
    const revised = screen.getByLabelText("Revised draft with additions marked");
    expect(original.querySelector("del")).toBeTruthy();
    expect(revised.querySelector("ins")).toBeTruthy();
    expect(original.textContent).toBe(DEMO_1.request.draft);
    expect(revised.textContent).toBe(redraft.revised_draft);
    expect(screen.getByText("[number]")).toBeTruthy();
    expect(screen.getByText("F-001")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Draft a minimal-risk revision" })).toBeNull();
  });

  it("labels the revision as a model for a future statement when the draft was already issued", () => {
    render(<RedraftPanel result={result} request={{ ...DEMO_1.request, already_published: true }} />);
    expect(screen.getByText(/model for a future statement or a follow-up/)).toBeTruthy();
  });

  it("shows the server's plain error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "validation", message: "The revision did not return in the expected format. Try again." }), { status: 502 })));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<RedraftPanel result={result} request={DEMO_1.request} />);
    fireEvent.click(screen.getByRole("button", { name: "Draft a minimal-risk revision" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    spy.mockRestore();
  });
});
