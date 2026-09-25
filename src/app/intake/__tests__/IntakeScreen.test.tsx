// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntakeScreen } from "../IntakeScreen.js";
import { FEATURES, type Features } from "../../features.js";

/**
 * Switches a feature on for one test. The features below are off for the
 * current round of testing (revision 16) but the code behind them is still
 * here, so the tests that guard it turn it back on.
 */
function enable(...keys: (keyof Features)[]) {
  const before = { ...FEATURES };
  for (const k of keys) FEATURES[k] = true;
  return () => Object.assign(FEATURES, before);
}

const config = { provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" };

let restore: (() => void) | null = null;
afterEach(() => {
  cleanup();
  restore?.();
  restore = null;
});

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
    expect(screen.getByText(/typically requires legal, HR, labor, or investor-relations review/)).toBeTruthy();
    fireEvent.click(button);
    expect(onEvaluate).toHaveBeenCalledTimes(1);
    const request = onEvaluate.mock.calls[0]![0];
    expect(request.communication_event).toBe("Layoffs or job cuts");
    expect(request.communication_format).toBe("Employee announcement");
    expect(request.already_published).toBe(false);
    expect(request.context).toEqual({});
  });

  it("shows a live word count and blocks a short pasted draft", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.change(screen.getByLabelText("Draft text"), { target: { value: "one two three" } });
    expect(screen.getByText(/^3 words/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("imports a page, fills the draft, suggests the format and marks the draft as already published", async () => {
    const onEvaluate = vi.fn();
    const text = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ source_url: "https://example.com/newsroom/x", title: "A statement", published: "2026-09-01", text, suggested_format: "Press release or public statement" }), { status: 200, headers: { "content-type": "application/json" } })));
    try {
      render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
      fireEvent.click(screen.getByRole("tab", { name: "Import from URL" }));
      fireEvent.change(screen.getByLabelText("Address of a published page"), { target: { value: "https://example.com/newsroom/x" } });
      fireEvent.click(screen.getByRole("button", { name: "Fetch text" }));
      expect(await screen.findByText("A statement")).toBeTruthy();
      expect(screen.getByText(/already issued/)).toBeTruthy();
      // The URL suggests a format, never an event: a newsroom page tells you
      // what the document is, not what happened.
      expect((screen.getByRole("radio", { name: /Press release or public statement/ }) as HTMLInputElement).checked).toBe(true);
      expect(screen.queryByRole("radio", { checked: true, name: /Layoffs or job cuts/ })).toBeNull();

      fireEvent.click(screen.getByRole("radio", { name: "Private company" }));
      fireEvent.change(screen.getByLabelText("Headquarters"), { target: { value: "United Kingdom" } });
      fireEvent.click(screen.getAllByRole("radio", { name: "Price increase or change to terms" })[0]!);
      fireEvent.click(screen.getByRole("radio", { name: /Already public/ }));
      fireEvent.click(screen.getByRole("checkbox", { name: "United Kingdom" }));
      fireEvent.click(screen.getByRole("radio", { name: /Announce a decision or change/ }));
      fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));

      const request = onEvaluate.mock.calls[0]![0];
      expect(request.already_published).toBe(true);
      expect(request.communication_format).toBe("Press release or public statement");
      // The format pre-selected who it goes to, and nothing the user did
      // afterwards overwrote it.
      expect(request.audiences).toEqual(["Media", "General public and communities"]);
      expect(request.locations).toEqual(["United Kingdom"]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("pre-selects the audiences a format goes to, and stops as soon as the user has an opinion", () => {
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    fireEvent.click(screen.getByRole("radio", { name: /Employee announcement/ }));
    expect((screen.getByRole("checkbox", { name: "All employees" }) as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole("checkbox", { name: /Managers and leaders/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Social media post/ }));
    // The user has chosen; the new format may not overwrite that.
    expect((screen.getByRole("checkbox", { name: "All employees" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: /General public and communities/ }) as HTMLInputElement).checked).toBe(false);
  });

  it("renames and hides the audiences that depend on the event and the organization", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.queryByRole("checkbox", { name: /Departing employees/ })).toBeNull();
    fireEvent.click(screen.getAllByRole("radio", { name: "Layoffs or job cuts" })[0]!);
    expect(screen.getByRole("checkbox", { name: "Departing employees" })).toBeTruthy();

    expect(screen.getByRole("checkbox", { name: "Investors and analysts" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Nonprofit or charity" }));
    expect(screen.getByRole("checkbox", { name: "Donors, funders and trustees" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Public body or government agency" }));
    expect(screen.queryByRole("checkbox", { name: /Donors, funders and trustees|Investors and analysts/ })).toBeNull();
  });

  it("pre-selects Still unfolding for a holding statement, and leaves a chosen answer alone", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: /Holding statement/ }));
    expect((screen.getByRole("radio", { name: /Still unfolding/ }) as HTMLInputElement).checked).toBe(true);

    cleanup();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: /Already public/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Holding statement/ }));
    expect((screen.getByRole("radio", { name: /Already public/ }) as HTMLInputElement).checked).toBe(true);
  });

  it("says which places it carries no legal checks for, and lets a place be removed again", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Canada" }));
    expect(screen.getByText(/Legal checks for Canada aren't included/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Canada" }));
    expect(screen.queryByText(/Legal checks for Canada/)).toBeNull();
  });

  it("warns a non-listed organization off a market disclosure", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: /Investor or market disclosure/ }));
    expect(screen.queryByText(/Change the profile or choose another format/)).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Nonprofit or charity" }));
    expect(screen.getByText(/Change the profile or choose another format/)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Publicly listed company" }));
    expect(screen.queryByText(/Change the profile or choose another format/)).toBeNull();
  });

  it("adds a pasted media report and a supporting document and sends them with the request", () => {
    restore = enable("audienceDocuments");
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.change(screen.getByLabelText("Document kind"), { target: { value: "media_report" } });
    fireEvent.change(screen.getByPlaceholderText("Employee FAQ"), { target: { value: "Trade press story" } });
    fireEvent.change(screen.getByLabelText("What the document is"), { target: { value: "Reports layoffs are planned" } });
    fireEvent.change(screen.getByLabelText("How and when the audience receives or encountered it"), { target: { value: "Published last week" } });
    fireEvent.change(screen.getByLabelText("Audience reach"), { target: { value: "some" } });
    fireEvent.change(screen.getByLabelText("Document text"), { target: { value: "Sources say 200 roles will go." } });
    fireEvent.click(screen.getByRole("button", { name: "Add document" }));
    expect(screen.getByText("Trade press story")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Employee FAQ"), { target: { value: "Employee FAQ" } });
    fireEvent.change(screen.getByLabelText("Document text"), { target: { value: "Roles were selected by seniority and skills." } });
    fireEvent.click(screen.getByRole("button", { name: "Add document" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
    const request = onEvaluate.mock.calls[0]![0];
    expect(request.audience_documents).toHaveLength(2);
    expect(request.audience_documents[0]).toMatchObject({ kind: "media_report", title: "Trade press story", reach: "some", same_time: false });
    expect(request.audience_documents[1]).toMatchObject({ kind: "supporting", title: "Employee FAQ", reach: "all", same_time: true });
    expect(request.stance).toBe("proactive");
    fireEvent.click(screen.getByRole("button", { name: "Remove Trade press story" }));
    expect(screen.queryByText("Trade press story")).toBeNull();
  });

  it("requires a description of the trigger when the stance is reactive", () => {
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByLabelText(/Reactive: this responds/));
    const button = screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("What is this reacting to"), { target: { value: "A press report claiming 200 roles will go." } });
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(onEvaluate.mock.calls[0]![0]).toMatchObject({ stance: "reactive", reacting_to: "A press report claiming 200 roles will go." });
  });

  it("finds public context and adds chosen results as media reports", async () => {
    restore = enable("audienceDocuments", "publicContextSearch");
    const onEvaluate = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/public-context")) return new Response(JSON.stringify({ items: [{ title: "Layoffs planned at Northwind", source: "Trade Daily", url: "https://example.com/a", date: "2026-09-12", summary: "Reports 200 roles will go; employees not yet told." }, { title: "Analyst note", source: "Research Co", url: "", date: null, summary: "Sees margin pressure." }], request_id: "x", usage: {} }), { status: 200 });
      return new Response("{}", { status: 404 });
    }));
    try {
      render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
      fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
      fireEvent.change(screen.getByLabelText("Public context search"), { target: { value: "Northwind layoffs" } });
      fireEvent.click(screen.getByRole("button", { name: "Search the web" }));
      expect(await screen.findByText("Layoffs planned at Northwind")).toBeTruthy();
      const boxes = screen.getAllByRole("checkbox", { checked: true }).filter((b) => (b as HTMLInputElement).name !== "stance");
      fireEvent.click(boxes[boxes.length - 1]!); // deselect the analyst note
      fireEvent.click(screen.getByRole("button", { name: /Add selected as media reports \(1\)/ }));
      fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
      const request = onEvaluate.mock.calls[0]![0];
      expect(request.audience_documents).toHaveLength(1);
      expect(request.audience_documents[0]).toMatchObject({ kind: "media_report", title: "Layoffs planned at Northwind", reach: "unknown" });
      expect(request.audience_documents[0].text).toContain("200 roles");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("refuses to add a document without text", () => {
    restore = enable("audienceDocuments");
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Add document" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Add the document's text/);
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
