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
    id: "example", name: "Example", layer: "event", family: "incident", version: "1.0.0", status: "active",
    last_reviewed: "2026-09-25", review_by: null, changelog: ["1.0.0 — first version."],
    rests_on: "Regulator guidance plus professional judgment.",
    elements: [
      { id: "example.a", name: "A", means: "B.", weight: "core", dimension: "accountability_agency", basis: "unclassified", sources: [] },
    ],
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

  it("refuses a protocol that still names its own events, now the taxonomy does", () => {
    // One direction only: protocols/events.yaml points at a protocol, never
    // the other way, so the menu and the engine cannot drift apart.
    expect(messages({ ...good, events: ["Cyber incident or data breach"] })).toContain("no longer named here");
    expect(messages({ ...good, purposes: ["Apologize and take responsibility"] })).toContain("no longer named here");
  });

  it("insists an event protocol names its family, and an overlay its trigger", () => {
    const { family: _f, ...noFamily } = good;
    expect(messages(noFamily)).toContain("needs family");
    expect(messages({ ...noFamily, layer: "overlay", trigger: "apology" })).toEqual("");
    expect(messages({ ...noFamily, layer: "overlay", trigger: "whenever" })).toContain("an overlay needs trigger");
    expect(messages({ ...good, trigger: "apology" })).toContain("only a protocol with layer: overlay names a trigger");
  });

  it("holds a different element cap for each layer", () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ ...good.elements[0], id: `example.e${i}`, name: `E${i}` }));
    const { family: _f, ...base } = good;
    // A family says what its events share, so it is the smallest.
    expect(messages({ ...base, layer: "family", elements: many(7) })).toContain("the most a family protocol may carry is 6");
    expect(messages({ ...base, layer: "overlay", trigger: "apology", elements: many(6) })).toContain("may carry is 5");
    expect(messages({ ...good, elements: many(9) })).toContain("may carry is 8");
    expect(checkProtocol("f.md", { ...good, elements: many(8) }, prose)).toEqual([]);
  });

  it("wants a stable id on every element, prefixed by the protocol's own", () => {
    expect(messages({ ...good, elements: [{ ...good.elements[0], id: undefined }] })).toContain("needs an id");
    expect(messages({ ...good, elements: [{ ...good.elements[0], id: "other.a" }] })).toContain('must start with "example."');
    expect(messages({ ...good, elements: [good.elements[0], { ...good.elements[0], name: "B" }] })).toContain("repeats the id");
  });

  it("wants a semver version and a changelog, so a review can be traced to a version", () => {
    expect(messages({ ...good, version: 1 })).toContain("must be semver");
    expect(messages({ ...good, version: "1.0" })).toContain("must be semver");
    expect(messages({ ...good, changelog: [] })).toContain("needs a changelog");
    expect(messages({ ...good, last_reviewed: "yesterday" })).toContain("must be a date");
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
    expect(message).toContain("neither a framework check that may be narrowed nor a core protocol element");
    expect(message).toContain("The framework allows: plain-naming");
  });

  it("refuses two protocols with the same id, or two overlays on one rule", () => {
    const a = { file: "a.md", data: { ...good, prose } as never };
    expect(checkLibrary([a, { ...a, file: "c.md" }]).map((e) => e.message).join(" | ")).toContain('id "example" is already used');

    const overlay = { ...good, layer: "overlay", trigger: "apology", family: undefined, prose };
    const two = [
      { file: "x.md", data: overlay as never },
      { file: "y.md", data: { ...overlay, id: "other" } as never },
    ];
    expect(checkLibrary(two).map((e) => e.message).join(" | ")).toContain('trigger "apology" is already claimed by x.md');
  });

  it("makes the taxonomy and the folder agree in both directions", () => {
    const events = [
      { id: "cyber-incident", label: "Cyber incident or data breach", family: "incident", event_protocol: "example", ui_groups: [] },
      { id: "outage", label: "System outage", family: "incident", ui_groups: [] },
    ];
    const files = [{ file: "a.md", data: { ...good, prose } as never }];
    // The family every event needs must exist as a file.
    expect(checkLibrary(files, events, ["incident"], []).map((e) => e.message).join(" | ")).toContain(
      "protocols/families/incident.md does not exist",
    );
    // And an event protocol nothing points at can never apply.
    expect(checkLibrary(files, [events[1]!], ["incident"], []).map((e) => e.message).join(" | ")).toContain(
      'no event in events.yaml points at "example"',
    );
  });

  it("refuses an element that cites a source the registry does not hold", () => {
    const bad = { ...good, elements: [{ ...good.elements[0], sources: ["made-up-source"] }] };
    const message = checkLibrary([{ file: "a.md", data: { ...bad, prose } as never }], [], [], ["real-source"])
      .map((e) => e.message)
      .join(" | ");
    expect(message).toContain('cites source "made-up-source"');
  });

  it("accepts only the four layers", () => {
    expect(messages({ ...good, layer: "posture" })).toContain("layer must be one of core, family, event, overlay");
  });

  it("insists on a one-line summary of what the protocol rests on, and keeps it short", () => {
    // The page shows this instead of three thousand words of citations, so a
    // protocol without one has nothing to say for itself above the fold.
    const { rests_on: _omitted, ...without } = good;
    expect(messages(without)).toContain("needs rests_on");
    expect(messages({ ...good, rests_on: Array.from({ length: 31 }, (_, i) => `w${i}`).join(" ") })).toContain("keep it to 30");
  });
});
