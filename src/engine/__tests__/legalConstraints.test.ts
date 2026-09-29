import { describe, expect, it } from "vitest";
import { checkLibrary, checkProtocol, INSTRUCTION_MAX_WORDS, type ProtocolFile } from "../protocolFormat.js";
import { buildProtocolBlock } from "../protocolPrompt.js";
import { checklistFor } from "../checklist.js";
import { PROTOCOL_LIBRARY } from "../protocolLibrary.js";
import { activeTriggers, resolvedProtocols } from "../protocols.js";
import { buildSavedReview, settingsDrift, type SavedSettings } from "../savedReview.js";
import { COMMUNICATION_EVENTS, type EvaluationRequest } from "../types.js";
import { DEMO_1 } from "../fixtures.js";
import type { EvaluationResult } from "../evaluate.js";
import { sampleAnalysis } from "./helpers.js";

const INSTRUCTION =
  "Legal constraints apply. Where a fix would need an admission the stated limit rules out, offer instead a plain declaration of the limit, an expression of sympathy or regret, or what is being done, and refer the question to counsel. Never say a statement is legally safe.";

const base: EvaluationRequest = { ...DEMO_1.request, counsel_limited: false };
const ticked = (r: Partial<EvaluationRequest> = {}): EvaluationRequest => ({ ...base, ...r, counsel_limited: true });

const elementIds = (request: EvaluationRequest, library?: readonly ProtocolFile[]) =>
  resolvedProtocols(request, library).flatMap((p) => p.elements.map((e) => e.id));
const protocolIds = (request: EvaluationRequest) => resolvedProtocols(request).map((p) => p.id);

const APOLOGY_CHECK = "apology.acknowledged-responsibility";
const CRISIS_CHECK = "crisis-in-progress.response-fits-responsibility";
const LIMIT_SCOPE = "legal-constraints.limit-scope";

describe("the instruction field", () => {
  const overlay = {
    id: "example", name: "Example", layer: "overlay", trigger: "legal-constraints", version: "1.0.0", status: "active",
    last_reviewed: null, review_by: null, changelog: ["1.0.0 — first version."],
    rests_on: "Professional judgement.",
    elements: [], triggers: [], questions: [],
  };
  const prose = "## Source\nSomewhere.\n";
  const messages = (data: unknown) => checkProtocol("f.md", data, prose).map((e) => e.message).join(" | ");

  it("accepts one line on an overlay", () => {
    expect(messages({ ...overlay, instruction: INSTRUCTION })).toBe("");
  });

  it("refuses it on any other layer", () => {
    const family = { ...overlay, layer: "family", trigger: undefined };
    expect(messages({ ...family, instruction: "Word fixes carefully." })).toContain("only a protocol with layer: overlay may carry an instruction");
  });

  it(`refuses more than ${INSTRUCTION_MAX_WORDS} words, a line break, or something that is not text`, () => {
    const long = Array.from({ length: INSTRUCTION_MAX_WORDS + 1 }, () => "word").join(" ");
    expect(messages({ ...overlay, instruction: long })).toContain(`keep it to ${INSTRUCTION_MAX_WORDS}`);
    expect(messages({ ...overlay, instruction: "First line.\nSecond line." })).toContain("must be one line");
    expect(messages({ ...overlay, instruction: ["a list"] })).toContain("instruction must be one line of text");
  });

  it("is sent word for word at the end of the overlay's block, and only there", () => {
    const legal = PROTOCOL_LIBRARY.find((p) => p.id === "legal-constraints")!;
    expect(legal.instruction).toBe(INSTRUCTION);
    const block = buildProtocolBlock(legal);
    expect(block.endsWith(`\n\nINSTRUCTION\n${INSTRUCTION}`)).toBe(true);
    for (const p of PROTOCOL_LIBRARY.filter((x) => x.id !== "legal-constraints")) {
      expect(buildProtocolBlock(p), p.id).not.toContain("INSTRUCTION");
    }
  });
});

describe("element superseded_by with more than one target", () => {
  const prose = "## Source\nSomewhere.\n";
  const overlay = (elements: unknown[]) => ({
    id: "example", name: "Example", layer: "overlay", trigger: "apology", version: "1.0.0", status: "active",
    last_reviewed: null, review_by: null, changelog: ["1.0.0 — first."], rests_on: "Judgement.",
    elements, triggers: [], questions: [],
  });
  const el = (superseded_by: unknown) => ({ id: "example.a", name: "A", means: "B.", weight: "core", dimension: "accountability_agency", basis: "judgement", sources: [], superseded_by });

  it("takes one id or a list of ids", () => {
    expect(checkProtocol("f.md", overlay([el("apology.acknowledged-responsibility")]), prose)).toEqual([]);
    expect(checkProtocol("f.md", overlay([el(["apology.acknowledged-responsibility", LIMIT_SCOPE])]), prose)).toEqual([]);
  });

  it("refuses an empty list or a malformed id in one", () => {
    expect(checkProtocol("f.md", overlay([el([])]), prose).length).toBe(1);
    expect(checkProtocol("f.md", overlay([el(["apology.acknowledged-responsibility", "not an id"])]), prose).length).toBe(1);
  });

  it("checks every target in the list against the library", () => {
    const library = PROTOCOL_LIBRARY.map((data) => ({ file: data.id, data }));
    const crisis = PROTOCOL_LIBRARY.find((p) => p.id === "crisis-in-progress")!;
    const broken = {
      ...crisis,
      elements: crisis.elements.map((e) => (e.id === CRISIS_CHECK ? { ...e, superseded_by: [APOLOGY_CHECK, "legal-constraints.nothing"] } : e)),
    };
    const errors = checkLibrary(library.map((f) => (f.data.id === "crisis-in-progress" ? { ...f, data: broken } : f)));
    expect(errors.map((e) => e.message).join(" | ")).toContain('superseded_by "legal-constraints.nothing", which no protocol defines');
  });
});

