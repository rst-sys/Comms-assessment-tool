import { jsPDF } from "jspdf";
import { describe, expect, it } from "vitest";
import { ACCEPTED_EXTENSIONS, clampDocumentText, DocumentReadError, extensionOf, readPdfText } from "../documents.js";

function samplePdf(lines: string[]): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFontSize(12);
  lines.forEach((line, i) => {
    if (i > 0) doc.addPage();
    doc.text(doc.splitTextToSize(line, 170), 15, 20);
  });
  return doc.output("arraybuffer");
}

describe("readPdfText", () => {
  it("reads the text of every page", async () => {
    const pdf = samplePdf([
      "Employee FAQ. Q: How were roles selected? A: By scope and skills overlap, reviewed by HR.",
      "Page two: relocation support and a 90-day decision window are described in the HR portal.",
    ]);
    const text = await readPdfText(pdf);
    expect(text).toContain("How were roles selected?");
    expect(text).toContain("reviewed by HR");
    expect(text).toContain("90-day decision window");
  });

  it("joins lines the PDF wrapped, so phrases stay whole", async () => {
    const text = await readPdfText(samplePdf(["Roles were selected on scope and skills overlap, and the selection was reviewed by HR before anyone was told."]));
    expect(text).toContain("reviewed by HR");
    expect(text).not.toMatch(/\bby\nHR\b/);
  });

  it("says plainly when a PDF has no text to read", async () => {
    const empty = () => new jsPDF({ unit: "mm", format: "a4" }).output("arraybuffer");
    await expect(readPdfText(empty())).rejects.toThrowError(DocumentReadError);
    await expect(readPdfText(empty())).rejects.toThrow(/no text to read/);
  });

  it("leaves the caller's buffer usable", async () => {
    const pdf = samplePdf(["A short supporting note for the audience."]);
    await readPdfText(pdf);
    expect(pdf.byteLength).toBeGreaterThan(0);
    await expect(readPdfText(pdf)).resolves.toContain("supporting note");
  });

  it("says plainly when the file is not a PDF at all", async () => {
    await expect(readPdfText(new TextEncoder().encode("this is not a pdf").buffer as ArrayBuffer)).rejects.toThrow(/could not be opened/);
  });
});

describe("file types", () => {
  it("accepts text, markdown, Word and PDF", () => {
    expect(ACCEPTED_EXTENSIONS).toEqual([".txt", ".md", ".docx", ".pdf"]);
    expect(extensionOf("Employee FAQ.PDF")).toBe(".pdf");
    expect(extensionOf("noextension")).toBe("");
  });
  it("trims a document to the limit", () => {
    const long = "x".repeat(20_001);
    expect(clampDocumentText(long).trimmed).toBe(true);
    expect(clampDocumentText(long).text.length).toBeLessThanOrEqual(20_000);
    expect(clampDocumentText("short").trimmed).toBe(false);
  });
});
