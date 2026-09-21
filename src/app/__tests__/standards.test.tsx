// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StandardsLibrary } from "../StandardsLibrary.js";
import { CODES, CODES_BY_ID, GROUNDING, OWNER_S_OWN } from "../standardsContent.js";
import { DIMENSION_IDS } from "../../engine/types.js";
import { DIMENSION_LABELS } from "../../engine/scoring.js";

afterEach(cleanup);

describe("the codes the framework rests on", () => {
  it("gives every dimension at least one published principle", () => {
    for (const id of DIMENSION_IDS) {
      expect(GROUNDING[id], id).toBeDefined();
      expect(GROUNDING[id].length, id).toBeGreaterThan(0);
    }
  });

  it("cites only codes it actually lists, so no principle points at nothing", () => {
    for (const id of DIMENSION_IDS) {
      for (const g of GROUNDING[id]) {
        expect(CODES_BY_ID[g.code], `${id} cites unknown code ${g.code}`).toBeDefined();
      }
    }
  });

  it("names a real body and a real link for each code", () => {
    for (const c of CODES) {
      expect(c.body.length, c.id).toBeGreaterThan(3);
      expect(c.url.startsWith("https://"), c.id).toBe(true);
      expect(c.summary.length, c.id).toBeGreaterThan(80);
    }
  });

  it("covers the codes the owner asked for by name", () => {
    const bodies = CODES.map((c) => c.body).join(" ");
    expect(bodies).toMatch(/PRSA/);
    expect(bodies).toMatch(/Arthur W\. Page/);
    expect(bodies).toMatch(/IABC/);
  });
});

describe("the page, and the line it must not cross", () => {
  it("separates what the engine applies from what the framework rests on", () => {
    render(<StandardsLibrary />);
    expect(screen.getByRole("heading", { name: "How to read this page" })).toBeTruthy();
    expect(screen.getByText("Applied")).toBeTruthy();
    expect(screen.getByText("Grounded in")).toBeTruthy();
    // The crucial sentence: the codes do not reach the engine. "not" sits in
    // its own <strong>, so match against the flattened text.
    const flat = (document.body.textContent ?? "").replace(/\s+/g, " ");
    expect(flat).toMatch(/are not sent to the engine and change no review/);
  });

  it("never claims the tool is based on a code the engine does not run", () => {
    const { container } = render(<StandardsLibrary />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/based on (the )?(PRSA|IABC|Page|ISO)/i);
    expect(text).not.toMatch(/(PRSA|IABC)[- ]certified|complies with (PRSA|IABC)|accredited/i);
  });

  it("admits what no code supplies rather than implying the codes cover it", () => {
    render(<StandardsLibrary />);
    expect(screen.getByRole("heading", { name: "What is our own judgement" })).toBeTruthy();
    expect(screen.getByText(/you are disagreeing with us, not with PRSA/)).toBeTruthy();
    // Some of these names also appear as headings in the core framework below.
    for (const [name] of OWNER_S_OWN) expect(screen.getAllByText(name).length, name).toBeGreaterThan(0);
  });

  it("shows every dimension with its weight and its grounding", () => {
    render(<StandardsLibrary />);
    for (const id of DIMENSION_IDS) {
      expect(screen.getAllByText(new RegExp(DIMENSION_LABELS[id])).length, id).toBeGreaterThan(0);
    }
    // Appears both in the Page summary and against the dimension it grounds.
    expect(screen.getAllByText(GROUNDING.listening_employee_voice[0]!.principle, { exact: false }).length).toBeGreaterThan(0);
  });

  it("still lists the protocols the engine really does apply", () => {
    render(<StandardsLibrary />);
    expect(screen.getByRole("heading", { name: "Effective apology" })).toBeTruthy();
    expect(screen.getByText(/Lewicki/)).toBeTruthy();
  });
});
