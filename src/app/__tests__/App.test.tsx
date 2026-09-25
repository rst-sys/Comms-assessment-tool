// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { OVERVIEW_SECTIONS } from "../overviewContent.js";
import { CORE_PRINCIPLE } from "../copy.js";
import { PROTOCOLS } from "../../engine/protocols.js";
import { FEATURES, type Features } from "../features.js";

/** Switches a feature on for one test; see the note in features.ts. */
function enable(...keys: (keyof Features)[]) {
  const before = { ...FEATURES };
  for (const k of keys) FEATURES[k] = true;
  return () => Object.assign(FEATURES, before);
}

function captured(prefix: string): unknown {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));
}

function fakeFetch(evaluateResponse: () => Response) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.endsWith("/api/config")) {
      return new Response(JSON.stringify({ provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" }), { status: 200 });
    }
    if (url.endsWith("/api/evaluate")) return evaluateResponse();
    return new Response("{}", { status: 404 });
  });
}

/**
 * Renders and waits for the welcome screen. The app holds a blank frame until
 * /api/config answers, because until then it does not know whether this
 * deployment asks for a shared password (revision 15).
 */
async function renderApp(ui = <App />) {
  render(ui);
  await screen.findByRole("heading", { name: /Know whether your message will be trusted/, level: 1 });
}

let restore: (() => void) | null = null;
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  restore?.();
  restore = null;
});

