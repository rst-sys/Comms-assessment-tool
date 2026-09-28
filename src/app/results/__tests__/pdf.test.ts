import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EvaluationResult } from "../../../engine/evaluate.js";
import { DEMO_1 } from "../../../engine/fixtures.js";
import { buildReviewPdf, reviewPdfFilename } from "../pdf.js";
import { CHECKLIST_TITLE, checklistFor, checklistSize } from "../../../engine/checklist.js";
import { AI_SUMMARY_DISCLAIMER, AI_SUMMARY_HEADING, REPORTER_QUESTION } from "../../copy.js";

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

  it("names the file from the communication event and date", () => {
    expect(reviewPdfFilename(DEMO_1.request, new Date("2026-09-19T12:00:00Z"))).toBe("trustability-review-layoffs-or-job-cuts-2026-09-19.pdf");
  });
});

describe("the reviewer checklist in the export", () => {
  it("prints every checklist question, with its group headings", () => {
    // The PDF is what gets forwarded to Legal and HR, so the checklist has to
    // travel with it — it is the half of the questions addressed to them.
    const result = load("demo1");
    const doc = buildReviewPdf(result, DEMO_1.request, new Date("2026-09-19T12:00:00Z"));
    const groups = checklistFor(DEMO_1.request);
    expect(checklistSize(groups)).toBeGreaterThan(0);

    // jsPDF keeps the drawn strings on its internal page content; read them
    // back rather than trusting that the call was made.
    const printed = pdfText(doc);
    expect(printed).toContain(CHECKLIST_TITLE);
    for (const group of groups) {
      expect(printed, `group ${group.name}`).toContain(`${group.name} (${group.questions.length})`);
      for (const q of group.questions) {
        // Wrapping breaks lines, so match on a distinctive run of words.
        const probe = q.ask.split(/\s+/).slice(0, 5).join(" ");
        expect(printed, probe).toContain(probe);
      }
    }
  });
});

describe("the AI summary in the export", () => {
  const summary = "The company says it is cutting jobs. It does not say who decided or why.";

  it("prints the heading, the disclaimer straight after it, then the summary, after the Devil's Advocate", () => {
    const result = load("demo1");
    result.analysis.ai_summary = summary;
    const printed = pdfText(buildReviewPdf(result, DEMO_1.request, new Date("2026-09-19T12:00:00Z")));
    const heading = printed.indexOf(AI_SUMMARY_HEADING);
    expect(heading).toBeGreaterThan(printed.indexOf(REPORTER_QUESTION.slice(0, 30)));
    // Wrapping splits lines with a space, so compare with spacing collapsed.
    const tidy = (t: string) => t.replace(/\s+/g, " ");
    const after = tidy(printed.slice(heading + AI_SUMMARY_HEADING.length)).trim();
    expect(after.startsWith(tidy(AI_SUMMARY_DISCLAIMER))).toBe(true);
    expect(after.slice(AI_SUMMARY_DISCLAIMER.length).trim().startsWith(summary)).toBe(true);
  });

  it("prints neither heading nor disclaimer when there is no summary", () => {
    const printed = pdfText(buildReviewPdf(load("demo1"), DEMO_1.request, new Date("2026-09-19T12:00:00Z")));
    expect(printed).not.toContain(AI_SUMMARY_HEADING);
    expect(printed).not.toContain("An illustration only");
  });
});

/** Every string jsPDF drew, with line wrapping undone. */
function pdfText(doc: ReturnType<typeof buildReviewPdf>): string {
  const pages = (doc as unknown as { internal: { pages: string[][] } }).internal.pages;
  const out: string[] = [];
  for (const page of pages) {
    if (!page) continue;
    for (const line of page) {
      for (const m of String(line).matchAll(/\((.*?)\)\s*Tj/g)) out.push(m[1] ?? "");
    }
  }
  return out.join(" ").replace(/\\(\d{3})/g, (_, o: string) => String.fromCharCode(parseInt(o, 8))).replace(/\\/g, "");
}
