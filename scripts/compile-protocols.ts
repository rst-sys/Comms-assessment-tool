/**
 * Compiles protocols/*.md into src/engine/protocolLibrary.ts (step 4).
 *
 * Run with `npm run protocols`, or `npm run protocols -- --check` to verify
 * the committed file matches the folder without writing anything.
 *
 * Compiling at build time rather than reading the folder at runtime is what
 * lets the same engine run in three places: the Node server, the browser
 * bundle for the claude.ai page, and the tests. None of them can agree on a
 * file system, and all of them can read a plain TypeScript module.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  checkLibrary,
  checkProtocol,
  protocolWordBudget,
  type CheckError,
  type ProtocolFile,
} from "../src/engine/protocolFormat.js";
import { buildProtocolBlock, protocolWordCount } from "../src/engine/protocolPrompt.js";

const DIR = "protocols";
const OUT = "src/engine/protocolLibrary.ts";

/** Splits `---\n<yaml>\n---\n<prose>`. Returns null when there is no front matter. */
export function splitFrontMatter(text: string): { yaml: string; prose: string } | null {
  const normalized = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---", 4);
  if (end === -1) return null;
  const after = normalized.indexOf("\n", end + 1);
  return { yaml: normalized.slice(4, end), prose: after === -1 ? "" : normalized.slice(after + 1) };
}

export interface CompiledLibrary {
  protocols: ProtocolFile[];
  errors: CheckError[];
}

export function compile(dir = DIR): CompiledLibrary {
  const errors: CheckError[] = [];
  const protocols: ProtocolFile[] = [];

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    const split = splitFrontMatter(text);
    if (!split) {
      // A file with no front matter is a draft the owner has not converted yet,
      // not an error: the folder is where drafts land before integration.
      continue;
    }
    let data: unknown;
    try {
      data = parseYaml(split.yaml);
    } catch (e) {
      errors.push({ file, message: `the settings block could not be read: ${e instanceof Error ? e.message : String(e)}` });
      continue;
    }
    const problems = checkProtocol(file, data, split.prose);
    errors.push(...problems);
    if (problems.length === 0) {
      protocols.push({ ...(data as ProtocolFile), prose: split.prose.trim() });
    }
  }

  errors.push(...checkLibrary(protocols.map((data, i) => ({ file: files[i] ?? data.id, data }))));

  // Budget: the heaviest event plus the heaviest posture, the most that can
  // apply to one draft.
  const heaviest = (layer: ProtocolFile["layer"]) =>
    Math.max(0, ...protocols.filter((p) => p.layer === layer).map((p) => protocolWordCount(buildProtocolBlock(p))));
  const worst = heaviest("event") + heaviest("posture");
  const budget = protocolWordBudget();
  if (worst > budget) {
    errors.push({
      file: "(whole library)",
      message:
        `the worst case — the longest event plus the longest posture — is ${worst} words, ` +
        `over the ${budget}-word budget. The protocols must stay shorter than the framework they sit under.`,
    });
  }

  return { protocols, errors };
}

export function render(protocols: ProtocolFile[]): string {
  const body = JSON.stringify(protocols, null, 2).replace(/^/gm, "  ").trim();
  return `/**
 * GENERATED FILE — do not edit.
 *
 * Built from protocols/*.md by scripts/compile-protocols.ts. Change a protocol
 * by editing its Markdown file and running \`npm run protocols\`. A test fails
 * if this file and the folder disagree, so a forgotten rebuild is caught here
 * rather than by a tester.
 */
import type { ProtocolFile } from "./protocolFormat.js";

export const PROTOCOL_LIBRARY: ProtocolFile[] = ${body};
`;
}

function main(): void {
  const check = process.argv.includes("--check");
  const { protocols, errors } = compile();

  if (errors.length > 0) {
    console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"} in the protocol files:\n`);
    for (const e of errors) console.error(`  ${e.file}\n    ${e.message}\n`);
    process.exit(1);
  }

  const rendered = render(protocols);
  if (check) {
    const current = readFileSync(OUT, "utf8");
    if (current !== rendered) {
      console.error(`${OUT} is out of date. Run: npm run protocols`);
      process.exit(1);
    }
    console.log(`${OUT} is up to date (${protocols.length} protocol${protocols.length === 1 ? "" : "s"}).`);
    return;
  }

  writeFileSync(OUT, rendered);
  const names = protocols.map((p) => `${p.id} (${p.layer}${p.status === "draft" ? ", draft" : ""})`);
  console.log(`Wrote ${OUT} with ${protocols.length} protocol${protocols.length === 1 ? "" : "s"}:`);
  for (const n of names) console.log(`  ${n}`);
}

if (process.argv[1]?.endsWith("compile-protocols.ts")) main();
