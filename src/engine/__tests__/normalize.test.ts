import { describe, expect, it } from "vitest";
import { MAX_QUESTIONS } from "../limits.js";
import { normalizeAnalysis, reviewType } from "../normalize.js";
import { validateAnalysis } from "../validate.js";
import { SAMPLE_DRAFT, sampleAnalysis } from "./helpers.js";
import { SPECIALIST_REVIEW_TYPES } from "../types.js";

describe("normalizeAnalysis", () => {
  it("repairs harmless deviations so the strict validator passes", () => {
    const messy = JSON.parse(JSON.stringify(sampleAnalysis())) as Record<string, any>;
    delete messy.schema_version;
    messy.extra_top_level = "ignored";
    messy.executive_summary.context_supplied = "false";
    messy.executive_summary.strongest_elements.push("a fourth");
    messy.dimensions[0].score = 1.3;
    messy.dimensions[1].score = "2.5";
    messy.findings[0].claim_status = undefined;
    messy.findings[0].fact_validation_needed = undefined;
    messy.findings[0].note = "extra";
    delete messy.findings[0].id;
    messy.devils_advocate.disclaimer = "Just interpretations.";
    messy.devils_advocate.personas.push({ ...messy.devils_advocate.personas[0], persona: "Sixth" });
    messy.questions_before_publication = Array.from({ length: 14 }, (_, i) => `q${i}`);
    messy.specialist_review_summary = ["HR", "HR"];

    const { analysis } = validateAnalysis(normalizeAnalysis(messy), SAMPLE_DRAFT, "");
    expect(analysis.schema_version).toBe("1.0");
    expect(analysis.executive_summary.strongest_elements).toHaveLength(3);
    expect(analysis.dimensions[0]!.score).toBe(1.5);
    expect(analysis.dimensions[1]!.score).toBe(2.5);
    expect(analysis.findings[0]!.id).toBe("F-001");
    expect(analysis.findings[0]!.claim_status).toBeNull();
    expect(analysis.devils_advocate.personas).toHaveLength(5);
    expect(analysis.questions_before_publication).toHaveLength(MAX_QUESTIONS);
    expect(analysis.specialist_review_summary).toEqual(["HR"]);
  });

  it("does not invent missing substance: a run without ten dimensions still fails validation", () => {
    const messy = JSON.parse(JSON.stringify(sampleAnalysis())) as Record<string, any>;
    messy.dimensions = messy.dimensions.slice(0, 4);
    expect(() => validateAnalysis(normalizeAnalysis(messy), SAMPLE_DRAFT, "")).toThrow(/dimensions/);
  });

  it("leaves non-objects alone", () => {
    expect(normalizeAnalysis("nope")).toBe("nope");
  });
});

describe("enum casing, which the provider's grammar used to absorb", () => {
  it("repairs the ASSERTED/Asserted mismatch the prompt itself causes", () => {
    const out = normalizeAnalysis({
      findings: [{ id: "F-001", dimension: "accountability_agency", severity: "HIGH", claim_status: "ASSERTED", specialist_review_type: "hr" }],
    }) as { findings: { severity: string; claim_status: string; specialist_review_type: string }[] };
    expect(out.findings[0]!.severity).toBe("High");
    expect(out.findings[0]!.claim_status).toBe("Asserted");
    expect(out.findings[0]!.specialist_review_type).toBe("HR");
  });

  it("repairs the summary and review-summary values too", () => {
    const out = normalizeAnalysis({
      executive_summary: { risk_level: "moderate" },
      specialist_review_summary: ["legal", "investor relations"],
    }) as {
      executive_summary: { risk_level: string };
      specialist_review_summary: string[];
    };
    expect(out.executive_summary.risk_level).toBe("Moderate");
    expect(out.specialist_review_summary).toEqual(["Legal", "Investor relations"]);
  });

  it("leaves a value it does not recognize alone, so the validator still rejects it", () => {
    const out = normalizeAnalysis({
      executive_summary: { risk_level: "Catastrophic" },
      findings: [{ id: "F-001", severity: "Urgent" }],
    }) as { executive_summary: { risk_level: string }; findings: { severity: string }[] };
    expect(out.executive_summary.risk_level).toBe("Catastrophic");
    expect(out.findings[0]!.severity).toBe("Urgent");
  });

  it("keeps a null claim_status null rather than turning it into a string", () => {
    const out = normalizeAnalysis({
      findings: [{ id: "F-001", claim_status: null, specialist_review_type: null }],
    }) as { findings: { claim_status: unknown; specialist_review_type: unknown }[] };
    expect(out.findings[0]!.claim_status).toBeNull();
    expect(out.findings[0]!.specialist_review_type).toBeNull();
  });
});

