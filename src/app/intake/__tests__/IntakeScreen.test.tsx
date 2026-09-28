// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntakeScreen } from "../IntakeScreen.js";
import { FEATURES, type Features } from "../../features.js";
import { chosen, fillLayoffIntake, LONG_DRAFT, menu } from "../../__tests__/fillIntake.js";

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

  it("keeps Evaluate disabled until every required field is answered", () => {
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    const button = screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fillLayoffIntake();
    expect(button.disabled).toBe(false);
    expect(screen.getByText(/typically requires legal, HR, labor, or investor-relations review/)).toBeTruthy();
    fireEvent.click(button);
    expect(onEvaluate).toHaveBeenCalledTimes(1);
    const request = onEvaluate.mock.calls[0]![0];
    expect(request.communication_event).toBe("Layoffs or job cuts");
    expect(request.communication_format).toBe("Employee announcement");
    expect(request.already_published).toBe(false);
    expect(request.context).toBe("");
  });

  it("offers no demo drafts and no URL import", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.queryByText(/Try a demo/)).toBeNull();
    expect(screen.queryByRole("tab", { name: "Import from URL" })).toBeNull();
    expect(screen.queryByLabelText("Address of a published page")).toBeNull();
  });

  it("says when the answers were carried over from the last review, and stays quiet otherwise", () => {
    const { rerender } = render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.queryByText(/Carried over from your last review/)).toBeNull();
    rerender(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} carriedOver />);
    expect(screen.getByText(/Carried over from your last review/)).toBeTruthy();
  });

  it("shows a live word count and blocks a short pasted draft", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    fireEvent.change(screen.getByLabelText("Draft text"), { target: { value: "one two three" } });
    expect(screen.getByText(/^3 words/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Evaluate draft" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("pre-selects the audiences a format goes to, and stops as soon as the user has an opinion", () => {
    const onEvaluate = vi.fn();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={onEvaluate} />);
    menu("What are you drafting?").pick(/Employee announcement/);
    expect(chosen("Who will receive this?", "All employees")).toBe(true);

    const who = menu("Who will receive this?");
    who.pick(/Managers and leaders/);
    who.close();
    menu("What are you drafting?").pick(/Social media post/);
    // The user has chosen; the new format may not overwrite that.
    expect(chosen("Who will receive this?", "All employees")).toBe(true);
    expect(chosen("Who will receive this?", "General public and communities")).toBe(false);
  });

  it("renames and hides the audiences that depend on the event and the organization", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    const options = () => {
      const who = menu("Who will receive this?");
      const names = within(screen.getByRole("listbox", { name: "Who will receive this?" }))
        .getAllByRole("option")
        .map((o) => o.textContent ?? "");
      who.close();
      return names.join(" | ");
    };

    expect(options()).not.toMatch(/Departing employees/);
    menu("What's happening?").pick("Layoffs or job cuts");
    expect(options()).toMatch(/Departing employees/);

    expect(options()).toMatch(/Investors and analysts/);
    fireEvent.click(screen.getByRole("radio", { name: "Nonprofit or charity" }));
    expect(options()).toMatch(/Donors, funders and trustees/);
    fireEvent.click(screen.getByRole("radio", { name: "Public body or government agency" }));
    expect(options()).not.toMatch(/Donors, funders and trustees|Investors and analysts/);
  });

  it("asks for the earlier statement only while the situation is still unfolding", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    const hint = /paste it here so the review can check what’s changed/;
    expect(screen.queryByText(hint)).toBeNull();
    menu("Where do things stand?").pick(/Still unfolding/);
    expect(screen.getByText(hint)).toBeTruthy();
    menu("Where do things stand?").pick(/Already public/);
    expect(screen.queryByText(hint)).toBeNull();
    menu("Where do things stand?").pick(/Not yet public/);
    expect(screen.queryByText(hint)).toBeNull();
  });

  it("pre-selects Still unfolding for a holding statement, and leaves a chosen answer alone", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    menu("What are you drafting?").pick(/Holding statement/);
    expect(chosen("Where do things stand?", "Still unfolding")).toBe(true);

    cleanup();
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    menu("Where do things stand?").pick(/Already public/);
    menu("What are you drafting?").pick(/Holding statement/);
    expect(chosen("Where do things stand?", "Already public")).toBe(true);
  });

  it("says which places it carries no legal checks for, and lets a place be removed again", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    const where = menu("Where is this happening?");
    where.pick("Canada");
    where.close();
    expect(screen.getByText(/Legal checks for Canada aren't included/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Canada" }));
    expect(screen.queryByText(/Legal checks for Canada/)).toBeNull();
  });

  it("warns a non-listed organization off a market disclosure", () => {
    render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    menu("What are you drafting?").pick(/Investor or market disclosure/);
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
    fillLayoffIntake();
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
    fireEvent.click(screen.getByRole("button", { name: "Remove Trade press story" }));
    expect(screen.queryByText("Trade press story")).toBeNull();
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
      fillLayoffIntake();
      fireEvent.change(screen.getByLabelText("Public context search"), { target: { value: "Northwind layoffs" } });
      fireEvent.click(screen.getByRole("button", { name: "Search the web" }));
      expect(await screen.findByText("Layoffs planned at Northwind")).toBeTruthy();
      const results = within(screen.getByRole("list", { name: "Search results" }));
      const boxes = results.getAllByRole("checkbox", { checked: true });
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

});
