import { describe, expect, it } from "vitest";
import { AnalysisValidationError, contextWasSupplied, decodeStrayEscapes, findVerbatim, validateAnalysis } from "../validate.js";
import { SAMPLE_DRAFT, sampleAnalysis, sampleFinding } from "./helpers.js";

describe("validateAnalysis", () => {
  it("accepts a well-formed analysis unchanged", () => {
    const { analysis, adjustments } = validateAnalysis(sampleAnalysis(), SAMPLE_DRAFT, {});
    expect(analysis.findings).toHaveLength(1);
    expect(analysis.agency_scan).toHaveLength(1);
    expect(adjustments).toEqual({
      dropped_findings: 0,
      dropped_scan_phrases: 0,
      context_flag_corrected: false,
      trimmed_findings: 0,
    });
  });

  it("rejects a schema violation and reports only the path", () => {
    const bad = sampleAnalysis();
    (bad.executive_summary as { risk_level: string }).risk_level = "Severe";
    expect(() => validateAnalysis(bad, SAMPLE_DRAFT, {})).toThrowError(AnalysisValidationError);
    try {
      validateAnalysis(bad, SAMPLE_DRAFT, {});
    } catch (error) {
      const e = error as AnalysisValidationError;
      expect(e.path).toBe("/executive_summary/risk_level");
      expect(e.message).not.toContain("Rapid growth");
    }
  });

  it("rejects the wrong number of dimensions, a duplicate id, and a non-0.5 score", () => {
    const missing = sampleAnalysis();
    missing.dimensions = missing.dimensions.slice(1);
    expect(() => validateAnalysis(missing, SAMPLE_DRAFT, {})).toThrow(/expected 10 dimensions/);

    const duplicate = sampleAnalysis();
    duplicate.dimensions[1] = { ...duplicate.dimensions[0]! };
    expect(() => validateAnalysis(duplicate, SAMPLE_DRAFT, {})).toThrow(/duplicate dimension id/);

    const step = sampleAnalysis();
    step.dimensions[0]!.score = 2.3;
    expect(() => validateAnalysis(step, SAMPLE_DRAFT, {})).toThrow(/0\.5 step/);
  });

  it("rejects the wrong persona count, question count, and summary list sizes", () => {
    const personas = sampleAnalysis();
    personas.devils_advocate.personas.pop();
    expect(() => validateAnalysis(personas, SAMPLE_DRAFT, {})).toThrow(/exactly 5 personas/);

    const fewQuestions = sampleAnalysis({ questions_before_publication: ["a", "b"] });
    expect(() => validateAnalysis(fewQuestions, SAMPLE_DRAFT, {})).toThrow(/5-12 questions/);

    const manyQuestions = sampleAnalysis({ questions_before_publication: Array.from({ length: 13 }, (_, i) => `q${i}`) });
    expect(() => validateAnalysis(manyQuestions, SAMPLE_DRAFT, {})).toThrow(/5-12 questions/);

    const strongest = sampleAnalysis();
    strongest.executive_summary.strongest_elements = ["one"];
    expect(() => validateAnalysis(strongest, SAMPLE_DRAFT, {})).toThrow(/strongest_elements/);
  });

  it("rejects a finding with neither excerpt nor omission", () => {
    const bad = sampleAnalysis({ findings: [sampleFinding({ excerpt: null, omission: null })] });
    expect(() => validateAnalysis(bad, SAMPLE_DRAFT, {})).toThrow(/both null/);
  });

  it("drops findings whose excerpt is not verbatim in the draft and counts the drop", () => {
    const analysis = sampleAnalysis({
      findings: [
        sampleFinding({ id: "F-001", excerpt: "Rapid growth brought complexity." }),
        sampleFinding({ id: "F-002", excerpt: "This sentence is not in the draft." }),
        sampleFinding({ id: "F-003", excerpt: null, omission: "No verification is offered." }),
      ],
    });
    analysis.agency_scan[0]!.finding_id = "F-002";
    const { analysis: out, adjustments } = validateAnalysis(analysis, SAMPLE_DRAFT, {});
    expect(out.findings.map((f) => f.id)).toEqual(["F-001", "F-003"]);
    expect(adjustments.dropped_findings).toBe(1);
    // The scan entry that pointed at the dropped finding now points nowhere.
    expect(out.agency_scan[0]!.finding_id).toBeNull();
  });

  it("drops agency-scan phrases that are not in the draft", () => {
    const analysis = sampleAnalysis();
    analysis.agency_scan.push({ ...analysis.agency_scan[0]!, phrase: "market headwinds", finding_id: null });
    const { analysis: out, adjustments } = validateAnalysis(analysis, SAMPLE_DRAFT, {});
    expect(out.agency_scan).toHaveLength(1);
    expect(adjustments.dropped_scan_phrases).toBe(1);
  });

  it("normalizes excerpts that differ only in whitespace or quote style to the draft's text", () => {
    const draft = 'We said “we take this seriously”\nand moved on.';
    const analysis = sampleAnalysis({ findings: [sampleFinding({ excerpt: 'We said "we take this seriously" and moved on.' })], agency_scan: [] });
    const { analysis: out, adjustments } = validateAnalysis(analysis, draft, {});
    expect(adjustments.dropped_findings).toBe(0);
    expect(out.findings[0]!.excerpt).toBe('We said “we take this seriously”\nand moved on.');
  });




  it("sets context_supplied from the request, not the model", () => {
    const analysis = sampleAnalysis();
    analysis.executive_summary.context_supplied = true;
    const { analysis: out, adjustments } = validateAnalysis(analysis, SAMPLE_DRAFT, {});
    expect(out.executive_summary.context_supplied).toBe(false);
    expect(adjustments.context_flag_corrected).toBe(true);

    const withContext = validateAnalysis(sampleAnalysis(), SAMPLE_DRAFT, { known_facts: "The CEO decided." });
    expect(withContext.analysis.executive_summary.context_supplied).toBe(true);
  });

  it("unions specialist review types from findings into the summary", () => {
    const analysis = sampleAnalysis({
      findings: [
        sampleFinding({ id: "F-001", specialist_review_type: "HR" }),
        sampleFinding({ id: "F-002", specialist_review_type: "Labor" }),
      ],
      specialist_review_summary: ["Legal"],
    });
    const { analysis: out } = validateAnalysis(analysis, SAMPLE_DRAFT, {});
    expect([...out.specialist_review_summary].sort()).toEqual(["HR", "Labor", "Legal"]);
  });

  it("rejects the wrong disclaimer text", () => {
    const analysis = sampleAnalysis();
    (analysis.devils_advocate as { disclaimer: string }).disclaimer = "Just opinions.";
    expect(() => validateAnalysis(analysis, SAMPLE_DRAFT, {})).toThrowError(AnalysisValidationError);
  });
});

