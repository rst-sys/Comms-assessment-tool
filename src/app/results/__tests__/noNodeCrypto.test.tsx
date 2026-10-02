// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The results page must not reach node:crypto.
 *
 * Vite externalizes it in the browser bundle, so calling it throws and React
 * unmounts the whole tree: the reviewer checklist shipped calling
 * resolveProtocols, which hashes, and every finished review rendered a blank
 * white page with nothing in the server log.
 *
 * Mocked to throw the way the browser stub does, so this fails here rather
 * than in front of a tester.
 */
const externalized = () => {
  throw new Error('Module "node:crypto" has been externalized for browser compatibility');
};
vi.mock("node:crypto", () => ({ default: { createHash: externalized }, createHash: externalized }));

const { ResultsPage } = await import("../ResultsPage.js");
const { DEMO_1 } = await import("../../../engine/fixtures.js");
const { checklistFor, checklistSize } = await import("../../../engine/checklist.js");
const { CHECKLIST_TITLE, checklistForHash } = await import("../../../engine/checklist.js");
import type { EvaluationResult } from "../../../engine/evaluate.js";

afterEach(cleanup);

function loadDemo1(): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith("demo1-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

describe("the results page in a browser, where node:crypto throws", () => {
  it("renders the review rather than a blank page", () => {
    const result = loadDemo1();
    const { container } = render(<ResultsPage result={result} request={DEMO_1.request} />);
    // A blank page is what the bug produced: React unmounts the tree when a
    // render throws, leaving an empty container and nothing in the log.
    expect(container.textContent!.length).toBeGreaterThan(500);
    expect(screen.getByRole("heading", { name: CHECKLIST_TITLE })).toBeTruthy();
    expect(screen.getAllByText(/questions_before_publication|Questions worth asking/i).length).toBeGreaterThan(0);
  });

  it("still builds the checklist, which is what needed the protocols", () => {
    const groups = checklistFor(DEMO_1.request);
    expect(checklistSize(groups)).toBeGreaterThan(0);
  });

  it("degrades to no checklist, rather than throwing, for a hash-only saved review", () => {
    // The oldest saved reviews have nothing but a hash, and looking one up
    // needs the index that hashing builds. Empty here, not an exception.
    expect(() => checklistForHash("abc123abc123")).not.toThrow();
    expect(checklistForHash("abc123abc123")).toBeNull();
  });
});
