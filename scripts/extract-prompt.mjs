// Regenerates src/engine/promptText.ts from PROMPT.md Section 5.
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
const out = `/**
 * Prompt text for the evaluation call.
 *
 * SYSTEM_PROMPT is the verbatim block from PROMPT.md Section 5, extracted by
 * scripts at authoring time. Do not edit them
 * here; edit PROMPT.md and regenerate (see README).
 */

export const SYSTEM_PROMPT: string = ${JSON.stringify(system)};
`;
fs.writeFileSync("src/engine/promptText.ts", out);
console.log(`wrote src/engine/promptText.ts (system ${system.length} chars)`);
