// @vitest-environment jsdom
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Progress } from "../Progress.js";
import { IntakeScreen } from "../intake/IntakeScreen.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const tick = (s: number) => act(() => { vi.advanceTimersByTime(s * 1000); });

describe("the progress panel", () => {
  it("announces itself to a screen reader rather than changing silently", () => {
    render(<Progress />);
    const panel = screen.getByRole("status");
    expect(panel.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText(/A full review usually takes about a minute and a half/)).toBeTruthy();
  });

  it("counts the seconds, so the page is visibly alive", () => {
    render(<Progress />);
    expect(screen.getByText(/^0s elapsed/)).toBeTruthy();
    tick(5);
    expect(screen.getByText(/^5s elapsed/)).toBeTruthy();
  });

  it("moves through the stages in the order the engine works", () => {
    render(<Progress />);
    expect(screen.getByText(/Reading your draft/)).toBeTruthy();
    tick(35);
    expect(screen.getByText(/Scoring the ten dimensions/)).toBeTruthy();
    tick(50);
    expect(screen.getByText(/Finishing the review/)).toBeTruthy();
  });

  it("never shows a finished bar while it is still waiting", () => {
    render(<Progress />);
    tick(600);
    const bar = document.querySelector(".progress-bar") as HTMLElement;
    expect(parseInt(bar.style.width, 10)).toBe(95);
  });

  it("says so when a run overruns, without claiming it has failed", () => {
    render(<Progress />);
    tick(60);
    expect(screen.queryByText(/taking longer than usual/)).toBeNull();
    tick(120);
    expect(screen.getByText(/taking longer than usual/)).toBeTruthy();
    expect(screen.getByText(/nothing has failed/)).toBeTruthy();
  });
});

describe("the intake screen while a review runs", () => {
  const config = { provider: "Anthropic", model: "claude-opus-5", processing_mode: "Zero-retention API", training_term: "Not used to train models" };

  it("shows the progress panel only while busy", () => {
    const { rerender } = render(<IntakeScreen config={config} busy={false} error={null} onEvaluate={() => {}} />);
    expect(screen.queryByRole("status")).toBeNull();

    rerender(<IntakeScreen config={config} busy={true} error={null} onEvaluate={() => {}} />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText(/Reading your draft/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Evaluating…" })).toBeTruthy();
  });
});
