import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSystemBlocks } from "../prompt.js";
import { protocolsFor } from "../protocols.js";
import { CONTROL, DEMOS } from "../fixtures.js";
import { COMMUNICATION_EVENTS, PURPOSES, type EvaluationRequest } from "../types.js";

/**
 * No review changes unless a change to the protocols was intended.
 *
 * `npm run protocols:baseline` captures which protocols each event and each
 * purpose selects and the exact text of every system block that goes with
 * them, for all thirty-two events, all six purposes and every fixture — not
 * only the three demo drafts. This compares today's engine against that file.
 *
 * The baseline was recaptured for phase 2, which switched on the core protocol
 * and three overlays and moved five checks from workforce-reduction to the
 * workforce overlay. That change was measured before it was taken, not after:
 * baseline/protocol-bundles-phase1.json is the pre-phase-2 capture, kept so
 * the move can still be read off the two files, and resolver.test.ts asserts
 * the phase 2 rules themselves — the core on every named event, which events
 * the workforce overlay fires for, and which overlay elements an event
 * protocol supersedes — which a frozen blob cannot.
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

function expectedText(hash: string): string {
  return baseline.texts[hash] ?? `(unknown block ${hash})`;
}

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

/**
 * Cases the baseline does not hold.
 *
 * Adding an event is allowed, but the baseline must be recaptured in the same
 * change, so this list is empty in a healthy tree. A name here means an event
 * or a purpose arrived without the capture being rerun, and the cases below
 * are silently not checking it.
 */
const ADDED = cases.map(([key]) => key).filter((key) => !(key in baseline.cases));

describe("the protocol bundle, against the captured baseline", () => {
  it("still covers every case the baseline holds, and nothing is unchecked", () => {
    const keys = cases.map(([key]) => key);
    for (const key of Object.keys(baseline.cases)) expect(keys, `${key} disappeared`).toContain(key);
    expect(ADDED, "recapture the baseline: npm run protocols:baseline").toEqual([]);
  });

  for (const [key, request] of cases.filter(([key]) => key in baseline.cases)) {
    it(`selects the same protocols and sends the same words for ${key}`, () => {
      const was = baseline.cases[key];
      expect(was, `${key} is missing from the baseline`).toBeDefined();
      const now = current(request);
      expect(now.ids, `${key}: protocols selected`).toEqual(was!.ids);
      // Text, not hashes: a failure has to show which words moved.
      const nowText = buildSystemBlocks(request).map((b) => b.text);
      expect(nowText, `${key}: system blocks`).toEqual(was!.blocks.map(expectedText));
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
