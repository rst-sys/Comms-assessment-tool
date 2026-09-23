import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compile, render, splitFrontMatter } from "../../../scripts/compile-protocols.js";
import { checkLibrary, checkProtocol, PROTOCOL_CAPS, protocolWordBudget } from "../protocolFormat.js";
import { buildProtocolBlock, protocolWordCount } from "../protocolPrompt.js";
import { PROTOCOL_LIBRARY } from "../protocolLibrary.js";

/**
 * The library the owner maintains (step 4).
 *
 * Protocols live in protocols/*.md and are compiled into protocolLibrary.ts.
 * Two things have to hold: the committed file must match the folder, or the
 * tool runs on protocols nobody has read; and a bad file must fail here, by
 * name, rather than quietly producing worse reviews for months.
 */
describe("the protocol library", () => {
  it("matches the protocols folder, so a forgotten rebuild fails here and not in front of a tester", () => {
    const { protocols, errors } = compile("protocols");
    expect(errors).toEqual([]);
    expect(readFileSync("src/engine/protocolLibrary.ts", "utf8")).toBe(render(protocols));
    expect(PROTOCOL_LIBRARY.map((p) => p.id).sort()).toEqual(protocols.map((p) => p.id).sort());
  });

  it("stays shorter than the framework it sits under, in the worst case", () => {
    const heaviest = (layer: string) =>
      Math.max(0, ...PROTOCOL_LIBRARY.filter((p) => p.layer === layer).map((p) => protocolWordCount(buildProtocolBlock(p))));
    const worst = heaviest("event") + heaviest("posture");
    expect(worst).toBeLessThanOrEqual(protocolWordBudget());
  });

  it("reads the front matter and leaves the prose for the page", () => {
    const split = splitFrontMatter("---\nid: x\n---\n## Source\nSomewhere.\n");
    expect(split?.yaml.trim()).toBe("id: x");
    expect(split?.prose.trim()).toBe("## Source\nSomewhere.");
    expect(splitFrontMatter("# Just a draft\n")).toBeNull();
  });
});

describe("the checker", () => {
  const good = {
    id: "example", name: "Example", layer: "event", version: 1, status: "active",
    event: "Cyberattack or data incident",
    elements: [{ name: "A", means: "B.", weight: "core", dimension: "accountability_agency" }],
    triggers: [{ check: "C.", dimension: "accountability_agency", review: ["Legal"] }],
    questions: [{ ask: "D?" }],
  };
  const prose = "## Source\nSomewhere.\n\n## Basis\nSomehow.\n";
  const messages = (data: unknown) => checkProtocol("f.md", data, prose).map((e) => e.message).join(" | ");

  it("passes a well-formed protocol", () => {
    expect(checkProtocol("f.md", good, prose)).toEqual([]);
  });

  it("names a dimension that does not exist, rather than silently ignoring it", () => {
    const bad = { ...good, elements: [{ ...good.elements[0], dimension: "empathy" }] };
    expect(messages(bad)).toContain('"empathy" is not one of the ten scored dimensions');
  });

  it("names a misspelled review type and lists the real ones", () => {
    const bad = { ...good, triggers: [{ ...good.triggers[0], review: ["InfoSec"] }] };
    expect(messages(bad)).toContain("Information security");
  });

  it("rejects an event that is not on the list, and the no-event placeholder", () => {
    expect(messages({ ...good, event: "A bad day" })).toContain("spelled exactly");
    expect(messages({ ...good, event: "None of these" })).toContain("no protocol may claim it");
  });

  it("holds the caps", () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => ({ check: `C${i}.`, dimension: "accountability_agency" }));
    expect(messages({ ...good, triggers: many(PROTOCOL_CAPS.triggers + 1) })).toContain("If everything is serious, nothing is.");
  });

  it("refuses a protocol that cannot say what it rests on", () => {
    expect(checkProtocol("f.md", good, "## Limits\nNone.\n").map((e) => e.message).join(" | ")).toContain('no "Source" section');
  });

  it("refuses a protocol that asks for an output section of its own", () => {
    const bad = { ...good, questions: [{ ask: "Fill protocol_review with what?" }] };
    expect(messages(bad)).toContain("A protocol adds instructions, never output");
  });

  it("insists a question is a question, but lets one carry a caveat after the mark", () => {
    expect(messages({ ...good, questions: [{ ask: "Not a question." }] })).toContain("contains no question mark");
    // PROTOCOL-PROMPT.md tells authors to write "counsel must confirm" after a
    // legal question, so requiring the mark at the very end rejected exactly
    // the phrasing the prompt asks for.
    expect(checkProtocol("f.md", { ...good, questions: [{ ask: "Does the timing fit? Counsel must confirm." }] }, prose)).toEqual([]);
  });

  it("refuses a protocol that narrows a framework check the framework does not open", () => {
    // The framework is the floor. Without this, a protocol could switch off any
    // part of it by naming it, and nothing would say so.
    expect(checkProtocol("a.md", { ...good, narrows: ["plain-naming"] }, prose)).toEqual([]);

    const message = messages({ ...good, narrows: ["Who decided"] });
    expect(message).toContain("not a framework check that may be narrowed");
    expect(message).toContain("The framework allows: plain-naming");
  });

  it("refuses two protocols claiming the same event, or the same id", () => {
    const a = { file: "a.md", data: { ...good, prose } as never };
    const b = { file: "b.md", data: { ...good, id: "other", prose } as never };
    expect(checkLibrary([a, b]).map((e) => e.message).join(" | ")).toContain("already covered by a.md");
    expect(checkLibrary([a, { ...a, file: "c.md" }]).map((e) => e.message).join(" | ")).toContain('id "example" is already used');
  });

  it("accepts only the two layers that remain", () => {
    // "core" was a third layer that duplicated the framework; it is gone, and
    // a file still claiming it should fail rather than be quietly ignored.
    expect(messages({ ...good, layer: "core" })).toContain('layer must be "event"');
  });
});
