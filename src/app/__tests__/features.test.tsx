// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { IntakeScreen } from "../intake/IntakeScreen.js";
import { COMING_SOON, FEATURES } from "../features.js";

const config = { provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" };

afterEach(cleanup);

describe("features switched off for this round of testing (revision 16)", () => {
  it("has the four switched off", () => {
    expect(FEATURES).toEqual({
      saveReview: false,
      compareRevisions: false,
      audienceDocuments: false,
      publicContextSearch: false,
    });
  });

  it("leaves no trace of a switched-off feature on the intake screen", () => {
    // Greyed-out controls were worse than absent ones: a tester has to read
    // each, work out it does nothing, and ask why it is there. The flag still
    // guards the code, so switching one back on is a one-line change.
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.queryAllByText(COMING_SOON)).toHaveLength(0);
    expect(screen.queryByText("Attach documents the audience already has")).toBeNull();
    expect(screen.queryByRole("button", { name: "Add document" })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(document.querySelector(".disabled-feature")).toBeNull();
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
