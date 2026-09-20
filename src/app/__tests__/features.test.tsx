// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { IntakeScreen } from "../intake/IntakeScreen.js";
import { COMING_SOON, FEATURES } from "../features.js";

const config = { provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" };

afterEach(cleanup);

describe("features switched off for this round of testing (revision 16)", () => {
  it("has the five switched off", () => {
    expect(FEATURES).toEqual({
      saveReview: false,
      compareRevisions: false,
      heightenedReview: false,
      audienceDocuments: false,
      publicContextSearch: false,
    });
  });

  it("shows the heightened-review box present but inert, never silently missing", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    const box = screen.getByRole("checkbox", { name: /Apply heightened review/ }) as HTMLInputElement;
    expect(box.disabled).toBe(true);
    expect(box.checked).toBe(false);
    expect(screen.getAllByText(COMING_SOON).length).toBeGreaterThan(0);
  });

  it("replaces the document uploader with a coming-soon note and no file input", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.getByText("Attach documents the audience already has")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add document" })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("still lets a draft be reviewed, which is the point of the round", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.getByLabelText("Draft text")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Evaluate draft" })).toBeTruthy();
  });
});

describe("the app when the config call fails", () => {
  it("still renders rather than hanging on a blank page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    render(<App />);
    // The server still refuses every paid call without the password, so letting
    // the app render is safe; a page that never loads would not be.
    expect(await screen.findByRole("heading", { name: "Trust Assessment Assistant", level: 1 })).toBeTruthy();
    vi.unstubAllGlobals();
  });
});
