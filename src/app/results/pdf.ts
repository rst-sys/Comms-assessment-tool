/**
 * A text-based PDF of the whole review (PROMPT.md revision 7): summary,
 * scorecard, findings with their flagged language, Devil's Advocate, questions, and the
 * closing principle and disclaimer. Built with jsPDF from the analysis
 * data, not from a screenshot, so the text is selectable and searchable.
 */
import { jsPDF } from "jspdf";
import type { EvaluationResult } from "../../engine/evaluate.js";
import { DIMENSION_IDS, type EvaluationRequest } from "../../engine/types.js";
import { DIMENSION_LABELS, DIMENSION_WEIGHTS, rankFindings } from "../../engine/scoring.js";
import { APP_NAME, COPYRIGHT, CORE_PRINCIPLE, REPORTER_QUESTION } from "../copy.js";
import { KIND_LABEL, REACH_LABEL } from "../intake/AudienceDocuments.js";
import { reviewTagsFor } from "./model.js";
import { scoringNoteText } from "./ScoringNote.js";

const PAGE = { width: 210, height: 297, margin: 18 };
const TEXT_WIDTH = PAGE.width - PAGE.margin * 2;

class Writer {
  readonly doc: jsPDF;
  private y = PAGE.margin;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.doc.setFont("helvetica", "normal");
  }

  private lineHeight(pt: number): number {
    return pt * 0.3528 * 1.35;
  }

  private ensure(height: number): void {
    if (this.y + height > PAGE.height - PAGE.margin) {
      this.doc.addPage();
      this.y = PAGE.margin;
    }
  }

  pageBreak(): void {
    this.doc.addPage();
    this.y = PAGE.margin;
  }

  space(mm = 3): void {
    this.y += mm;
  }

  heading(text: string, pt = 15): void {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(pt);
    const lines = this.doc.splitTextToSize(text, TEXT_WIDTH) as string[];
    this.ensure(lines.length * this.lineHeight(pt) + 4);
    this.y += this.lineHeight(pt) * 0.4;
    this.doc.text(lines, PAGE.margin, this.y);
    this.y += lines.length * this.lineHeight(pt) + 1.5;
    this.doc.setFont("helvetica", "normal");
  }

  label(text: string): void {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(74, 85, 104);
    this.ensure(this.lineHeight(8.5) + 2);
    this.y += 1.5;
    this.doc.text(text.toUpperCase(), PAGE.margin, this.y);
    this.y += this.lineHeight(8.5);
    this.doc.setTextColor(20, 33, 61);
    this.doc.setFont("helvetica", "normal");
  }

  paragraph(text: string, pt = 10.5, indent = 0, style: "normal" | "bold" | "italic" = "normal"): void {
    if (!text) return;
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(pt);
    const lines = this.doc.splitTextToSize(text, TEXT_WIDTH - indent) as string[];
    const lh = this.lineHeight(pt);
    for (const line of lines) {
      this.ensure(lh);
      this.doc.text(line, PAGE.margin + indent, this.y);
      this.y += lh;
    }
    this.y += lh * 0.35;
    this.doc.setFont("helvetica", "normal");
  }

  bullets(items: string[], numbered = false): void {
    items.forEach((item, i) => {
      const marker = numbered ? `${i + 1}.` : "•";
      this.doc.setFontSize(10.5);
      const lines = this.doc.splitTextToSize(item, TEXT_WIDTH - 7) as string[];
      const lh = this.lineHeight(10.5);
      lines.forEach((line, j) => {
        this.ensure(lh);
        if (j === 0) this.doc.text(marker, PAGE.margin + 1, this.y);
        this.doc.text(line, PAGE.margin + 7, this.y);
        this.y += lh;
      });
      this.y += lh * 0.2;
    });
    this.y += 1.5;
  }

  rule(): void {
    this.ensure(4);
    this.doc.setDrawColor(227, 223, 214);
    this.doc.line(PAGE.margin, this.y, PAGE.width - PAGE.margin, this.y);
    this.y += 4;
  }

  footerOnEveryPage(text: string): void {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(74, 85, 104);
      this.doc.text(text, PAGE.margin, PAGE.height - 10);
      this.doc.text(`${i} / ${pages}`, PAGE.width - PAGE.margin, PAGE.height - 10, { align: "right" });
      this.doc.setTextColor(20, 33, 61);
    }
  }
}

