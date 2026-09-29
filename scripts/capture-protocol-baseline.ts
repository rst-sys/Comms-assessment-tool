/**
 * Captures today's protocol selection and system-prompt text for every event,
 * every purpose and every fixture, so the layered framework can be proved to
 * change neither.
 *
 * Block texts are stored once and referenced by hash. Without that the file is
 * a megabyte, because forty-one cases each repeat the same framework prompt.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { protocolsFor } from "../src/engine/protocols.js";
import { buildSystemBlocks } from "../src/engine/prompt.js";
import { DEMOS, CONTROL, COUNSEL_CASES } from "../src/engine/fixtures.js";
import { COMMUNICATION_EVENTS, PURPOSES, SITUATION_STATUSES } from "../src/engine/types.js";
import type { EvaluationRequest } from "../src/engine/types.js";

const OUT = "src/engine/__tests__/baseline/protocol-bundles.json";

const texts: Record<string, string> = {};
const cases: Record<string, { ids: string[]; blocks: string[] }> = {};

const sha = (t: string) => createHash("sha256").update(t).digest("hex").slice(0, 16);

function record(key: string, request: EvaluationRequest): void {
  const blocks = buildSystemBlocks(request).map((b) => {
    const h = sha(b.text);
    texts[h] = b.text;
    return h;
  });
  cases[key] = { ids: protocolsFor(request).map((p) => p.id), blocks };
}

const base = DEMOS[0]!.request;
for (const event of COMMUNICATION_EVENTS) {
  record(`event:${event}`, { ...base, communication_event: event, purpose: "Announce a decision or change" });
}
for (const purpose of PURPOSES) {
  record(`purpose:${purpose}`, { ...base, communication_event: "Something else", purpose });
}
// One case per answer to "Where do things stand?". Every other case above
// shares the demo's "Not yet public", so without these the baseline could not
// see an overlay that switches on by situation.
for (const situation of SITUATION_STATUSES) {
  record(`situation:${situation}`, { ...base, communication_event: "Product recall or safety issue", purpose: "Announce a decision or change", situation });
}
// The counsel box ticked. Every case above leaves it unticked, so without
// these the baseline could not see the Legal constraints overlay, or the
// Apology and Crisis in progress checks that give way to it.
for (const [key, request] of COUNSEL_CASES(base)) record(key, request);
for (const f of [...DEMOS, CONTROL]) record(`fixture:${f.key}`, f.request);

writeFileSync(
  OUT,
  JSON.stringify({ texts, cases }, null, 2) + "\n",
);
console.log(`Wrote ${OUT}: ${Object.keys(cases).length} cases, ${Object.keys(texts).length} distinct blocks.`);
