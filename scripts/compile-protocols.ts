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
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  checkLibrary,
  checkProtocol,
  protocolWordBudget,
  type CheckError,
  type EventEntry,
  type ProtocolFile,
} from "../src/engine/protocolFormat.js";
import { worstCase, type WorstCase } from "../src/engine/bundleWorstCase.js";

const DIR = "protocols";
const OUT = "src/engine/protocolLibrary.ts";
const EVENTS_IN = "protocols/events.yaml";
const EVENTS_OUT = "src/engine/eventTaxonomy.ts";
const REGISTRY = "sources/registry.yaml";

/**
 * The most a whole bundle may cost, in tokens. The hard limit.
 *
 * Instructions are cached and read in parallel, so this is not a speed limit;
 * it is about attention. Let the protocol layers outgrow the framework and
 * every review is mostly protocol, whatever the draft in front of it needs.
 *
 * The number a bundle is measured against is the largest one the intake can
 * actually produce, enumerated through the resolver in bundleWorstCase.ts, not
 * a sum of protocols no single request can select together.
 */
const TOKEN_BUDGET = Number.parseInt(process.env.ACR_PROTOCOL_TOKEN_BUDGET ?? "4000", 10);

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
  /** The heaviest bundle the resolver can assemble, for the build report. */
  worst?: WorstCase & { wordBudget: number; tokenBudget: number };
}

/** Every .md under the folder, deepest last, README excluded. */
function markdownFiles(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...markdownFiles(full, `${prefix}${entry}/`));
    else if (entry.endsWith(".md") && entry !== "README.md") out.push(`${prefix}${entry}`);
  }
  return out;
}

export function readEvents(file = EVENTS_IN): { events: EventEntry[]; families: { id: string; name: string }[]; uiGroups: { id: string; name: string }[] } {
  const raw = parseYaml(readFileSync(file, "utf8")) as {
    events: EventEntry[];
    families: { id: string; name: string }[];
    ui_groups: { id: string; name: string }[];
  };
  return { events: raw.events, families: raw.families, uiGroups: raw.ui_groups };
}

export function readSourceIds(file = REGISTRY): string[] {
  const raw = parseYaml(readFileSync(file, "utf8")) as { sources: { id: string }[] };
  return raw.sources.map((s) => s.id);
}

