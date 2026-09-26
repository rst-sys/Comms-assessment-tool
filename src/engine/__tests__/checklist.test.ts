import { describe, expect, it } from "vitest";
import {
  buildChecklist,
  bundleHash,
  bundlesByHash,
  checklistFor,
  checklistForBundle,
  checklistForHash,
  checklistSize,
  GENERAL_GROUP,
} from "../checklist.js";
import { PROTOCOL_LIBRARY } from "../protocolLibrary.js";
import { protocolsFor, resolveProtocols } from "../protocols.js";
import { buildProtocolBlock } from "../protocolPrompt.js";
import { buildSystemBlocks } from "../prompt.js";
import { buildSavedReview, savedChecklist } from "../savedReview.js";
import { DEMOS } from "../fixtures.js";
import { sampleAnalysis } from "./helpers.js";
import {
  AUDIENCES,
  COMMUNICATION_EVENTS,
  COMMUNICATION_FORMATS,
  ORGANIZATION_TYPES,
  PURPOSES,
  SITUATION_STATUSES,
  SPECIALIST_REVIEW_TYPES,
  type EvaluationRequest,
} from "../types.js";

const base = DEMOS[0]!.request;
const req = (over: Partial<EvaluationRequest>): EvaluationRequest => ({ ...base, ...over });

/** The same sweep bundleWorstCase uses, so every reachable bundle is covered. */
function everyRequest(): EvaluationRequest[] {
  const out: EvaluationRequest[] = [];
  for (const communication_event of COMMUNICATION_EVENTS)
    for (const type of ORGANIZATION_TYPES)
      for (const people_at_risk of [true, false])
        for (const purpose of PURPOSES)
          for (const situation of SITUATION_STATUSES)
            for (const headquarters of ["Germany", "United States"])
              for (const audiences of [...AUDIENCES.map((a) => [a]), [...AUDIENCES]])
                out.push({ ...base, communication_event, purpose, situation, people_at_risk,
                  audiences: audiences as EvaluationRequest["audiences"], organization: { type, headquarters } });
  return out;
}

describe("the prompt no longer carries a protocol's questions", () => {
  it("sends no question text from any protocol, for any reachable bundle", () => {
    // The whole point of the change. A question that slipped through would be
    // counted twice by the reader: once in the model's list, once on the card.
    const asked = PROTOCOL_LIBRARY.flatMap((p) => p.questions.map((q) => q.ask));
    expect(asked.length).toBeGreaterThan(20);
    for (const p of PROTOCOL_LIBRARY) {
      const block = buildProtocolBlock(p);
      for (const q of p.questions) expect(block, `${p.id} still sends "${q.ask.slice(0, 40)}…"`).not.toContain(q.ask);
      expect(block).not.toContain("QUESTIONS");
    }
  });

  it("sends none of them in a fully assembled prompt either", () => {
    for (const communication_event of ["Layoffs or job cuts", "Cyber incident or data breach", "Major policy change (e.g. return to office, benefits)"] as const) {
      const request = req({ communication_event, people_at_risk: true, purpose: "Apologize and take responsibility" });
      const prompt = buildSystemBlocks(request).map((b) => b.text).join("\n");
      for (const p of resolveProtocols(request).protocols) {
        for (const q of p.questions) expect(prompt, `${communication_event}: ${p.id}`).not.toContain(q.ask);
      }
      // And the checklist for that same request is not empty, so the questions
      // went somewhere rather than simply being dropped.
      expect(checklistSize(checklistFor(request))).toBeGreaterThan(0);
    }
  });
});

