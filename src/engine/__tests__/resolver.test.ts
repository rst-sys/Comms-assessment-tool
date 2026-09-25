import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { activeTriggers, elementApplies, PROTOCOLS, resolveProtocols } from "../protocols.js";
import { ELEMENT_CAPS } from "../protocolFormat.js";
import { DEMOS } from "../fixtures.js";
import { DIMENSION_IDS, EVENT_TAXONOMY, type EvaluationRequest } from "../types.js";

const base = DEMOS[0]!.request;
const listed = { type: "Publicly listed company", headquarters: "United States" } as const;

describe("which overlays the intake answers switch on", () => {
  it("reads each rule off the answer that owns it", () => {
    expect(activeTriggers({ ...base, organization: listed })).toContain("listed-company");
    expect(activeTriggers({ ...base, people_at_risk: true })).toContain("people-harmed");
    expect(activeTriggers({ ...base, communication_event: "Cyber incident or data breach" })).toContain("personal-data");
    expect(activeTriggers({ ...base, situation: "Still unfolding" })).toContain("stage-unfolding");
    expect(activeTriggers({ ...base, situation: "Not yet public" })).toContain("stage-unfolding");
    expect(activeTriggers({ ...base, situation: "Already public" })).not.toContain("stage-unfolding");
    expect(activeTriggers({ ...base, purpose: "Apologize and take responsibility" })).toContain("apology");
  });

  it("puts workforce impact on any workforce event, and on the three money ones only when staff hear it", () => {
    // Layoffs are a workforce event, so it applies however the draft is sent.
    expect(activeTriggers({ ...base, communication_event: "Layoffs or job cuts", audiences: ["Media"] })).toContain("workforce-impact");
    // A market exit is commercial: it applies only when employees are an audience.
    const exit = { ...base, communication_event: "Change of strategy or exit from a market" as const };
    expect(activeTriggers({ ...exit, audiences: ["Investors and analysts"] })).not.toContain("workforce-impact");
    expect(activeTriggers({ ...exit, audiences: ["All employees"] })).toContain("workforce-impact");
    expect(activeTriggers({ ...exit, audiences: ["Managers and leaders"] })).toContain("workforce-impact");
  });
});

describe("the resolved bundle", () => {
  it("skips drafts, so a stub in the folder reaches no review", () => {
    // Every rule at once. Only the protocols that are switched on apply.
    const everything: EvaluationRequest = {
      ...base,
      organization: listed,
      communication_event: "Cyber incident or data breach",
      people_at_risk: true,
      situation: "Still unfolding",
      purpose: "Apologize and take responsibility",
    };
    expect(activeTriggers(everything)).toHaveLength(5);
    expect(resolveProtocols(everything).protocols.map((p) => p.id)).toEqual(["cyber-incident", "apology"]);
    for (const p of resolveProtocols(everything).protocols) expect(p.status).toBe("active");
  });

  it("orders overlays by id, so the same answers always hash the same", () => {
    const a = resolveProtocols({ ...base, purpose: "Apologize and take responsibility" });
    const b = resolveProtocols({ ...base, purpose: "Apologize and take responsibility" });
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toHaveLength(12);
    // A different bundle is a different hash; that is the whole point of it.
    expect(resolveProtocols(base).hash).not.toBe(a.hash);
  });

  it("gathers the narrows from every layer at once", () => {
    const ceo = resolveProtocols({ ...base, communication_event: "CEO or senior leader departure" });
    expect(ceo.narrows).toEqual(["plain-naming"]);
    expect(resolveProtocols({ ...base, communication_event: "Cyber incident or data breach" }).narrows).toEqual([]);
  });
});

describe("applies_if, which is a filter and not an overlay", () => {
  const element: Parameters<typeof elementApplies>[0] = {
    id: "x.a", name: "A", means: "B.", weight: "core", dimension: "accountability_agency", basis: "unclassified", sources: [],
  };

  it("keeps an element with no conditions on every request", () => {
    expect(elementApplies(element, base)).toBe(true);
  });

  it("drops one whose organization or place does not match", () => {
    const usListed = { ...element, applies_if: { org_type: ["publicly_listed"], jurisdiction: ["United States"] } };
    // A private company never qualifies, wherever it is.
    expect(elementApplies(usListed, base)).toBe(false);
    expect(elementApplies(usListed, { ...base, organization: listed })).toBe(true);
    // The headquarters counts as a place, not only the affected locations: a
    // US filing rule follows the company, not the people it affected.
    expect(elementApplies(usListed, { ...base, organization: listed, locations: ["Germany"] })).toBe(true);
    const german = { type: "Publicly listed company", headquarters: "Germany" } as const;
    expect(elementApplies(usListed, { ...base, organization: german, locations: ["Germany"] })).toBe(false);
  });
});

describe("the library and the taxonomy agree", () => {
  const yaml = parseYaml(readFileSync("protocols/events.yaml", "utf8")) as {
    events: { id: string; label: string; family: string | null; event_protocol?: string }[];
    families: { id: string }[];
  };

  it("compiles the taxonomy from the YAML without losing an event", () => {
    expect(EVENT_TAXONOMY.map((e) => e.id)).toEqual(yaml.events.map((e) => e.id));
    expect(EVENT_TAXONOMY.map((e) => e.label)).toEqual(yaml.events.map((e) => e.label));
  });

  it("gives every event a family that exists, and every protocol a home", () => {
    const familyIds = yaml.families.map((f) => f.id);
    for (const event of yaml.events) {
      if (event.family === null) continue;
      expect(familyIds, event.id).toContain(event.family);
      expect(PROTOCOLS.map((p) => p.id), `${event.id} needs family ${event.family}`).toContain(event.family);
      if (event.event_protocol) {
        expect(PROTOCOLS.map((p) => p.id), event.id).toContain(event.event_protocol);
      }
    }
  });

  it("keeps every protocol inside its layer's element cap", () => {
    for (const p of PROTOCOLS) {
      expect(p.elements.length, `${p.id} (${p.layer})`).toBeLessThanOrEqual(ELEMENT_CAPS[p.layer]);
      for (const e of p.elements) {
        expect(DIMENSION_IDS, `${p.id}/${e.id}`).toContain(e.dimension);
        expect(e.id.startsWith(`${p.id}.`), `${p.id}/${e.id}`).toBe(true);
      }
    }
  });
});

describe("a death is not a departure", () => {
  it("is on the menu twice, under one id, and brings in no protocol", () => {
    const death = EVENT_TAXONOMY.find((e) => e.id === "death-leader-employee");
    expect(death, "death-leader-employee is missing from the taxonomy").toBeDefined();
    expect(death!.label).toBe("Death of a leader or employee");
    expect(death!.family).toBe("leadership");
    expect(death!.event_protocol).toBeUndefined();
    expect([...death!.ui_groups].sort()).toEqual(["leadership-governance", "people-workplace"]);

    // The CEO departure protocol asks whether the leader chose to go and what
    // the separation terms were. Neither question survives contact with a death.
    const applied = resolveProtocols({ ...base, communication_event: "Death of a leader or employee" }).protocols;
    expect(applied.map((p) => p.id)).not.toContain("ceo-departure");
    expect(applied).toEqual([]);
  });
});
