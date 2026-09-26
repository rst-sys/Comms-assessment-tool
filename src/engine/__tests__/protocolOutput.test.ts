import { describe, expect, it } from "vitest";
import { DEMO_2 } from "../fixtures.js";
import { buildSystemBlocks } from "../prompt.js";
import { PROTOCOLS, protocolsFor } from "../protocols.js";
import { buildProtocolBlock } from "../protocolPrompt.js";
import { ANALYSIS_SCHEMA } from "../schema.js";

/**
 * A protocol changes what the engine looks for, never what it writes.
 *
 * The apology protocol used to ask for a section of its own. Nothing displayed
 * it once the panel came off the results page, so every apology review paid for
 * output the reader never saw. Output is the expensive half of a review — the
 * model writes it a word at a time — so this is the rule the whole protocol
 * architecture rests on, and it is cheap to break by accident.
 */
describe("protocols add instructions, never output", () => {
  it("leaves no protocol section in the output schema", () => {
    const properties = (ANALYSIS_SCHEMA as { properties: Record<string, unknown> }).properties;
    expect(Object.keys(properties)).not.toContain("protocol_review");
    expect(JSON.stringify(ANALYSIS_SCHEMA)).not.toContain("protocol");
  });

  it("asks no protocol to fill a field of its own", () => {
    for (const protocol of PROTOCOLS) {
      const block = buildProtocolBlock(protocol);
      expect(block, protocol.id).not.toContain("protocol_review");
      expect(JSON.stringify(protocol), protocol.id).not.toContain("protocol_review");
    }
  });

  it("still applies the apology protocol, routing it through the ordinary findings", () => {
    const applied = protocolsFor(DEMO_2.request);
    expect(applied.map((p) => p.id)).toContain("apology");

    const blocks = buildSystemBlocks(DEMO_2.request).map((b) => b.text).join("\n");
    expect(blocks).toContain("PUBLIC APOLOGY");
    expect(blocks).toContain("raise what you find through the ordinary findings");
    expect(blocks).not.toContain("protocol_review");
  });
});