describe("tolerating a shape the model reached for, instead of losing the review", () => {
  const base = () => JSON.parse(JSON.stringify(sampleAnalysis()));

  it("reads questions back out of an object keyed by reviewer", () => {
    // The live failure: the model grouped its questions under headings instead
    // of listing them. arr() turned that into [], and an empty questions list
    // is the one thing the validator refuses, so a complete review was lost.
    const raw = base();
    raw.questions_before_publication = {
      Legal: ["Which duties may apply here?", "Has counsel confirmed the timing?"],
      HR: ["Have affected employees been told?"],
    };
    const repairs: string[] = [];
    const out = normalizeAnalysis(raw, repairs) as { questions_before_publication: string[] };
    expect(out.questions_before_publication).toEqual([
      "Which duties may apply here?",
      "Has counsel confirmed the timing?",
      "Have affected employees been told?",
    ]);
    expect(repairs).toContain("questions_reshaped");
  });

  it("reads a question out of the {ask, review} shape the protocols are written in", () => {
    const raw = base();
    raw.questions_before_publication = [
      { ask: "Which entities may require notice?", review: ["Legal", "Labor"] },
      "A plain one.",
    ];
    const out = normalizeAnalysis(raw) as { questions_before_publication: string[] };
    expect(out.questions_before_publication).toEqual(["Which entities may require notice?", "A plain one."]);
  });

  it("keeps the first N questions and counts the rest, rather than failing", () => {
    const raw = base();
    raw.questions_before_publication = Array.from({ length: MAX_QUESTIONS + 4 }, (_, i) => `Question ${i + 1}?`);
    const repairs: string[] = [];
    const out = normalizeAnalysis(raw, repairs) as { questions_before_publication: string[] };
    expect(out.questions_before_publication).toHaveLength(MAX_QUESTIONS);
    // The prompt asks for most important first, so the tail is the least material.
    expect(out.questions_before_publication[0]).toBe("Question 1?");
    expect(repairs).toContain("questions_trimmed:4");
  });

  it("invents nothing when there is no text in the shape at all", () => {
    const raw = base();
    raw.questions_before_publication = [{}, { review: ["Legal"] }, "   "];
    const out = normalizeAnalysis(raw) as { questions_before_publication: string[] };
    expect(out.questions_before_publication).toEqual([]);
  });

  it("maps a review value it recognizes and drops one it does not", () => {
    expect(reviewType("Works council")).toBe("Labor");
    expect(reviewType("infosec")).toBe("Information security");
    expect(reviewType("H&S")).toBeNull();
    expect(reviewType("health and safety")).toBe("Health and safety");
    expect(reviewType("Marketing")).toBeNull();
    // Exact spellings are untouched.
    for (const t of SPECIALIST_REVIEW_TYPES) expect(reviewType(t)).toBe(t);
  });

  it("logs a code for a mapped or dropped tag, and never the model's prose", () => {
    const repairs: string[] = [];
    reviewType("Works council", repairs);
    reviewType("Marketing", repairs);
    // A value long enough to be prose is never echoed.
    reviewType("Legal, because the draft says we will notify everyone by Friday", repairs);
    expect(repairs).toEqual([
      "review_value_mapped:Works council>Labor",
      "review_value_dropped:Marketing",
      "review_value_dropped:unprintable",
    ]);
  });

  it("drops an unknown tag from a finding rather than failing the whole analysis", () => {
    const raw = base();
    raw.findings[0].specialist_review_needed = true;
    raw.findings[0].specialist_review_type = "Marketing";
    raw.specialist_review_summary = ["Works council", "Marketing", "Legal"];
    const out = normalizeAnalysis(raw) as {
      findings: { specialist_review_type: string | null }[];
      specialist_review_summary: string[];
    };
    expect(out.findings[0]!.specialist_review_type).toBeNull();
    expect(out.specialist_review_summary).toEqual(["Labor", "Legal"]);
    // And the whole thing still passes the strict validator.
    expect(() => validateAnalysis(out, SAMPLE_DRAFT, "")).not.toThrow();
  });
});