describe("App", () => {
  it("shows the welcome screen first, then the intake, then results, then a blank intake after discard", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response(JSON.stringify(captured("demo1")), { status: 200 })));
    vi.stubGlobal("scrollTo", vi.fn());
    await renderApp();
    expect(screen.getByRole("heading", { name: /Know whether your message will be trusted/, level: 1 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What it won't do" })).toBeTruthy();
    expect(screen.getByText(/Nothing is saved\./)).toBeTruthy();
    expect(screen.getByText("Write or rewrite your message")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tool Overview" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    expect(screen.queryByRole("heading", { name: "What it won't do" })).toBeNull();

    expect(await screen.findByText("Anthropic · claude-opus-5")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));

    expect(await screen.findByText("Risk level")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Score 13 out of 100/ })).toBeTruthy();
    // The privacy panel is on the results page too.
    expect(screen.getByText("Anthropic · claude-opus-5")).toBeTruthy();
    expect(document.title).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Discard and start over" }));
    expect((screen.getByLabelText("Draft text") as HTMLTextAreaElement).value).toBe("");
    expect(screen.queryByText("Risk level")).toBeNull();
  });

  it("shows the server's plain error and stays on intake when evaluation fails", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response(JSON.stringify({ error: "validation", message: "The analysis did not return in the expected format. Try again.", request_id: "abc" }), { status: 502 })));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/did not return in the expected format/)).toBeTruthy();
    expect(consoleError.mock.calls[0]![0]).not.toContain("Rapid growth");
    consoleError.mockRestore();
  });

  it("says on the welcome screen what comes back, what it won't do, and what not to paste", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    expect(screen.getByRole("heading", { name: "What you'll get" })).toBeTruthy();
    expect(screen.getByText(/A score out of 100/)).toBeTruthy();
    expect(screen.getByText(/most damning reasonable reading/)).toBeTruthy();
    // The one thing on this screen a reader must not miss.
    expect(screen.getByText(/Do not paste privileged, material nonpublic or regulated personal information/)).toBeTruthy();
    // The long explanations moved to the Tool Overview; none may linger here.
    expect(screen.queryByText(/Consistent, tailored and transparent/)).toBeNull();
    expect(screen.queryByText(/How it works: three questions/)).toBeNull();
    expect(screen.queryByText(/two minutes/)).toBeNull();
  });

  it("shows the footer and a build stamp on every screen, not only on results", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    // A tester has to be able to answer "am I on the build you just pushed?"
    // before running anything, not only after a review has succeeded.
    expect(screen.getByText(CORE_PRINCIPLE)).toBeTruthy();
    expect(screen.getByText("© 2026 Richard Thompson")).toBeTruthy();
    expect(screen.getByText(/^Build /)).toBeTruthy();
  });

  it("names the reference and the elapsed time when a review fails", async () => {
    vi.stubGlobal(
      "fetch",
      fakeFetch(() =>
        new Response(JSON.stringify({ error: "api", message: "Provider error 529: overloaded", request_id: "9a83fbab61d0" }), {
          status: 502,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("scrollTo", vi.fn());
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));

    expect(await screen.findByText("Provider error 529: overloaded")).toBeTruthy();
    // "Try again" alone leaves a tester with nothing to report, and no way to
    // tell a slow failure from an instant one.
    expect(screen.getByText(/Failed after \d+ seconds?/)).toBeTruthy();
    expect(screen.getByText("9a83fbab61d0")).toBeTruthy();
  });

  it("opens the Standards Library from the welcome screen, not the Tool Overview", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Standards Library" }));
    expect(screen.getByRole("heading", { name: "Standards library", level: 1 })).toBeTruthy();
  });

  it("opens the Tool Overview tab from the welcome link and from the nav", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Tool Overview" }));
    expect(screen.getByRole("heading", { name: "What the assistant checks, and how it scores", level: 1 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ten weighted dimensions" })).toBeTruthy();
    expect(screen.getByText("Accountability and agency")).toBeTruthy();
    expect(screen.getByText(/never invents a metric/)).toBeTruthy();
    // Every section the contents list promises is on the page and linkable.
    for (const { id, title } of OVERVIEW_SECTIONS) {
      expect(document.getElementById(id), title).toBeTruthy();
    }
    expect(screen.getAllByText(/Do not paste privileged, material nonpublic/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getByLabelText("Draft text")).toBeTruthy();
  });

  it("saves a review and offers Compare Revisions in the nav", async () => {
    restore = enable("saveReview", "compareRevisions");
    const saves: { filename: string; data: Blob }[] = [];
    vi.stubGlobal("fetch", fakeFetch(() => new Response(JSON.stringify(captured("demo1")), { status: 200 })));
    vi.stubGlobal("scrollTo", vi.fn());
    const createObjectURL = vi.fn(() => "blob:x");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      saves.push({ filename: this.download, data: new Blob() });
    });
    try {
      await renderApp();
      fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
      expect(screen.getByRole("button", { name: "Compare Revisions" })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
      fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
      expect(await screen.findByText("Risk level")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Save this review" }));
      await waitFor(() => expect(saves.length).toBe(1));
      expect(saves[0]!.filename).toMatch(/^trust-review-layoffs-or-job-cuts-\d{4}-\d{2}-\d{2}\.json$/);
      expect(screen.getByText(/Review saved/)).toBeTruthy();
    } finally {
      click.mockRestore();
    }
  });

  it("shows a stub page with one paragraph for each stubbed area", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    fireEvent.click(screen.getByRole("button", { name: "Team Workspace" }));
    expect(screen.getByRole("heading", { name: "Team Workspace" })).toBeTruthy();
    expect(screen.getByText(/not in this build/)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("shows the Standards Library with the core framework and the apology protocol", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    await renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Start a review" }));
    fireEvent.click(screen.getByRole("button", { name: "Standards Library" }));
    expect(screen.getByRole("heading", { name: "Standards library", level: 1 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "The core framework" })).toBeTruthy();
    // Every protocol the engine can send is on the page, with every element it
    // checks: the library must not claim a standard the tool does not apply,
    // nor apply one it does not show.
    for (const protocol of PROTOCOLS) {
      expect(screen.getByRole("heading", { name: protocol.name })).toBeTruthy();
      for (const element of protocol.elements) {
        expect(screen.getByText(element.name)).toBeTruthy();
      }
    }
    expect(screen.getByText(/Lewicki/)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
