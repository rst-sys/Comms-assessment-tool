// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ComparisonResult } from "../../../engine/compare.js";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { DEMO_1 } from "../../../engine/fixtures.js";
import { APOLOGY_PROTOCOL } from "../../../engine/protocols.js";
import { buildSavedReview, type SavedReview } from "../../../engine/savedReview.js";
import type { ProtocolReview } from "../../../engine/types.js";
import { ComparisonPanel } from "../ComparisonPanel.js";

function load(): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith("demo1-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

function review(statuses: ("Present" | "Partial" | "Absent")[]): ProtocolReview {
  return {
    protocol: APOLOGY_PROTOCOL.name,
    source: APOLOGY_PROTOCOL.source,
    elements: APOLOGY_PROTOCOL.elements.map((e, i) => ({ name: e.name, status: statuses[i]!, note: `Note on ${e.name}.` })),
  };
}

function baselineWith(protocol: ProtocolReview | null): SavedReview {
  const result = load();
  result.analysis.protocol_review = protocol;
  return buildSavedReview(result, DEMO_1.request);
}

const comparison: ComparisonResult = {
  request_id: "r1",
  summary: "The new version names the decision-maker. Support for affected people is still missing.",
  verdicts: [],
  new_concerns: [],
  score_before: 13,
  score_after: 31,
  band_before: "Weak",
  band_after: "Developing",
  movements: [],
  drift: [],
  provider: { provider: "Anthropic", model: "claude-opus-5" },
  usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
};

afterEach(cleanup);

describe("ComparisonPanel protocol movement (revision 14)", () => {
  it("shows the count before and after, and names what changed", () => {
    const baseline = baselineWith(review(["Absent", "Absent", "Absent", "Absent", "Absent", "Absent"]));
    const now = review(["Present", "Present", "Partial", "Absent", "Absent", "Absent"]);
    render(<ComparisonPanel comparison={comparison} baseline={baseline} protocol={now} />);

    expect(screen.getByText(/of 6 elements present/)).toBeTruthy();
    expect(screen.getByText("Effective apology")).toBeTruthy();
    // Two moved from Absent to Present, one to Partial; three did not move.
    expect(screen.getAllByText("Was absent in the saved review.")).toHaveLength(3);
    expect(screen.getAllByText("Unchanged.")).toHaveLength(3);
    expect(screen.getByText("Acknowledgment of responsibility")).toBeTruthy();
  });

  it("shows nothing when either version has no protocol, or the protocols differ", () => {
    const none = baselineWith(null);
    const { unmount } = render(<ComparisonPanel comparison={comparison} baseline={none} protocol={review(["Present", "Present", "Present", "Present", "Present", "Present"])} />);
    expect(screen.queryByText(/elements present/)).toBeNull();
    unmount();

    const had = baselineWith(review(["Present", "Present", "Present", "Present", "Present", "Present"]));
    const { unmount: unmount2 } = render(<ComparisonPanel comparison={comparison} baseline={had} protocol={null} />);
    expect(screen.queryByText(/elements present/)).toBeNull();
    unmount2();

    const other = { ...review(["Present", "Present", "Present", "Present", "Present", "Present"]), protocol: "Something else" };
    render(<ComparisonPanel comparison={comparison} baseline={had} protocol={other} />);
    expect(screen.queryByText(/elements present/)).toBeNull();
  });
});
