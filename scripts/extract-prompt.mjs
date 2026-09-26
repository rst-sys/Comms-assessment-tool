// Regenerates src/engine/promptText.ts from PROMPT.md Sections 5 and 10.
import fs from "node:fs";

const md = fs.readFileSync("PROMPT.md", "utf8");
function fencedAfter(heading) {
  const start = md.indexOf(heading);
  if (start < 0) throw new Error("heading not found: " + heading);
  const open = md.indexOf("```markdown\n", start);
  const close = md.indexOf("\n```", open + 12);
  return md.slice(open + "```markdown\n".length, close);
}
const system = fencedAfter("## 5. Evaluation system prompt");
const layoff = fencedAfter("## 10. High-risk protocol");
const out = `/**
 * Prompt text for the evaluation call.
 *
 * SYSTEM_PROMPT and LAYOFF_BLOCK are the verbatim blocks from PROMPT.md
 * Sections 5 and 10, extracted by scripts at authoring time. Do not edit them
 * here; edit PROMPT.md and regenerate (see README).
 */

export const SYSTEM_PROMPT: string = ${JSON.stringify(system)};

export const LAYOFF_BLOCK: string = ${JSON.stringify(layoff)};
`;
fs.writeFileSync("src/engine/promptText.ts", out);
console.log(`wrote src/engine/promptText.ts (system ${system.length} chars, layoff ${layoff.length} chars)`);
