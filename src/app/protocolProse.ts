/**
 * Renders the prose half of a protocol file for the Standards Library.
 *
 * A protocol carries two halves. The front matter is what the engine reads;
 * everything below it is what a reader needs to judge the protocol — where it
 * came from, how good that evidence is, and what it cannot do. That half is
 * Markdown, written by whoever authored the protocol, so the page needs to
 * turn it into elements rather than dump it as a wall of asterisks.
 *
 * Deliberately small: paragraphs, bullets, bold and links. A protocol that
 * needs a table to explain its sources is a protocol that has not been edited.
 */
export interface ProseBlock {
  kind: "paragraph" | "list";
  text?: string;
  items?: string[];
}

/** Pulls one numbered or plain section ("## 3. Source", "## Source") out of the prose. */
export function protocolSection(prose: string, heading: string): string {
  // The "m" flag is needed for ^ to find a heading mid-file, but it also makes
  // $ mean end-of-line, which stopped every section after its first line.
  // (?![\s\S]) is end-of-text and is unaffected by the flag.
  const pattern = new RegExp(`^#+\\s*(?:\\d+\\.\\s*)?${heading}\\b[^\\n]*\\n([\\s\\S]*?)(?=\\n#+\\s|(?![\\s\\S]))`, "im");
  return pattern.exec(prose)?.[1]?.trim() ?? "";
}

/** Strips the Markdown a protocol's prose actually uses, leaving readable text. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** Splits a section into paragraphs and bullet lists, in order. */
export function proseBlocks(section: string): ProseBlock[] {
  const blocks: ProseBlock[] = [];
  for (const chunk of section.split(/\n{2,}/)) {
    const trimmed = chunk.trim();
    if (trimmed.length === 0) continue;
    const lines = trimmed.split("\n");
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      blocks.push({ kind: "list", items: lines.map((l) => plainText(l.replace(/^\s*[-*]\s+/, ""))) });
    } else if (lines.every((l) => l.trimStart().startsWith("|"))) {
      // A table is the one thing this does not render; the file keeps the detail.
      continue;
    } else {
      blocks.push({ kind: "paragraph", text: plainText(lines.join(" ")) });
    }
  }
  return blocks;
}

/** One line saying when a protocol applies, built from its own selection fields. */
export function appliesTo(p: { layer: string; event?: string; goals?: string[] }): string {
  if (p.layer === "core") return "Every draft about one of the thirteen high-stakes events.";
  if (p.layer === "event") return `The event "${p.event}", in any format, to any audience.`;
  if (p.layer === "posture") return `The goal ${(p.goals ?? []).map((g) => `"${g}"`).join(" or ")}, on top of any event or none.`;
  return "";
}
