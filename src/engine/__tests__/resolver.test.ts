import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { activeTriggers, elementApplies, elementById, MOVED_ELEMENT_IDS, PROTOCOLS, protocolsFor, resolveProtocols } from "../protocols.js";
import { ELEMENT_CAPS } from "../protocolFormat.js";
import { DEMOS } from "../fixtures.js";
import { COMMUNICATION_EVENTS, DIMENSION_IDS, EVENT_BY_LABEL, EVENT_TAXONOMY, type EvaluationRequest } from "../types.js";

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
    // personal-data and stage-unfolding are among the five rules that fired,
    // and are still stubs, so neither reaches the bundle.
    expect(resolveProtocols(everything).protocols.map((p) => p.id)).toEqual([
      "core",
      "cyber-incident",
      "apology",
      "listed-company",
      "people-harmed",
    ]);
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
    // The core applies because the event is named and has a family; nothing
    // else does. The leadership family is still a stub.
    expect(applied.map((p) => p.id)).toEqual(["core"]);
  });
});

describe("phase 2: the core, the three overlays and how they combine", () => {
  const base = DEMOS[0]!.request;
  const req = (over: Partial<EvaluationRequest>): EvaluationRequest => ({ ...base, ...over });
  const ids = (r: EvaluationRequest) => protocolsFor(r).map((p) => p.id);
  const elementIds = (r: EvaluationRequest) => resolveProtocols(r).protocols.flatMap((p) => p.elements.map((e) => e.id));

  it("applies the core to every event on the menu, whatever its family", () => {
    for (const event of COMMUNICATION_EVENTS) {
      expect(ids(req({ communication_event: event })), event).toContain("core");
    }
    // Including the one with no family. The core is what the tool asks of any
    // high-stakes message; only the layers below it need an event to attach to.
    expect(EVENT_BY_LABEL.get("Something else")?.family).toBeNull();
    expect(ids(req({ communication_event: "Something else" }))).toEqual(["core"]);
  });

  it("fires the workforce overlay on job-affecting events, and never on a dispute or a policy change", () => {
    const fires = (event: (typeof COMMUNICATION_EVENTS)[number], audiences: string[]) =>
      activeTriggers(req({ communication_event: event, audiences: audiences as never })).includes("workforce-impact");

    for (const event of ["Layoffs or job cuts", "Restructuring or reorganization", "Site, office or store closure"] as const) {
      expect(fires(event, ["All employees"]), event).toBe(true);
      // The three job-affecting events fire whoever the message is addressed to.
      expect(fires(event, ["Customers"]), event).toBe(true);
    }
    // The commercial three need employees in the room.
    for (const event of ["Financial difficulty or cost-cutting", "Change of strategy or exit from a market", "Merger, acquisition or sale"] as const) {
      expect(fires(event, ["All employees"]), event).toBe(true);
      expect(fires(event, ["Customers"]), event).toBe(false);
    }
    // Both are in the workforce family, which is why the rule names events
    // rather than the family: nobody's role ends in either.
    for (const event of ["Strike or labor dispute", "Major policy change (e.g. return to office, benefits)"] as const) {
      expect(fires(event, ["All employees"]), event).toBe(false);
      expect(fires(event, ["Customers"]), event).toBe(false);
    }
  });

  it("drops the overlay element an event protocol has the sharper version of", () => {
    const cyber = req({ communication_event: "Cyber incident or data breach", people_at_risk: true });
    expect(elementIds(cyber)).toContain("cyber-incident.support-matched-to-harm");
    expect(elementIds(cyber)).not.toContain("people-harmed.support");
    // Only that one: the rest of the overlay still applies.
    expect(elementIds(cyber)).toContain("people-harmed.harm_acknowledged");

    const geo = req({ communication_event: "Geopolitical event (war, sanctions, unrest)", people_at_risk: true });
    expect(elementIds(geo)).toContain("geopolitical.danger-and-protective-steps");
    expect(elementIds(geo)).not.toContain("people-harmed.danger_and_protection");

    // With no overlay in play there is nothing to drop, and the event keeps its own.
    const safe = req({ communication_event: "Cyber incident or data breach", people_at_risk: false });
    expect(elementIds(safe)).toContain("cyber-incident.support-matched-to-harm");
  });

  it("holds the EU notice element back unless the place and the format both match", () => {
    const listed = { ...base.organization, type: "Publicly listed company" as const };
    const eu = (communication_format: EvaluationRequest["communication_format"], headquarters: string) =>
      elementIds(req({ organization: { ...listed, headquarters }, communication_format })).includes("listed-company.eu_notice_form");

    expect(eu("Investor or market disclosure", "Germany")).toBe(true);
    expect(eu("Press release or public statement", "Germany")).toBe(true);
    // Right place, wrong form: a holding statement is not the disclosure.
    expect(eu("Holding statement", "Germany")).toBe(false);
    // Right form, outside the EU.
    expect(eu("Investor or market disclosure", "United States")).toBe(false);
    // The rest of the overlay is unaffected either way.
    expect(elementIds(req({ organization: { ...listed, headquarters: "United States" } }))).toContain("listed-company.no_half_truth");
  });

  it("still finds an element whose id moved to the overlay, so old saved reviews display", () => {
    for (const [oldId, newId] of Object.entries(MOVED_ELEMENT_IDS)) {
      const found = elementById(oldId);
      expect(found, oldId).toBeDefined();
      expect(found!.id, oldId).toBe(newId);
    }
    expect(elementById("workforce-reduction.support-for-those-leaving")?.id).toBe("workforce-reduction.support-for-those-leaving");
    expect(elementById("nothing.at-all")).toBeUndefined();
  });
});
