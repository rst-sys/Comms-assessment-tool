// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntakeScreen } from "../IntakeScreen.js";

const config = { provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" };

afterEach(cleanup);

describe("IntakeScreen", () => {
  it("shows the privacy panel with the configured provider and model before anything is typed", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.getByText("Anthropic · claude-opus-5")).toBeTruthy();
    expect(screen.getByText("Zero-retention API")).toBeTruthy();
    expect(screen.getByText(/planned and not in this build/)).toBeTruthy();
  });

  it("keeps Evaluate disabled until the demo loader fills every required field", () => {
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    const button = screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    expect(button.disabled).toBe(false);
    expect((screen.getByLabelText("Draft text") as HTMLTextAreaElement).value).toMatch(/^Rapid growth brought complexity/);
    expect(screen.getByText(/\(demo draft\)/)).toBeTruthy();
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/typically requires legal, HR, labor, or investor-relations review/)).toBeTruthy();
    fireEvent.click(button);
    expect(onEvaluate).toHaveBeenCalledTimes(1);
    const request = onEvaluate.mock.calls[0]![0];
    expect(request.communication_type).toBe("Layoff or restructuring");
    expect(request.heightened_review).toBe(true);
    expect(request.already_published).toBe(false);
    expect(request.context).toEqual({});
  });

  it("auto-checks heightened review for an apology and lets the user uncheck it", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    const type = screen.getAllByRole("combobox")[0] as HTMLSelectElement;
    fireEvent.change(type, { target: { value: "Apology" } });
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.checked).toBe(true);
    fireEvent.click(box);
    expect(box.checked).toBe(false);
  });

  it("shows a live word count and blocks a short pasted draft", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.change(screen.getByLabelText("Draft text"), { target: { value: "one two three" } });
    expect(screen.getByText(/^3 words/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("imports a page, fills the draft, suggests the type and marks the draft as already published", async () => {
    const onEvaluate = vi.fn();
    const text = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ source_url: "https://example.com/newsroom/x", title: "A statement", published: "2026-09-01", text, suggested_type: "Press release" }), { status: 200, headers: { "content-type": "application/json" } })));
    try {
      render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
      fireEvent.click(screen.getByRole("tab", { name: "Import from URL" }));
      fireEvent.change(screen.getByLabelText("Address of a published page"), { target: { value: "https://example.com/newsroom/x" } });
      fireEvent.click(screen.getByRole("button", { name: "Fetch text" }));
      expect(await screen.findByText("A statement")).toBeTruthy();
      expect(screen.getByText(/already issued/)).toBeTruthy();
      expect((screen.getAllByRole("combobox")[0] as HTMLSelectElement).value).toBe("Press release");
      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      fireEvent.change(selects[1]!, { target: { value: "Media" } });
      fireEvent.change(selects[2]!, { target: { value: "Routine" } });
      fireEvent.change(selects[3]!, { target: { value: "United Kingdom" } });
      fireEvent.change(selects[4]!, { target: { value: "Inform" } });
      fireEvent.change(selects[5]!, { target: { value: "External" } });
      fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
      expect(onEvaluate.mock.calls[0]![0].already_published).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows the plain import error when the page is not readable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "not_readable", message: "Couldn't extract readable text from this page. Paste the text instead." }), { status: 422, headers: { "content-type": "application/json" } })));
    try {
      render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
      fireEvent.click(screen.getByRole("tab", { name: "Import from URL" }));
      fireEvent.change(screen.getByLabelText("Address of a published page"), { target: { value: "https://example.com/paywalled" } });
      fireEvent.click(screen.getByRole("button", { name: "Fetch text" }));
      expect(await screen.findByRole("alert")).toBeTruthy();
      expect(screen.getByText(/Paste the text instead/)).toBeTruthy();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
