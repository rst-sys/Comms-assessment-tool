// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";

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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("shows the confidentiality notice first, then the intake, then results, then a blank intake after discard", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response(JSON.stringify(captured("demo1")), { status: 200 })));
    vi.stubGlobal("scrollTo", vi.fn());
    render(<App />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "I understand" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    expect(await screen.findByText("Anthropic · claude-opus-5")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));

    expect(await screen.findByText("Communications readiness")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Score 13 out of 100/ })).toBeTruthy();
    // The privacy panel is on the results page too.
    expect(screen.getByText("Anthropic · claude-opus-5")).toBeTruthy();
    expect(document.title).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Discard and start over" }));
    expect((screen.getByLabelText("Draft text") as HTMLTextAreaElement).value).toBe("");
    expect(screen.queryByText("Communications readiness")).toBeNull();
  });

  it("shows the server's plain error and stays on intake when evaluation fails", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response(JSON.stringify({ error: "validation", message: "The analysis did not return in the expected format. Try again.", request_id: "abc" }), { status: 502 })));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "I understand" }));
    fireEvent.click(screen.getByRole("button", { name: "Restructuring memo" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate draft" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/did not return in the expected format/)).toBeTruthy();
    expect(consoleError.mock.calls[0]![0]).not.toContain("Rapid growth");
    consoleError.mockRestore();
  });

  it("shows a stub page with one paragraph for each stubbed area", () => {
    vi.stubGlobal("fetch", fakeFetch(() => new Response("{}", { status: 500 })));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "I understand" }));
    fireEvent.click(screen.getByRole("button", { name: "Standards Library" }));
    expect(screen.getByRole("heading", { name: "Standards Library" })).toBeTruthy();
    expect(screen.getByText(/not in this build/)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
