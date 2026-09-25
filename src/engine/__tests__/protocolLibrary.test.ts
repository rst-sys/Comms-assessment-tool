import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compile, readSourceIds, render, splitFrontMatter } from "../../../scripts/compile-protocols.js";
import { checkLibrary, checkProtocol, PROTOCOL_CAPS, protocolWordBudget } from "../protocolFormat.js";
import { buildProtocolBlock, protocolWordCount } from "../protocolPrompt.js";
import { PROTOCOL_LIBRARY } from "../protocolLibrary.js";
import { worstCase } from "../bundleWorstCase.js";
import { activeTriggers } from "../protocols.js";
import { DEMOS } from "../fixtures.js";
import { AUDIENCES, COMMUNICATION_EVENTS, EMPLOYEE_AUDIENCES, SPECIALIST_REVIEW_TYPES } from "../types.js";
import { MAX_QUESTIONS } from "../limits.js";

/**
 * The library the owner maintains (step 4).
 *
 * Protocols live in protocols/*.md and are compiled into protocolLibrary.ts.
 * Two things have to hold: the committed file must match the folder, or the
 * tool runs on protocols nobody has read; and a bad file must fail here, by
 * name, rather than quietly producing worse reviews for months.
 */
describe("the protocol library", () => {
  // Slower than the rest: compiling runs the worst-case enumeration, which puts
  // a million requests through the resolver. That is the point of it.
  it("matches the protocols folder, so a forgotten rebuild fails here and not in front of a tester", () => {
    const { protocols, errors } = compile("protocols");
    expect(errors).toEqual([]);
    expect(readFileSync("src/engine/protocolLibrary.ts", "utf8")).toBe(render(protocols));
    expect(PROTOCOL_LIBRARY.map((p) => p.id).sort()).toEqual(protocols.map((p) => p.id).sort());
  }, 60_000);

  // This used to add the heaviest event to the heaviest posture, a layer that
  // no longer exists, so it had been measuring the event protocols alone and
  // passing for the wrong reason.
  it("keeps the largest bundle the intake can produce under the hard token limit", () => {
    const worst = worstCase();
    expect(worst.tokens).toBeLessThanOrEqual(4000);
    // The enumeration has to be finding real bundles, not an empty search.
    expect(worst.bundles).toBeGreaterThan(20);
    expect(worst.requests).toBeGreaterThan(100_000);
    expect(worst.protocols).toContain("core");
  }, 60_000);

  it("reads nothing but the Employees group out of the audiences, which is why one of each is enough", () => {
    // bundleWorstCase tries each audience alone and all of them together
    // rather than all 512 subsets. That is sound only while the resolver reads
    // no more than whether an Employees option is present; if a rule ever
    // looks at a combination, the enumeration would step straight past it.
    const base = DEMOS[0]!.request;
    const employee = EMPLOYEE_AUDIENCES;
    const others = AUDIENCES.filter((a) => !(employee as readonly string[]).includes(a));
    for (const event of COMMUNICATION_EVENTS) {
      const request = { ...base, communication_event: event };
      const alone = new Set(others.map((a) => activeTriggers({ ...request, audiences: [a] }).join("|")));
      const together = activeTriggers({ ...request, audiences: [...others] }).join("|");
      // No non-employee audience changes the answer, alone or in any group.
      expect(alone.size, event).toBe(1);
      expect(together, event).toBe([...alone][0]);
      // Adding one employee audience is the same as adding all of them.
      const oneEmployee = activeTriggers({ ...request, audiences: [employee[0]!] }).join("|");
      const allEmployees = activeTriggers({ ...request, audiences: [...employee] }).join("|");
      expect(allEmployees, event).toBe(oneEmployee);
    }
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

describe("what the protocols ask the model to produce", () => {
  it("never names a review value the output schema would reject", () => {
    // A protocol saying "review: [Works council]" puts that word in the prompt,
    // the model copies it back, and the strict validator throws out the whole
    // analysis over one label. normalize.ts now maps or drops such a value,
    // but a protocol should not be shipping one in the first place: the tag is
    // wrong on the page either way.
    const allowed = new Set<string>(SPECIALIST_REVIEW_TYPES);
    const offences: string[] = [];
    for (const p of PROTOCOL_LIBRARY) {
      for (const [i, t] of p.triggers.entries()) {
        for (const r of t.review ?? []) if (!allowed.has(r)) offences.push(`${p.id} trigger ${i + 1}: ${r}`);
      }
      for (const [i, q] of p.questions.entries()) {
        for (const r of q.review ?? []) if (!allowed.has(r)) offences.push(`${p.id} question ${i + 1}: ${r}`);
      }
    }
    expect(offences).toEqual([]);
  });

  it("assembles the largest reachable bundle without a review value the schema rejects", () => {
    const worst = worstCase();
    const allowed = new Set<string>(SPECIALIST_REVIEW_TYPES);
    const inBundle = worst.protocols.map((id) => PROTOCOL_LIBRARY.find((p) => p.id === id)!);
    expect(inBundle.every(Boolean)).toBe(true);
    const named = new Set<string>();
    for (const p of inBundle) {
      for (const t of p.triggers) for (const r of t.review ?? []) named.add(r);
      for (const q of p.questions) for (const r of q.review ?? []) named.add(r);
    }
    expect([...named].filter((r) => !allowed.has(r))).toEqual([]);
    // The bundle really does name several, so this is not passing on an empty set.
    expect(named.size).toBeGreaterThan(3);
  }, 60_000);

  it("offers far more questions than a review may carry, which is why the cap is enforced", () => {
    // The pressure behind the intermittent failure: six protocols between them
    // put more than twice the cap in front of the model. If this ever falls to
    // the cap or below, the ranking instruction in the prompt has stopped
    // earning its place and the trimming in normalize.ts is untested in anger.
    const worst = worstCase();
    const offered = worst.protocols
      .map((id) => PROTOCOL_LIBRARY.find((p) => p.id === id)!)
      .reduce((n, p) => n + p.questions.length, 0);
    expect(offered).toBeGreaterThan(MAX_QUESTIONS);
  }, 60_000);
});

describe("evidence labels", () => {
  const LABELLED = ["ceo-departure", "cyber-incident", "geopolitical", "workforce-reduction"];
  const ACTIVE = PROTOCOL_LIBRARY.filter((p) => p.status === "active");

  it("leaves no element of an active protocol unclassified", () => {
    // Every check the engine actually applies says what kind of authority it
    // rests on. A card that shows a check with no label is asking the reader to
    // take it on trust, which is the thing this page exists not to do.
    const unclassified = ACTIVE.flatMap((p) => p.elements.filter((e) => e.basis === "unclassified").map((e) => e.id));
    expect(unclassified).toEqual([]);
    expect(ACTIVE.flatMap((p) => p.elements).length).toBeGreaterThan(20);
  });

  it("gives every element of an active protocol its note, except where the label needs none", () => {
    // A note is required wherever the label overstates the source: law that
    // binds somewhere narrower than the tool is used, or research and guidance
    // borrowed from another setting. Plain judgement can stand on the label.
    const missing = ACTIVE.flatMap((p) =>
      p.elements.filter((e) => e.basis !== "judgement" && !e.basis_note).map((e) => `${e.id} (${e.basis})`),
    );
    expect(missing).toEqual([]);
  });

  it("resolves every source id an element cites against the registry", () => {
    const known = new Set(readSourceIds());
    const dangling: string[] = [];
    for (const p of PROTOCOL_LIBRARY) {
      for (const e of p.elements) for (const src of e.sources) if (!known.has(src)) dangling.push(`${e.id}: ${src}`);
    }
    expect(dangling).toEqual([]);
    // Not vacuous: the labelled protocols really do cite sources now.
    const cited = LABELLED.flatMap((id) => PROTOCOL_LIBRARY.find((x) => x.id === id)!.elements.flatMap((e) => e.sources));
    expect(new Set(cited).size).toBeGreaterThan(8);
  });

  it("keeps basis, sources and basis_note out of the prompt entirely", () => {
    // The whole point of the field: it says where the evidence came from, which
    // is the reader's business and not the model's. If any of it reached the
    // prompt, adding a label would change reviews.
    for (const p of PROTOCOL_LIBRARY) {
      const block = buildProtocolBlock(p);
      for (const e of p.elements) {
        if (e.basis_note) expect(block, `${e.id} basis_note`).not.toContain(e.basis_note);
        for (const src of e.sources) expect(block, `${e.id} source ${src}`).not.toContain(src);
      }
      // "law", "research" and the rest are ordinary words that can appear in a
      // check, so the label is matched only in the shape a block would print it.
      expect(block).not.toMatch(/\b(basis|basis_note|sources)\s*[:=]/i);
    }
  });

  it("qualifies every element resting on law", () => {
    // "Law" is the label most likely to be read as settling the matter, and
    // not one of these is binding everywhere the tool is used: some bind only
    // in the EU, some only for listed companies, and one is an extension of a
    // rule that covers a narrower audience. Each must say so. The note is not
    // matched for particular words — same_to_all limits its claim by naming
    // whom Reg FD covers, which no keyword would catch.
    const onLaw = ACTIVE.flatMap((p) => p.elements.filter((e) => e.basis === "law"));
    expect(onLaw.length).toBeGreaterThan(3);
    for (const e of onLaw) {
      expect(e.basis_note, `${e.id} rests on law and must say how far that reaches`).toBeTruthy();
      expect(e.basis_note!.trim().split(/\s+/).length, e.id).toBeGreaterThan(5);
    }
  });
});
