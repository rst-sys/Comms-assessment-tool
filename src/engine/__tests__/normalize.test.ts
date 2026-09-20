import { describe, expect, it } from "vitest";
import { normalizeAnalysis } from "../normalize.js";
import { validateAnalysis } from "../validate.js";
import { SAMPLE_DRAFT, sampleAnalysis } from "./helpers.js";

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
    messy.agency_scan[0].suggested_edit = "leftover";
    messy.devils_advocate.disclaimer = "Just interpretations.";
    messy.devils_advocate.personas.push({ ...messy.devils_advocate.personas[0], persona: "Sixth" });
    messy.questions_before_publication = Array.from({ length: 14 }, (_, i) => `q${i}`);
    messy.specialist_review_summary = ["HR", "HR"];

    const { analysis } = validateAnalysis(normalizeAnalysis(messy), SAMPLE_DRAFT, {});
    expect(analysis.schema_version).toBe("1.0");
    expect(analysis.executive_summary.strongest_elements).toHaveLength(3);
    expect(analysis.dimensions[0]!.score).toBe(1.5);
    expect(analysis.dimensions[1]!.score).toBe(2.5);
    expect(analysis.findings[0]!.id).toBe("F-001");
    expect(analysis.findings[0]!.claim_status).toBeNull();
    expect(analysis.devils_advocate.personas).toHaveLength(5);
    expect(analysis.questions_before_publication).toHaveLength(12);
    expect(analysis.specialist_review_summary).toEqual(["HR"]);
  });

  it("does not invent missing substance: a run without ten dimensions still fails validation", () => {
    const messy = JSON.parse(JSON.stringify(sampleAnalysis())) as Record<string, any>;
    messy.dimensions = messy.dimensions.slice(0, 4);
    expect(() => validateAnalysis(normalizeAnalysis(messy), SAMPLE_DRAFT, {})).toThrow(/dimensions/);
  });

  it("leaves non-objects alone", () => {
    expect(normalizeAnalysis("nope")).toBe("nope");
  });
});

describe("protocol_review normalization", () => {
  it("keeps a well-formed review, and fixes only the casing of a status", () => {
    const raw = {
      protocol_review: {
        protocol: "Effective apology",
        source: "Lewicki et al. (2016)",
        elements: [
          { name: "Expression of regret", status: "present", note: "Says sorry in the first line." },
          { name: "Offer of repair", status: "ABSENT", note: "No commitment to undo the damage." },
          { name: "Request for forgiveness", status: "Partial", note: "Implied only." },
        ],
      },
    };
    const out = normalizeAnalysis(raw) as { protocol_review: { protocol: string; elements: { status: string }[] } };
    expect(out.protocol_review.elements.map((e) => e.status)).toEqual(["Present", "Absent", "Partial"]);
    expect(out.protocol_review.protocol).toBe("Effective apology");
  });

  it("leaves an unrecognized status alone so the validator rejects it, and nulls a non-object", () => {
    const out = normalizeAnalysis({
      protocol_review: { protocol: "p", source: "s", elements: [{ name: "n", status: "Maybe", note: "x" }] },
    }) as { protocol_review: { elements: { status: string }[] } };
    expect(out.protocol_review.elements[0]!.status).toBe("Maybe");

    expect((normalizeAnalysis({}) as { protocol_review: unknown }).protocol_review).toBeNull();
    expect((normalizeAnalysis({ protocol_review: "none" }) as { protocol_review: unknown }).protocol_review).toBeNull();
  });
});