describe("the Legal constraints overlay", () => {
  it("is switched on by the counsel box, on every event, and by nothing else", () => {
    for (const communication_event of COMMUNICATION_EVENTS) {
      expect(activeTriggers(ticked({ communication_event })), communication_event).toContain("legal-constraints");
      expect(activeTriggers({ ...base, communication_event }), communication_event).not.toContain("legal-constraints");
    }
    // Missing is unticked: requests and saved reviews from before the question.
    const { counsel_limited: _unused, ...older } = base;
    expect(activeTriggers(older)).not.toContain("legal-constraints");
  });

  it("puts its two questions in the reviewer checklist only when the box is ticked", () => {
    const asks = (r: EvaluationRequest) => checklistFor(r).flatMap((g) => g.questions.map((q) => q.ask));
    const counsel = "Does the limit described in the context match what counsel actually advised, and until when does it apply?";
    expect(asks(ticked())).toContain(counsel);
    expect(asks(base)).not.toContain(counsel);
  });

  it("sends both checks and its one trigger", () => {
    const legal = resolvedProtocols(ticked()).find((p) => p.id === "legal-constraints")!;
    expect(legal.elements.map((e) => e.id)).toEqual(["legal-constraints.declared", LIMIT_SCOPE]);
    expect(legal.triggers).toHaveLength(1);
  });
});

describe("what gives way to it", () => {
  const apologizing = { purpose: "Apologize and take responsibility" as const };
  const unfolding = { situation: "Still unfolding" as const };

  it("unticked, nothing changes: Apology's check stands and Crisis in progress's gives way to it, as before", () => {
    const ids = elementIds({ ...base, ...apologizing, ...unfolding });
    expect(ids).toContain(APOLOGY_CHECK);
    expect(ids).not.toContain(CRISIS_CHECK);
    expect(ids).not.toContain(LIMIT_SCOPE);
  });

  it("ticked with an apology: Apology's responsibility check gives way; its other checks stay", () => {
    const ids = elementIds(ticked(apologizing));
    expect(ids).toContain(LIMIT_SCOPE);
    expect(ids).not.toContain(APOLOGY_CHECK);
    expect(ids).toContain("apology.repair-offered");
  });

  it("ticked while still unfolding, with no apology: Crisis in progress's check gives way through its own link", () => {
    const ids = elementIds(ticked(unfolding));
    expect(protocolIds(ticked(unfolding))).not.toContain("apology");
    expect(ids).toContain(LIMIT_SCOPE);
    expect(ids).not.toContain(CRISIS_CHECK);
  });

  it("ticked with an apology while still unfolding: both give way, and Crisis in progress's check does not come back", () => {
    const ids = elementIds(ticked({ ...apologizing, ...unfolding }));
    expect(ids).toContain(LIMIT_SCOPE);
    expect(ids).not.toContain(APOLOGY_CHECK);
    expect(ids).not.toContain(CRISIS_CHECK);
  });

  it("stays dropped either way: with or without the explicit link, when the check it names has itself given way", () => {
    // Giving way is decided in one pass against the checks that survived the
    // earlier filters, before anything gives way. So Apology's check still
    // counts when Crisis in progress's is decided, even though it then gives
    // way itself; the chain does not reopen. The explicit link is what covers
    // the case with no apology, shown above.
    const withoutLink = PROTOCOL_LIBRARY.map((p) =>
      p.id !== "crisis-in-progress"
        ? p
        : { ...p, elements: p.elements.map((e) => (e.id === CRISIS_CHECK ? { ...e, superseded_by: APOLOGY_CHECK } : e)) },
    );
    const request = ticked({ ...apologizing, ...unfolding });
    expect(elementIds(request, withoutLink)).not.toContain(CRISIS_CHECK);
    expect(elementIds(request, withoutLink)).not.toContain(APOLOGY_CHECK);
    // And without the link, the no-apology case would keep it: the reason the link exists.
    expect(elementIds(ticked(unfolding), withoutLink)).toContain(CRISIS_CHECK);
  });
});

describe("saved reviews", () => {
  const result: EvaluationResult = {
    request_id: "r", bundle_hash: "", bundle: [], analysis: sampleAnalysis(), score: 50, band: "Strongly accountable", confidence_label: "c",
    adjustments: { dropped_findings: 0, context_flag_corrected: false, trimmed_findings: 0, thin_questions: null },
    provider: { provider: "Anthropic", model: "m" }, usage: {} as never,
  };

  it("store the answer", () => {
    expect(buildSavedReview(result, ticked()).settings.counsel_limited).toBe(true);
    expect(buildSavedReview(result, base).settings.counsel_limited).toBe(false);
  });

  it("read an older review with no answer as unticked, not as a difference", () => {
    const { counsel_limited: _unused, ...older } = buildSavedReview(result, base).settings;
    expect(settingsDrift(older as SavedSettings, base)).toEqual([]);
    expect(settingsDrift(older as SavedSettings, ticked())).toEqual(["Counsel has limited what this message can say"]);
  });
});
