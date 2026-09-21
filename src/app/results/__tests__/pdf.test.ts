import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { DEMO_1 } from "../../../engine/fixtures.js";
import { buildReviewPdf, reviewPdfFilename } from "../pdf.js";
import { APOLOGY_PROTOCOL } from "../../../engine/protocols.js";

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

describe("buildReviewPdf", () => {
  it("builds a multi-page PDF that carries the summary, findings, and the closing principle", () => {
    const result = load("demo1");
    result.analysis.executive_summary.headline = "Job cuts announced with no owner, criteria, or support";
    const doc = buildReviewPdf(result, DEMO_1.request, new Date("2026-09-19T12:00:00Z"));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(6);
    const bytes = new Uint8Array(doc.output("arraybuffer"));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(20_000);
  });

  it("names the file from the communication type and date", () => {
    expect(reviewPdfFilename(DEMO_1.request, new Date("2026-09-19T12:00:00Z"))).toBe("trustability-review-layoff-or-restructuring-2026-09-19.pdf");
  });
});

describe("the apology protocol in the PDF (revision 23)", () => {
  it("adds no section, because the panel was removed from the review", () => {
    const plain = load("demo1");
    const without = buildReviewPdf(plain, DEMO_1.request, new Date("2026-09-21T12:00:00Z")).getNumberOfPages();

    const withProtocol = load("demo1");
    withProtocol.analysis.protocol_review = {
      protocol: APOLOGY_PROTOCOL.name,
      source: APOLOGY_PROTOCOL.source,
      elements: APOLOGY_PROTOCOL.elements.map((e) => ({ name: e.name, status: "Absent" as const, note: "n" })),
    };
    const doc = buildReviewPdf(withProtocol, DEMO_1.request, new Date("2026-09-21T12:00:00Z"));
    // Same length: the engine still applies the research, the export no longer prints it.
    expect(doc.getNumberOfPages()).toBe(without);
    expect(String.fromCharCode(...new Uint8Array(doc.output("arraybuffer")).slice(0, 5))).toBe("%PDF-");
  });
});