describe("findVerbatim", () => {
  it("returns the exact substring when present", () => {
    expect(findVerbatim("a b c", "b c")).toBe("b c");
  });
  it("returns null when absent", () => {
    expect(findVerbatim("a b c", "x")).toBeNull();
    expect(findVerbatim("a b c", "   ")).toBeNull();
  });
  it("tolerates whitespace runs and returns the draft's own text", () => {
    expect(findVerbatim("one  two\nthree", "one two three")).toBe("one  two\nthree");
  });
  it("escapes regex metacharacters", () => {
    expect(findVerbatim("cost (est.) $5?", "(est.) $5?")).toBe("(est.) $5?");
  });
});

describe("contextWasSupplied", () => {
  it("is false for empty or whitespace-only fields", () => {
    expect(contextWasSupplied({})).toBe(false);
    expect(contextWasSupplied({ known_facts: "   " })).toBe(false);
  });
  it("is true when any field has text", () => {
    expect(contextWasSupplied({ desired_tone: "calm" })).toBe(true);
  });
});

describe("decodeStrayEscapes", () => {
  it("turns literal backslash-u sequences into characters, everywhere in the object", () => {
    const decoded = decodeStrayEscapes({ a: "one \\u2014 two", b: ["x\\u00e9"], c: { d: 1, e: null } });
    expect(decoded).toEqual({ a: "one \u2014 two", b: ["x\u00e9"], c: { d: 1, e: null } });
  });
  it("is applied during validation", () => {
    const analysis = sampleAnalysis();
    analysis.findings[0]!.finding = "Name it \\u2014 plainly.";
    const { analysis: out } = validateAnalysis(analysis, SAMPLE_DRAFT, {});
    expect(out.findings[0]!.finding).toBe("Name it \u2014 plainly.");
  });
});

describe("personas with nothing in them", () => {
  const FIELDS = ["persona", "might_say"] as const;

  it("rejects a persona whose text field is empty, and names which one", () => {
    // How the live site came to show empty tiles: the schema types these as
    // strings, and an empty string used to satisfy every check.
    for (const field of FIELDS) {
      const bad = sampleAnalysis();
      bad.devils_advocate.personas[1]![field] = "";
      try {
        validateAnalysis(bad, SAMPLE_DRAFT, {});
        throw new Error(`${field} was accepted empty`);
      } catch (error) {
        expect(error).toBeInstanceOf(AnalysisValidationError);
        expect((error as AnalysisValidationError).path).toBe(`/devils_advocate/personas/1/${field}`);
      }
    }
  });

  it("rejects whitespace as loudly as an empty string", () => {
    const bad = sampleAnalysis();
    bad.devils_advocate.personas[0]!.might_say = "   \n ";
    expect(() => validateAnalysis(bad, SAMPLE_DRAFT, {})).toThrowError(AnalysisValidationError);
  });

  it("rejects an empty most damning interpretation", () => {
    const bad = sampleAnalysis();
    bad.devils_advocate.most_damaging_interpretation = "";
    expect(() => validateAnalysis(bad, SAMPLE_DRAFT, {})).toThrowError(AnalysisValidationError);
  });

  it("accepts personas that are actually filled in", () => {
    expect(() => validateAnalysis(sampleAnalysis(), SAMPLE_DRAFT, {})).not.toThrow();
  });
});