export function buildReviewPdf(result: EvaluationResult, request: EvaluationRequest, now = new Date()): jsPDF {
  const a = result.analysis;
  const s = a.executive_summary;
  const w = new Writer();

  w.heading(APP_NAME, 12);
  w.paragraph(`${request.communication_type} · ${request.primary_audience} · ${request.setting} · ${request.market} · ${now.toISOString().slice(0, 10)}`, 9);
  w.rule();

  w.heading("Executive summary", 15);
  if (s.headline) w.heading(s.headline, 13);
  w.label("Accountable Communication Score");
  w.paragraph(`${result.score} / 100 — ${result.band}`, 12, 0, "bold");
  w.label("Risk level");
  w.paragraph(s.risk_level);
  if (request.already_published) {
    w.label("Retrospective");
    w.paragraph("Already issued", 10.5, 0, "bold");
  }
  if (request.stance === "reactive" && request.reacting_to) {
    w.label("Reacting to");
    w.paragraph(request.reacting_to);
  }
  if (request.audience_documents?.length) {
    w.label("Audience context considered");
    w.bullets(request.audience_documents.map((d) => `${KIND_LABEL[d.kind]}: ${d.title}${d.description ? ` — ${d.description}` : ""} (${d.delivery || "delivery not described"}; ${REACH_LABEL[d.reach].toLowerCase()}${d.kind === "supporting" ? (d.same_time ? "; same time" : "; later") : ""})`));
  }
  w.label("Strongest elements");
  w.bullets(s.strongest_elements);
  w.label("Priority improvements");
  w.bullets(s.priority_improvements);

  w.label("How the scoring works");
  w.paragraph(scoringNoteText(result, s.context_supplied), 9.5);

  w.pageBreak();
  w.heading("Scorecard", 15);
  const byId = new Map(a.dimensions.map((d) => [d.id, d]));
  for (const id of DIMENSION_IDS) {
    const d = byId.get(id);
    if (!d) continue;
    w.paragraph(`${DIMENSION_LABELS[id]} — ${d.score.toFixed(1)} / 5 (weight ${DIMENSION_WEIGHTS[id]})`, 10.5, 0, "bold");
    w.paragraph(d.rationale, 10, 4);
    w.paragraph(`What would raise this: ${d.would_raise}`, 10, 4, "italic");
  }

  w.pageBreak();
  w.heading("Findings", 15);
  w.paragraph(`${a.findings.length} finding${a.findings.length === 1 ? "" : "s"}, highest severity first.`, 9.5);
  for (const f of rankFindings(a.findings)) {
    w.rule();
    w.paragraph(`${f.id} · ${f.severity} · ${DIMENSION_LABELS[f.dimension]}${f.claim_status ? ` · ${f.claim_status}` : ""}`, 9.5, 0, "bold");
    w.paragraph(f.finding, 10.5, 0, "bold");
    w.label("Ways to fix this");
    w.paragraph(f.recommended_action);
    w.paragraph(`Fact validation: ${f.fact_validation_needed ? "needed" : "not flagged"} · Specialist review: ${f.specialist_review_needed ? f.specialist_review_type ?? "needed" : "not flagged"}`, 9);
  }

  w.pageBreak();
  w.heading("Devil's Advocate: how skeptical audiences may read this", 15);
  w.label("Most damaging interpretation if issued as is");
  w.paragraph(a.devils_advocate.most_damaging_interpretation, 10.5, 0, "bold");
  w.paragraph(a.devils_advocate.disclaimer, 9.5, 0, "italic");
  for (const p of a.devils_advocate.personas) {
    w.paragraph(`${p.persona} might say: “${p.might_say}”`, 10.5, 4);
  }
  w.label("Ask yourself");
  w.paragraph(REPORTER_QUESTION, 10.5, 0, "italic");

  w.pageBreak();
  w.heading("Questions worth asking", 15);
  // Tagged in place rather than repeated in a separate specialist checklist.
  w.bullets(
    a.questions_before_publication.map((q) => {
      const tags = reviewTagsFor(q);
      return tags.length ? `${q}  [${tags.join(", ")}]` : q;
    }),
    true,
  );

  w.space(6);
  w.rule();
  w.paragraph(CORE_PRINCIPLE, 10.5, 0, "italic");
  w.paragraph(COPYRIGHT, 9);
  w.paragraph(`Evaluated by ${result.provider.provider} (${result.provider.model}). Request ${result.request_id}.`, 8.5);

  w.footerOnEveryPage(`${APP_NAME} · Confidential · decision support only`);
  return w.doc;
}

export function reviewPdfFilename(request: EvaluationRequest, now = new Date()): string {
  const type = request.communication_type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `trustability-review-${type}-${now.toISOString().slice(0, 10)}.pdf`;
}
