/**
 * Reading audience context documents in the browser (revision 8). Plain text and
 * Markdown are read as-is; Word documents are converted to text with
 * mammoth. Nothing leaves the browser until the user presses Evaluate.
 */
import { MAX_AUDIENCE_DOCUMENT_CHARS } from "../../engine/types.js";

export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".docx"];

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
  throw new DocumentReadError("This file type cannot be read here. Use a .txt, .md or .docx file, or paste the text.");
}

function normalize(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Trims a document to the per-document limit and says whether it was trimmed. */
export function clampDocumentText(text: string): { text: string; trimmed: boolean } {
  if (text.length <= MAX_AUDIENCE_DOCUMENT_CHARS) return { text, trimmed: false };
  return { text: text.slice(0, MAX_AUDIENCE_DOCUMENT_CHARS).trimEnd(), trimmed: true };
}