describe("the checklist the app builds instead", () => {
  it("is the same for the same intake, every time", () => {
    const request = req({ communication_event: "Layoffs or job cuts", people_at_risk: true });
    const once = JSON.stringify(checklistFor(request));
    for (let i = 0; i < 5; i += 1) expect(JSON.stringify(checklistFor(request))).toBe(once);
    // Same answers in a different object identity still produce the same list.
    expect(JSON.stringify(checklistFor({ ...request }))).toBe(once);
  });

  it("carries every question the bundle holds, once each", () => {
    const request = req({ communication_event: "Layoffs or job cuts", people_at_risk: true });
    const { protocols } = resolveProtocols(request);
    const unique = new Set(protocols.flatMap((p) => p.questions.map((q) => q.ask.trim())));
    const groups = checklistFor(request);
    expect(checklistSize(groups)).toBe(unique.size);
    const flat = groups.flatMap((g) => g.questions.map((q) => q.ask));
    expect(new Set(flat).size, "a question appears twice").toBe(flat.length);
  });

  it("files a question under its first review value and tags the rest", () => {
    const request = req({ communication_event: "Layoffs or job cuts" });
    const groups = checklistFor(request);
    for (const group of groups) {
      for (const q of group.questions) {
        const source = PROTOCOL_LIBRARY.find((p) => p.id === q.protocol)!.questions.find((x) => x.ask === q.ask)!;
        const review = source.review ?? [];
        expect(group.name).toBe(review[0] ?? GENERAL_GROUP);
        expect(q.also).toEqual(review.slice(1));
      }
    }
  });

  it("keeps the protocol's wording exactly, hedges and all", () => {
    const request = req({ communication_event: "Layoffs or job cuts", organization: { ...base.organization, type: "Publicly listed company" } });
    const asked = checklistFor(request).flatMap((g) => g.questions.map((q) => q.ask));
    const fromFiles = new Set(resolveProtocols(request).protocols.flatMap((p) => p.questions.map((q) => q.ask)));
    for (const a of asked) expect(fromFiles.has(a), a.slice(0, 50)).toBe(true);
    // "Counsel must confirm" is a legal hedge the author put there on purpose.
    expect(asked.some((a) => /Counsel must confirm/.test(a))).toBe(true);
  });

  it("orders groups the same way every review, and core before the layers under it", () => {
    const order = [...SPECIALIST_REVIEW_TYPES, GENERAL_GROUP] as string[];
    const groups = checklistFor(req({ communication_event: "Layoffs or job cuts", people_at_risk: true }));
    const positions = groups.map((g) => order.indexOf(g.name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(positions.every((p) => p >= 0)).toBe(true);
    // Within a group, an earlier layer comes first.
    const rank = { core: 0, family: 1, event: 2, overlay: 3 } as const;
    for (const g of groups) {
      const layers = g.questions.map((q) => rank[q.layer]);
      expect(layers, g.name).toEqual([...layers].sort((a, b) => a - b));
    }
  });

  it("is empty for an intake that switches nothing on", () => {
    expect(buildChecklist([])).toEqual([]);
    expect(checklistSize(buildChecklist([]))).toBe(0);
  });
});

describe("recovering a saved review's checklist from its bundle hash", () => {
  it("hashes a bundle the same way the resolver does, for every reachable bundle", () => {
    // If these two ever disagree, saved reviews silently lose their checklists.
    const seen = new Set<string>();
    for (const request of everyRequest()) {
      const { protocols, hash } = resolveProtocols(request);
      if (protocols.length === 0 || seen.has(hash)) continue;
      seen.add(hash);
      expect(bundleHash(protocols), protocols.map((p) => p.id).join("+")).toBe(hash);
      expect(bundlesByHash().has(hash), `hash for ${protocols.map((p) => p.id).join("+")} is not indexed`).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(50);
  });

  it("rebuilds the same checklist the live request produced", () => {
    for (const communication_event of ["Layoffs or job cuts", "Major policy change (e.g. return to office, benefits)", "Cyber incident or data breach"] as const) {
      const request = req({ communication_event, people_at_risk: true });
      const { hash } = resolveProtocols(request);
      expect(JSON.stringify(checklistForHash(hash)), communication_event).toBe(JSON.stringify(checklistFor(request)));
    }
  });

  it("returns null rather than today's checklist when the hash is not ours", () => {
    // A review run against protocol versions since revised. Showing the
    // current checklist would misdescribe what was actually checked.
    expect(checklistForHash("deadbeef0000")).toBeNull();
    expect(checklistForHash(undefined)).toBeNull();
    expect(checklistForHash("")).toBeNull();
  });

  it("stores the recovered checklist in a saved review", () => {
    const request = req({ communication_event: "Layoffs or job cuts", people_at_risk: true });
    const { hash } = resolveProtocols(request);
    const saved = buildSavedReview(
      { analysis: sampleAnalysis(), bundle_hash: hash, request_id: "r", provider: { provider: "p", model: "m" }, score: 60, band: "b", confidence_label: "c", adjustments: { dropped_findings: 0, context_flag_corrected: false, trimmed_findings: 0, thin_questions: 0 } } as never,
      request,
    );
    expect(saved.reviewer_checklist).toBeDefined();
    expect(saved.reviewer_checklist!.length).toBe(checklistFor(request).length);
    expect(saved.reviewer_checklist!.flatMap((g) => g.questions).length).toBe(checklistSize(checklistFor(request)));
    // The protocols selected are what decides it, not the intake object.
    expect(saved.reviewer_checklist![0]!.questions[0]!.ask).toBe(checklistFor(request)[0]!.questions[0]!.ask);
  });

  it("leaves the field off when the hash cannot be resolved", () => {
    const saved = buildSavedReview(
      { analysis: sampleAnalysis(), bundle_hash: "notahash1234", request_id: "r", provider: { provider: "p", model: "m" }, score: 60, band: "b", confidence_label: "c", adjustments: { dropped_findings: 0, context_flag_corrected: false, trimmed_findings: 0, thin_questions: 0 } } as never,
      req({ communication_event: "Layoffs or job cuts" }),
    );
    expect(saved.reviewer_checklist).toBeUndefined();
  });
});

describe("the largest checklist a reader can meet", () => {
  it("is bigger than the cap the model's own list is held to", () => {
    let top = 0;
    for (const request of everyRequest()) top = Math.max(top, checklistSize(checklistFor(request)));
    // It was 22 candidates competing for 8 slots. Now every one is shown.
    expect(top).toBeGreaterThan(8);
    expect(protocolsFor(req({ communication_event: "Layoffs or job cuts" })).length).toBeGreaterThan(0);
  }, 60_000);
});

describe("a review saved against a protocol version since revised", () => {
  const request = req({ communication_event: "Layoffs or job cuts", people_at_risk: true });

  const resultFor = (over: Partial<{ bundle: string[]; bundle_hash: string }>) =>
    ({
      analysis: sampleAnalysis(), request_id: "r", provider: { provider: "p", model: "m" },
      score: 60, band: "b", confidence_label: "c",
      adjustments: { dropped_findings: 0, context_flag_corrected: false, trimmed_findings: 0, thin_questions: 0 },
      bundle_hash: resolveProtocols(request).hash,
      bundle: resolveProtocols(request).protocols.map((p) => `${p.id}@${p.version}`),
      ...over,
    }) as never;

  it("records the id@version of every protocol that applied", () => {
    const saved = buildSavedReview(resultFor({}), request);
    const live = resolveProtocols(request).protocols.map((p) => `${p.id}@${p.version}`);
    expect(saved.bundle).toEqual(live);
    expect(saved.bundle!.length).toBeGreaterThan(3);
    expect(saved.bundle!.every((b) => /@\d+\.\d+\.\d+$/.test(b))).toBe(true);
    // The hash is kept too: it still identifies the bundle in one short string.
    expect(saved.bundle_hash).toBe(resolveProtocols(request).hash);
  });

  it("still shows the checklist it was run with after every protocol is revised", () => {
    // Save it, then age it: bump every version and reword a question, as a
    // later phase would. Neither the hash nor an id@version match can find
    // those versions any more.
    const saved = buildSavedReview(resultFor({}), request);
    const original = JSON.stringify(saved.reviewer_checklist);
    expect(saved.reviewer_checklist!.length).toBeGreaterThan(0);

    const aged: typeof saved = JSON.parse(JSON.stringify(saved));
    aged.bundle = aged.bundle!.map((b) => b.replace(/@.*$/, "@99.0.0"));
    aged.bundle_hash = "999999999999";

    const shown = savedChecklist(aged);
    expect(shown).not.toBeNull();
    expect(JSON.stringify(shown!.map((g) => ({ name: g.name, questions: g.questions.map((q) => ({ ask: q.ask, also: q.also })) }))))
      .toBe(original);
  });

  it("falls back to the bundle list when the file predates the stored checklist", () => {
    // A review saved by an older build: no reviewer_checklist, but it has the
    // list. The ids still resolve, so the reader gets the right protocols.
    const saved = buildSavedReview(resultFor({}), request);
    const older: typeof saved = JSON.parse(JSON.stringify(saved));
    delete older.reviewer_checklist;
    older.bundle_hash = "999999999999";

    const shown = savedChecklist(older);
    expect(shown).not.toBeNull();
    expect(checklistSize(shown!)).toBe(checklistSize(checklistFor(request)));

    // And with a version no longer in the library, it resolves by id and says
    // the wording may have moved on.
    const revised = { ...older, bundle: older.bundle!.map((b) => b.replace(/@.*$/, "@99.0.0")) };
    const byId = checklistForBundle(revised.bundle);
    expect(byId).not.toBeNull();
    expect(byId!.exact).toBe(false);
    expect(checklistSize(byId!.groups)).toBe(checklistSize(checklistFor(request)));
    expect(checklistForBundle(saved.bundle)!.exact).toBe(true);
  });

  it("gives up rather than guessing when nothing identifies the bundle", () => {
    const saved = buildSavedReview(resultFor({}), request);
    const blank: typeof saved = JSON.parse(JSON.stringify(saved));
    delete blank.reviewer_checklist;
    delete blank.bundle;
    blank.bundle_hash = "999999999999";
    expect(savedChecklist(blank)).toBeNull();
    expect(checklistForBundle([])).toBeNull();
    expect(checklistForBundle(["not-a-protocol@1.0.0"])).toBeNull();
  });
});
