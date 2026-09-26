/**
 * Prepares dist-artifact/ for publishing as a claude.ai page:
 *
 * 1. Writes page.html, the fragment the Artifact tool publishes, pointing at
 *    the hashed asset names Vite just emitted.
 * 2. Escapes raw control bytes in emitted JavaScript. pdf.js's minified
 *    worker embeds three raw ESC (0x1B) characters inside string literals,
 *    and the publisher refuses a file carrying one. In JavaScript source a
 *    raw ESC inside a string or regular expression and the two-character
 *    escape \x1b mean the same thing, so the substitution is safe.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "dist-artifact";
const assets = join(dir, "assets");

const html = readFileSync(join(dir, "index.html"), "utf8");
const css = /href="\.\/(assets\/[^"]+\.css)"/.exec(html)?.[1];
const js = /src="\.\/(assets\/[^"]+\.m?js)"/.exec(html)?.[1];
if (!css || !js) throw new Error("could not find the built asset names in index.html");

writeFileSync(
  join(dir, "page.html"),
  `<title>Trust Assessment Assistant</title>
<meta name="description" content="Assess how well a draft communication builds trust and credibility, using your own Claude account.">
<style>body{background:#faf8f3;margin:0}</style>
<link rel="stylesheet" href="${css}">
<div id="root"></div>
<script type="module" src="${js}"></script>
`,
);

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;
const escaped = [];
for (const name of readdirSync(assets)) {
  if (!/\.(m?js)$/.test(name)) continue;
  const path = join(assets, name);
  const source = readFileSync(path, "utf8");
  if (!CONTROL.test(source)) continue;
  CONTROL.lastIndex = 0;
  const fixed = source.replace(CONTROL, (c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, "0")}`);
  writeFileSync(path, fixed);
  escaped.push(`${name} (${(source.match(CONTROL) ?? []).length})`);
}

const files = readdirSync(assets);
const bytes = files.reduce((n, f) => n + statSync(join(assets, f)).size, 0);
console.log(JSON.stringify({ page: "dist-artifact/page.html", css, js, files, escaped, totalMB: +(bytes / 1048576).toFixed(2) }, null, 2));