export function compile(dir = DIR): CompiledLibrary {
  const errors: CheckError[] = [];
  const protocols: ProtocolFile[] = [];

  const files = markdownFiles(dir);

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

  const { events, families } = readEvents();
  errors.push(
    ...checkLibrary(
      protocols.map((data, i) => ({ file: files[i] ?? data.id, data })),
      events,
      families.map((f) => f.id),
      readSourceIds(),
    ),
  );

  // The largest bundle any set of intake answers can produce, found by putting
  // every combination through the resolver the reviews use.
  const enumerated = worstCase(protocols);
  const budget = protocolWordBudget();
  if (enumerated.tokens > TOKEN_BUDGET) {
    errors.push({
      file: "(whole library)",
      message:
        `the largest bundle the intake can produce is about ${enumerated.tokens} tokens, over the ${TOKEN_BUDGET}-token budget ` +
        `(ACR_PROTOCOL_TOKEN_BUDGET). It is ${enumerated.protocols.join(" + ")}, from: ${enumerated.answers}`,
    });
  }

  return { protocols, errors, worst: { ...enumerated, wordBudget: budget, tokenBudget: TOKEN_BUDGET } };
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

/** Sources whose review_by date has passed, for the build warning. */
export function staleSources(file = REGISTRY, today = new Date()): string[] {
  const raw = parseYaml(readFileSync(file, "utf8")) as { sources: { id: string; review_by?: string | null }[] };
  return raw.sources
    .filter((s) => s.review_by && new Date(s.review_by) < today)
    .map((s) => `${s.id} was due for review on ${s.review_by}`);
}

/** Emits the taxonomy as TypeScript, so the three runtimes share it without a file system. */
export function renderEvents(
  events: EventEntry[],
  families: { id: string; name: string }[],
  uiGroups: { id: string; name: string }[],
): string {
  const j = (v: unknown) => JSON.stringify(v);
  const rows = events
    .map((e) => {
      const parts = [`id: ${j(e.id)}`, `label: ${j(e.label)}`, `family: ${j(e.family)}`];
      if (e.event_protocol) parts.push(`event_protocol: ${j(e.event_protocol)}`);
      parts.push(`ui_groups: [${e.ui_groups.map(j).join(", ")}]`);
      return `  { ${parts.join(", ")} },`;
    })
    .join("\n");
  const named = events.filter((e) => e.family !== null);
  return `/**
 * GENERATED FILE — do not edit.
 *
 * Built from protocols/events.yaml by scripts/compile-protocols.ts. Change an
 * event by editing that file and running \`npm run protocols\`. A test fails if
 * this file and the YAML disagree.
 *
 * The labels are written out as literals rather than derived, because
 * CommunicationEvent is a union of them and every enum, record and switch in
 * the app depends on it.
 */

export interface EventEntry {
  readonly id: string;
  readonly label: string;
  readonly family: string | null;
  readonly event_protocol?: string;
  readonly ui_groups: readonly string[];
}

export const EVENT_FAMILIES = [
${families.map((f) => `  { id: ${j(f.id)}, name: ${j(f.name)} },`).join("\n")}
] as const;
export type EventFamilyId = (typeof EVENT_FAMILIES)[number]["id"];

export const EVENT_UI_GROUPS = [
${uiGroups.map((g) => `  { id: ${j(g.id)}, name: ${j(g.name)} },`).join("\n")}
] as const;

export const EVENT_TAXONOMY: readonly EventEntry[] = [
${rows}
];

/** Every event label, in taxonomy order. The union the whole app is typed on. */
export const COMMUNICATION_EVENTS = [
${events.map((e) => `  ${j(e.label)},`).join("\n")}
] as const;

/** The event chosen when nothing on the list fits; the user then types what happened. */
export const OTHER_EVENT = ${j(events.find((e) => e.family === null)?.label ?? "Something else")};

/** Events that name something, for anywhere "Something else" is not a real answer. */
export const NAMED_EVENT_COUNT = ${named.length};
`;
}

function main(): void {
  const check = process.argv.includes("--check");
  const { protocols, errors, worst } = compile();

  if (errors.length > 0) {
    console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"} in the protocol files:\n`);
    for (const e of errors) console.error(`  ${e.file}\n    ${e.message}\n`);
    process.exit(1);
  }

  const { events, families, uiGroups } = readEvents();
  const rendered = render(protocols);
  const renderedEvents = renderEvents(events, families, uiGroups);
  if (check) {
    for (const [file, text] of [[OUT, rendered], [EVENTS_OUT, renderedEvents]] as const) {
      if (readFileSync(file, "utf8") !== text) {
        console.error(`${file} is out of date. Run: npm run protocols`);
        process.exit(1);
      }
    }
    console.log(`${OUT} and ${EVENTS_OUT} are up to date (${protocols.length} protocols, ${events.length} events).`);
    return;
  }

  writeFileSync(EVENTS_OUT, renderedEvents);
  writeFileSync(OUT, rendered);
  console.log(`Wrote ${EVENTS_OUT} with ${events.length} events in ${families.length} families.`);
  console.log(`Wrote ${OUT} with ${protocols.length} protocol${protocols.length === 1 ? "" : "s"}:`);
  for (const layer of ["core", "family", "event", "overlay"] as const) {
    for (const p of protocols.filter((x) => x.layer === layer)) {
      console.log(`  ${p.layer.padEnd(8)} ${p.id.padEnd(22)} v${p.version}${p.status === "active" ? "" : `  (${p.status})`}`);
    }
  }
  if (worst) {
    console.log(
      `\nLargest bundle the intake can produce: ${worst.words} words, about ${worst.tokens} tokens ` +
        `(hard limit ${worst.tokenBudget} tokens).\n  ${worst.protocols.join(" + ")}\n  from: ${worst.answers}\n` +
        `  found by enumerating ${worst.requests.toLocaleString()} requests through the resolver ` +
        `(${worst.bundles} distinct bundles).`,
    );
    // A warning, not a failure. The rule it states — that the protocols stay
    // the smaller voice, below the length of the framework they sit under — is
    // the one worth keeping in view, and phase 2 broke it deliberately: four
    // overlays is more instruction than the framework itself. Printed every
    // build so it stays a decision rather than something nobody remembers.
    if (worst.words > worst.wordBudget) {
      console.warn(
        `\n  warning: that is ${worst.words} words against a framework of ${worst.wordBudget}. ` +
          "The protocols are no longer the smaller voice. Under the hard token limit, so the build passes.",
      );
    }
  }
  for (const s of staleSources()) console.warn(`  warning: source ${s}`);
}

if (process.argv[1]?.endsWith("compile-protocols.ts")) main();
