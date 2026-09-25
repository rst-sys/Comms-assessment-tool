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

/**
 * The two changes the layered framework was allowed to make, both agreed
 * before it was built. Everything else must be byte-identical.
 *
 * Ids: three files were renamed to match protocols/events.yaml. Same file,
 * same words — and the prompt never carries an id, only a name.
 *
 * Wording: each protocol block opens `NAME (layer protocol)`, so turning the
 * apology from a posture into an overlay changes that one word and nothing
 * else in the block.
 */
const RENAMED: Record<string, string> = {
  "workforce-restructuring": "workforce-reduction",
  "geopolitical-operations-employee-welfare": "geopolitical",
  "public-apology": "apology",
};
const ACCEPTED_WORDING: [string, string][] = [["(posture protocol)", "(overlay protocol)"]];

/** The baseline's text, with the agreed wording change applied. */
function expectedText(hash: string): string {
  let text = baseline.texts[hash] ?? `(unknown block ${hash})`;
  for (const [was, now] of ACCEPTED_WORDING) text = text.replace(was, now);
  return text;
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
 * Events added since the baseline was captured.
 *
 * Adding one is allowed; it must arrive with no protocol, so it cannot change
 * how any existing draft is reviewed. Anything else the baseline holds must
 * still match word for word.
 */
const ADDED = cases.map(([key]) => key).filter((key) => !(key in baseline.cases));

describe("the protocol bundle, against the baseline captured before the layered framework", () => {
  it("still covers every case the baseline holds, and names anything new", () => {
    const keys = cases.map(([key]) => key);
    for (const key of Object.keys(baseline.cases)) expect(keys, `${key} disappeared`).toContain(key);
    // The one intended addition: a death is not a departure.
    expect(ADDED).toEqual(["event:Death of a leader or employee"]);
  });

  for (const key of ADDED) {
    it(`adds ${key} with no protocol, so it changes no existing review`, () => {
      const request = cases.find(([k]) => k === key)![1];
      expect(protocolsFor(request)).toEqual([]);
    });
  }

  for (const [key, request] of cases.filter(([key]) => key in baseline.cases)) {
    it(`selects the same protocols and sends the same words for ${key}`, () => {
      const was = baseline.cases[key];
      expect(was, `${key} is missing from the baseline`).toBeDefined();
      const now = current(request);
      expect(now.ids, `${key}: protocols selected`).toEqual(was!.ids.map((id) => RENAMED[id] ?? id));
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
      expect(now.map((p) => p.id), event).toEqual(ids.map((id) => RENAMED[id] ?? id));
    }
  });
});
