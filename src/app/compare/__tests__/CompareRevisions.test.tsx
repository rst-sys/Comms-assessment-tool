// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { DEMO_1 } from "../../../engine/fixtures.js";
import { buildSavedReview } from "../../../engine/savedReview.js";
import { CompareRevisions } from "../CompareRevisions.js";

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

const saved = buildSavedReview(load("demo1"), { ...DEMO_1.request, audience_documents: [{ kind: "supporting", title: "Employee FAQ", description: "d", delivery: "with the email", reach: "all", same_time: true, text: "secret" }] });

afterEach(cleanup);

function upload(content: string) {
  const input = screen.getByLabelText("Saved review file");
  const file = new File([content], "review.json", { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
}

describe("CompareRevisions", () => {
  it("loads a saved review and shows its score, findings and the documents to re-attach", async () => {
    const onLoad = vi.fn();
    const { rerender } = render(<CompareRevisions baseline={null} onLoad={onLoad} onClear={() => {}} onStart={() => {}} />);
    upload(JSON.stringify(saved));
    await waitFor(() => expect(onLoad).toHaveBeenCalled());
    rerender(<CompareRevisions baseline={onLoad.mock.calls[0]![0]} onLoad={onLoad} onClear={() => {}} onStart={() => {}} />);
    expect(screen.getByText("Layoff or restructuring")).toBeTruthy();
    expect(screen.getByText(String(saved.score))).toBeTruthy();
    expect(screen.getByText(/Employee FAQ/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add the new draft" })).toBeTruthy();
  });

  it("shows a plain message when the file is not a saved review", async () => {
    render(<CompareRevisions baseline={null} onLoad={() => {}} onClear={() => {}} onStart={() => {}} />);
    upload("this is not json");
    expect((await screen.findByRole("alert")).textContent).toMatch(/not a saved review/);
  });
});
