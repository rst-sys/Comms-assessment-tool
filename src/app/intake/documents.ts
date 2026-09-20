/**
 * Reading audience context documents in the browser. Plain text and Markdown
 * are read as-is; Word documents go through mammoth; PDFs go through pdf.js.
 * Nothing leaves the browser until the user presses Evaluate.
 *
 * A PDF that holds no text layer (a scan or a photographed page) yields
 * nothing to read, and the user is told to paste the text instead.
 */
import { MAX_AUDIENCE_DOCUMENT_CHARS } from "../../engine/types.js";

export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".docx", ".pdf"];

export class DocumentReadError extends Error {
  readonly name = "DocumentReadError";
}

export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function readDocumentText(file: File): Promise<string> {
  const ext = extensionOf(file.name);
  if (ext === ".txt" || ext === ".md") return normalize(await file.text());
  if (ext === ".docx") {
    const mammoth = await import("mammoth/mammoth.browser.js");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return normalize(result.value);
  }
  if (ext === ".pdf") return readPdfText(await file.arrayBuffer());
  throw new DocumentReadError("This file type cannot be read here. Use a .txt, .md, .docx or .pdf file, or paste the text.");
}

/** Extracts the text layer of a PDF, page by page. */
export async function readPdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // In a browser the worker is a bundled asset; in Node (tests) pdf.js runs on
  // the main thread, so leave the worker unset there.
  if (typeof Worker !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).href;
  }
  // pdf.js transfers the buffer it is given, so hand it a copy.
  const task = pdfjs.getDocument({ data: data.slice(0), useSystemFonts: false });
  let pdf;
  try {
    pdf = await task.promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) throw new DocumentReadError("That PDF is password-protected. Remove the password, or paste the text instead.");
    throw new DocumentReadError("That PDF could not be opened. Paste the text instead.");
  }
  const pages: string[] = [];
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : ""))
          .join(""),
      );
    }
  } finally {
    await task.destroy().catch(() => {});
  }
  const text = normalizePdf(pages.join("\n\n"));
  if (text.length === 0) {
    throw new DocumentReadError("That PDF has no text to read; it may be a scan or a picture of a page. Paste the text instead.");
  }
  return text;
}

/**
 * A PDF's text layer ends every visual line, so a single line break is a wrap
 * inside a sentence, not a paragraph break. Joining those keeps phrases whole;
 * blank lines still separate paragraphs, and a line ending in a hyphen is a
 * split word.
 */
function normalizePdf(text: string): string {
  return normalize(
    text
      .replace(/([A-Za-z])-\n([a-z])/g, "$1$2")
      .replace(/\n{2,}/g, "\u0000")
      .replace(/\n/g, " ")
      .replace(/\u0000/g, "\n\n"),
  );
}

function normalize(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/[ \t ]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Trims a document to the per-document limit and says whether it was trimmed. */
export function clampDocumentText(text: string): { text: string; trimmed: boolean } {
  if (text.length <= MAX_AUDIENCE_DOCUMENT_CHARS) return { text, trimmed: false };
  return { text: text.slice(0, MAX_AUDIENCE_DOCUMENT_CHARS).trimEnd(), trimmed: true };
}
