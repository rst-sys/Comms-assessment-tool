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

describe("enum casing, which the provider's grammar used to absorb", () => {
  it("repairs the ASSERTED/Asserted mismatch the prompt itself causes", () => {
    const out = normalizeAnalysis({
      findings: [{ id: "F-001", dimension: "accountability_agency", severity: "HIGH", claim_status: "ASSERTED", specialist_review_type: "hr" }],
    }) as { findings: { severity: string; claim_status: string; specialist_review_type: string }[] };
    expect(out.findings[0]!.severity).toBe("High");
    expect(out.findings[0]!.claim_status).toBe("Asserted");
    expect(out.findings[0]!.specialist_review_type).toBe("HR");
  });

  it("repairs the scan, summary and review-summary values too", () => {
    const out = normalizeAnalysis({
      executive_summary: { risk_level: "moderate", readiness: "REVISE BEFORE ISSUING" },
      agency_scan: [{ phrase: "headwinds", category: "external weather", severity: "low", assessment: "legitimate context" }],
      specialist_review_summary: ["legal", "investor relations"],
    }) as {
      executive_summary: { risk_level: string; readiness: string };
      agency_scan: { category: string; severity: string; assessment: string }[];
      specialist_review_summary: string[];
    };
    expect(out.executive_summary.risk_level).toBe("Moderate");
    expect(out.executive_summary.readiness).toBe("Revise before issuing");
    expect(out.agency_scan[0]).toMatchObject({ category: "External weather", severity: "Low", assessment: "Legitimate context" });
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
