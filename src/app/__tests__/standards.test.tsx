// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PROTOCOLS } from "../../engine/protocols.js";
import { StandardsLibrary } from "../StandardsLibrary.js";
import { CODES, CODES_BY_ID, GROUNDING, ownJudgment } from "../standardsContent.js";
import { DIMENSION_IDS } from "../../engine/types.js";
import { ASSERTED_CEILING, DIMENSION_LABELS, DIMENSION_WEIGHTS, SCORE_BANDS } from "../../engine/scoring.js";

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

describe("what the page says is ours", () => {
  it("reads its numbers from the scoring config rather than repeating them", () => {
    // The page tells a reader that accountability carries 18 of the 100
    // points and that a claim nothing confirms caps a dimension at 3.5. If a
    // weight changes and this page does not, the tool is now misdescribing
    // its own scoring on the page that exists to describe it.
    const text = ownJudgment().map(([t, d]) => `${t} ${d}`).join(" ");
    const total = Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(text).toContain(`carries ${DIMENSION_WEIGHTS.accountability_agency} of the ${total} points`);
    expect(text).toContain(`future readiness carries ${DIMENSION_WEIGHTS.future_readiness_learning}`);
    expect(text).toContain(`at ${ASSERTED_CEILING} of 5`);
    for (const band of SCORE_BANDS.filter((b) => b.min > 0)) {
      expect(text, String(band.min)).toContain(String(band.min));
    }
    // Spelled out in the heading, so a sixth band has to be written in.
    expect(SCORE_BANDS).toHaveLength(5);
    expect(text).toContain("five bands");
  });
});

describe("the page, and the line it must not cross", () => {
  it("separates what the engine applies from what the framework rests on", () => {
    render(<StandardsLibrary />);
    expect(screen.getByRole("heading", { name: "How to read this page" })).toBeTruthy();
    // The same three tags mark the sections below, which is the point of them.
    expect(screen.getAllByText("Applied").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Grounded in").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Our judgment").length).toBeGreaterThan(1);
    // The crucial sentence: the codes do not reach the engine. "not" sits in
    // its own <strong>, so match against the flattened text.
    const flat = (document.body.textContent ?? "").replace(/\s+/g, " ");
    expect(flat).toMatch(/aren't sent to the engine and change no review/);
  });

  it("never claims the tool is based on a code the engine does not run", () => {
    const { container } = render(<StandardsLibrary />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/based on (the )?(PRSA|IABC|Page|ISO)/i);
    expect(text).not.toMatch(/(PRSA|IABC)[- ]certified|complies with (PRSA|IABC)|accredited/i);
  });

  it("admits what no code supplies rather than implying the codes cover it", () => {
    render(<StandardsLibrary />);
    expect(screen.getByRole("heading", { name: "Our own judgment" })).toBeTruthy();
    expect(screen.getAllByText(/you're disagreeing with us, not with PRSA/).length).toBeGreaterThan(0);
    // Some of these names also appear as headings in the core framework below.
    for (const [name] of ownJudgment()) expect(screen.getAllByText(name).length, name).toBeGreaterThan(0);
  });

  it("shows every dimension with its weight and its grounding", () => {
    render(<StandardsLibrary />);
    for (const id of DIMENSION_IDS) {
      expect(screen.getAllByText(new RegExp(DIMENSION_LABELS[id])).length, id).toBeGreaterThan(0);
    }
    // Appears both in the Page summary and against the dimension it grounds.
    expect(screen.getAllByText(GROUNDING.listening_employee_voice[0]!.principle, { exact: false }).length).toBeGreaterThan(0);
  });

  it("still lists the protocols the engine really does apply, and what each rests on", () => {
    render(<StandardsLibrary />);
    for (const protocol of PROTOCOLS) {
      expect(screen.getByRole("heading", { name: protocol.name })).toBeTruthy();
      // Its own words for when it applies, built from the fields that select it.
      expect(screen.getAllByText(new RegExp(`Applied when the (event|purpose) is .*Version ${protocol.version}`)).length).toBeGreaterThan(0);
    }
  });

  it("keeps every protocol's checks and sources one click away, never on the page at once", () => {
    // Five protocols open at once is what made the page 18.8 screens. The
    // first is open so the shape is obvious; the rest, and every set of full
    // sources, wait to be asked for.
    render(<StandardsLibrary />);
    const heads = screen.getAllByRole("button", { expanded: false });
    expect(heads.length).toBeGreaterThan(PROTOCOLS.length - 1);
    expect(screen.getAllByRole("button", { expanded: true })).toHaveLength(1);

    // The first protocol's checks are the engine's own, not a copy.
    const first = PROTOCOLS[0]!;
    for (const element of first.elements) {
      expect(screen.getAllByText(element.name).length, element.name).toBeGreaterThan(0);
    }

    // Its sources are behind a second expander, and open when asked.
    fireEvent.click(screen.getByRole("button", { name: /Sources in full/ }));
    expect(screen.getAllByText(/cannot|does not|assumes/i).length).toBeGreaterThan(0);
  });
});
