import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSystemBlocks } from "../prompt.js";
import { protocolsFor } from "../protocols.js";
import { CONTROL, DEMOS } from "../fixtures.js";
import { COMMUNICATION_EVENTS, PURPOSES, type EvaluationRequest } from "../types.js";

/**
 * The layered protocol framework must not change a single review.
 *
 * `npm run protocols:baseline` captured, before any of it was built, which
 * protocols each event and each purpose selects and the exact text of every
 * system block that goes with them. This compares today's engine against that
 * file, for all thirty-one events, all six purposes and every fixture — not
 * only the three demo drafts.
 *
 * Rebuild the baseline only when a change to the protocols is intended, and
 * say so in the commit.
 */
interface Baseline {
  texts: Record<string, string>;
  cases: Record<string, { ids: string[]; blocks: string[] }>;
}

const baseline: Baseline = JSON.parse(readFileSync("src/engine/__tests__/baseline/protocol-bundles.json", "utf8"));
const sha = (t: string) => createHash("sha256").update(t).digest("hex").slice(0, 16);

function current(request: EvaluationRequest): { ids: string[]; blocks: string[] } {
  return {
    ids: protocolsFor(request).map((p) => p.id),
    blocks: buildSystemBlocks(request).map((b) => sha(b.text)),
  };
}

const base = DEMOS[0]!.request;
const cases: [string, EvaluationRequest][] = [
  ...COMMUNICATION_EVENTS.map(
    (event) =>
      [`event:${event}`, { ...base, communication_event: event, purpose: "Announce a decision or change" }] as [
        string,
        EvaluationRequest,
      ],
  ),
  ...PURPOSES.map(
    (purpose) => [`purpose:${purpose}`, { ...base, communication_event: "Something else", purpose }] as [string, EvaluationRequest],
  ),
  ...[...DEMOS, CONTROL].map((f) => [`fixture:${f.key}`, f.request] as [string, EvaluationRequest]),
];

describe("the protocol bundle, against the baseline captured before the layered framework", () => {
  it("covers every event, every purpose and every fixture", () => {
    expect(cases.map(([key]) => key).sort()).toEqual(Object.keys(baseline.cases).sort());
  });

  for (const [key, request] of cases) {
    it(`selects the same protocols and sends the same words for ${key}`, () => {
      const was = baseline.cases[key];
      expect(was, `${key} is missing from the baseline`).toBeDefined();
      const now = current(request);
      expect(now.ids, `${key}: protocols selected`).toEqual(was!.ids);
      // Hashes first: a mismatch names the block. The text comparison that
      // follows is what makes the failure readable.
      if (now.blocks.join() !== was!.blocks.join()) {
        const nowText = buildSystemBlocks(request).map((b) => b.text);
        const wasText = was!.blocks.map((h) => baseline.texts[h] ?? `(unknown block ${h})`);
        expect(nowText, `${key}: system blocks`).toEqual(wasText);
      }
      expect(now.blocks, `${key}: system blocks`).toEqual(was!.blocks);
    });
  }
});

describe("every event a protocol matches today", () => {
  /** The event-to-protocol map as it stands, read from the baseline rather than written down. */
  const matched = Object.entries(baseline.cases)
    .filter(([key]) => key.startsWith("event:"))
    .map(([key, v]) => [key.slice("event:".length), v.ids] as const)
    .filter(([, ids]) => ids.length > 0);

  it("still matches it, so no event quietly loses the standard it has", () => {
    expect(matched.length).toBeGreaterThan(0);
    for (const [event, ids] of matched) {
      const now = protocolsFor({ ...base, communication_event: event as never, purpose: "Announce a decision or change" });
      expect(now.map((p) => p.id), event).toEqual(ids);
    }
  });
});
