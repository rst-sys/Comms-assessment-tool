/**
 * The protocol file format, and the checker that guards it (step 4).
 *
 * A protocol is a Markdown file in protocols/ with a YAML front matter block
 * the engine reads and prose below it for the Standards Library page. The
 * owner writes one in a separate conversation, saves the reply, and uploads it
 * — no programming, which is the whole point of the library.
 *
 * Everything here runs at build time, not per review. scripts/compile-protocols.ts
 * turns the folder into src/engine/protocolLibrary.ts, so the engine ships a
 * plain data structure and the three runtimes that share it — the Node server,
 * the browser bundle and the tests — all read the same thing with no file
 * system and no bundler magic.
 *
 * The checker is the part that matters. A protocol that names a dimension that
 * does not exist, or lists fourteen triggers, or claims an event another
 * protocol already owns, must fail loudly here rather than quietly produce
 * worse reviews for months.
 */
import { MAX_QUESTIONS } from "./limits.js";
import { SYSTEM_PROMPT } from "./promptText.js";
import {
  COMMUNICATION_EVENTS,
  DIMENSION_IDS,
  GOALS,
  NO_EVENT,
  SPECIALIST_REVIEW_TYPES,
  type CommunicationEvent,
  type DimensionId,
  type Goal,
  type SpecialistReviewType,
} from "./types.js";

/**
 * Per-protocol caps. These are the format, not a suggestion: a file that
 * breaks one is rejected by name. Without them the library grows a little
 * with each protocol until the results page is a wall again — which is what
 * the owner's first three drafts already showed, at fourteen to sixteen
 * elements apiece.
 */
export const PROTOCOL_CAPS = {
  elements: 8,
  triggers: 6,
  questions: 6,
} as const;

/**
 * The whole compiled instruction set — core plus the longest event plus the
 * longest posture — must stay under the length of the framework itself.
 *
 * Not a speed limit. Instructions are read in parallel and cached, so a
 * thousand extra words of them cost a fraction of a second where a thousand
 * words of output cost twenty-five. The limit is about attention. The
 * framework is what makes the tool's judgement its own rather than a
 * checklist; let the protocol layer outgrow it and every review is mostly
 * protocol, whatever the draft in front of it actually needs.
 *
 * Derived rather than written down, for the same reason the score ceiling is:
 * a number picked by hand is a guess that rots. This one states the rule —
 * protocols stay the smaller voice — and stays true when the framework
 * changes.
 */
export function protocolWordBudget(): number {
  return SYSTEM_PROMPT.trim().split(/\s+/).filter(Boolean).length;
}

export type ProtocolLayer = "core" | "event" | "posture";
export type ElementWeight = "core" | "supporting";

export interface ProtocolElement {
  name: string;
  means: string;
  weight: ElementWeight;
  dimension: DimensionId;
  /** Core only: the element fires only on events marked as a failure. */
  only_when?: "failure";
}

export interface ProtocolTrigger {
  /** Core only: a short name an event protocol can narrow this check by. */
  id?: string;
  check: string;
  dimension: DimensionId;
  review?: SpecialistReviewType[];
  /** Core only: an event protocol is allowed to turn this into a question. */
  may_be_narrowed_by?: "event";
}

export interface ProtocolQuestion {
  ask: string;
  review?: SpecialistReviewType[];
}

export interface ProtocolFile {
  id: string;
  name: string;
  layer: ProtocolLayer;
  version: number;
  status: "draft" | "active";
  /** Event layer: the one event this protocol owns. */
  event?: CommunicationEvent;
  /** Posture layer: the goals that bring it in, on top of any event. */
  goals?: Goal[];
  elements: ProtocolElement[];
  triggers: ProtocolTrigger[];
  questions: ProtocolQuestion[];
  /** Core trigger ids this protocol turns into a question instead. */
  narrows?: string[];
  /** Everything below the front matter: source, basis, limits. For the page, never the engine. */
  prose: string;
}

export interface CheckError {
  file: string;
  message: string;
}

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

function one<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/**
 * Checks one parsed front matter block against the format. Returns every
 * problem rather than the first, so a file can be fixed in one pass.
 */
export function checkProtocol(file: string, data: unknown, prose: string): CheckError[] {
  const errors: CheckError[] = [];
  const err = (message: string) => errors.push({ file, message });
  if (typeof data !== "object" || data === null) {
    err("the front matter between the --- lines is missing or is not a list of settings");
    return errors;
  }
  const d = data as Record<string, unknown>;

  if (!isStr(d.id)) err("needs an id, a short name with no spaces, such as cyber-incident");
  else if (!/^[a-z0-9-]+$/.test(d.id)) err(`id "${d.id}" may use only lower-case letters, numbers and hyphens`);
  if (!isStr(d.name)) err("needs a name, the title shown in the Standards Library");
  if (typeof d.version !== "number") err("needs a version number, starting at 1 and going up whenever the protocol changes");
  if (!one(d.status, ["draft", "active"] as const)) err('status must be "draft" or "active"');
  if (!one(d.layer, ["core", "event", "posture"] as const)) {
    err('layer must be "core" (every event), "event" (one event) or "posture" (a stance on top of any event)');
    return errors;
  }

  if (d.layer === "event") {
    if (!one(d.event, COMMUNICATION_EVENTS)) {
      err(`event must be one of the communication events, spelled exactly. Got ${JSON.stringify(d.event)}`);
    } else if (d.event === NO_EVENT) {
      err(`"${NO_EVENT}" means no protocol applies, so no protocol may claim it`);
    }
  } else if (d.event !== undefined) {
    err("only a protocol with layer: event names an event");
  }

  if (d.layer === "posture") {
    if (!isArr(d.goals) || d.goals.length === 0) err("a posture protocol needs goals: the intake goals that bring it in");
    else for (const g of d.goals) if (!one(g, GOALS)) err(`goal ${JSON.stringify(g)} is not one of the intake goals`);
  } else if (d.goals !== undefined) {
    err("only a protocol with layer: posture names goals");
  }

  // Elements.
  if (!isArr(d.elements) || d.elements.length === 0) err("needs at least one element");
  else {
    if (d.elements.length > PROTOCOL_CAPS.elements) {
      err(`has ${d.elements.length} elements; the most allowed is ${PROTOCOL_CAPS.elements}. Keep the ones this event turns on and let the core carry the rest.`);
    }
    d.elements.forEach((raw, i) => {
      const e = raw as Record<string, unknown>;
      const at = `element ${i + 1}`;
      if (!isStr(e.name)) err(`${at} needs a name`);
      if (!isStr(e.means)) err(`${at} needs "means": one sentence saying what it is`);
      if (!one(e.weight, ["core", "supporting"] as const)) err(`${at} weight must be "core" or "supporting"`);
      if (!one(e.dimension, DIMENSION_IDS)) err(`${at} dimension ${JSON.stringify(e.dimension)} is not one of the ten scored dimensions`);
      if (e.only_when !== undefined) {
        if (e.only_when !== "failure") err(`${at} only_when may only be "failure"`);
        else if (d.layer !== "core") err(`${at} uses only_when, which belongs to the core protocol`);
      }
    });
  }

  // Triggers.
  if (!isArr(d.triggers)) err("needs a triggers list, even if it is empty");
  else {
    if (d.triggers.length > PROTOCOL_CAPS.triggers) {
      err(`has ${d.triggers.length} triggers; the most allowed is ${PROTOCOL_CAPS.triggers}. If everything is serious, nothing is.`);
    }
    d.triggers.forEach((raw, i) => {
      const t = raw as Record<string, unknown>;
      const at = `trigger ${i + 1}`;
      if (!isStr(t.check)) err(`${at} needs "check": what to look for, checkable by reading the draft`);
      if (t.id !== undefined) {
        if (!isStr(t.id) || !/^[a-z0-9-]+$/.test(t.id as string)) err(`${at} id may use only lower-case letters, numbers and hyphens`);
        else if (d.layer !== "core") err(`${at} has an id, which only the core protocol's triggers carry`);
      }
      if (!one(t.dimension, DIMENSION_IDS)) err(`${at} dimension ${JSON.stringify(t.dimension)} is not one of the ten scored dimensions`);
      reviewList(t.review, at, err);
      if (t.may_be_narrowed_by !== undefined) {
        if (t.may_be_narrowed_by !== "event") err(`${at} may_be_narrowed_by may only be "event"`);
        else if (d.layer !== "core") err(`${at} uses may_be_narrowed_by, which belongs to the core protocol`);
      }
    });
  }

  // Questions.
  if (!isArr(d.questions)) err("needs a questions list, even if it is empty");
  else {
    if (d.questions.length > PROTOCOL_CAPS.questions) {
      err(`has ${d.questions.length} questions; the most allowed is ${PROTOCOL_CAPS.questions}, and a review shows at most ${MAX_QUESTIONS} in total.`);
    }
    d.questions.forEach((raw, i) => {
      const q = raw as Record<string, unknown>;
      const at = `question ${i + 1}`;
      if (!isStr(q.ask)) err(`${at} needs "ask": the question itself`);
      // Contains a question mark, rather than ends with one. The rule is here
      // to stop a statement being filed as a question, and a legal question
      // properly ends "... does the timing fit? Counsel must confirm." —
      // which is what PROTOCOL-PROMPT.md asks authors to write.
      else if (!q.ask.includes("?")) err(`${at} is not a question: it contains no question mark`);
      reviewList(q.review, at, err);
    });
  }

  if (d.narrows !== undefined) {
    if (!isArr(d.narrows)) err("narrows must be a list of core trigger ids this protocol softens");
    else if (d.layer !== "event") err("only an event protocol may narrow a core trigger");
  }

  // A protocol changes what the engine looks for, never what it writes.
  const body = JSON.stringify(d);
  if (/protocol_review|a section of its own|own section/i.test(body)) {
    err("asks for an output section. A protocol adds instructions, never output: raise what it finds through the ordinary findings.");
  }
  if (prose.trim().length === 0) {
    err("has no prose below the front matter. Source, Basis and Limits are what the Standards Library page shows.");
  } else {
    for (const heading of ["Source", "Basis"]) {
      if (!new RegExp(`^#+\\s*(\\d+\\.\\s*)?${heading}\\b`, "im").test(prose)) {
        err(`has no "${heading}" section. A protocol that cannot name what it rests on does not go in the library.`);
      }
    }
  }

  return errors;
}

function reviewList(value: unknown, at: string, err: (m: string) => void): void {
  if (value === undefined) return;
  if (!isArr(value)) {
    err(`${at} review must be a list of specialist review types`);
    return;
  }
  for (const r of value) {
    if (!one(r, SPECIALIST_REVIEW_TYPES)) {
      err(`${at} names ${JSON.stringify(r)}, which is not a specialist review type. The types are: ${SPECIALIST_REVIEW_TYPES.join(", ")}.`);
    }
  }
}

/** Problems that only show up across the whole library, not in one file. */
export function checkLibrary(files: { file: string; data: ProtocolFile }[]): CheckError[] {
  const errors: CheckError[] = [];
  const cores = files.filter((f) => f.data.layer === "core");
  if (cores.length > 1) {
    errors.push({ file: cores.map((c) => c.file).join(", "), message: "more than one core protocol; there can be only one" });
  }

  // The core is the floor. Without this, any protocol could switch off any
  // core check simply by naming it, and nothing would say so.
  const core = cores[0]?.data;
  const narrowable = new Set(
    (core?.triggers ?? []).filter((t) => t.may_be_narrowed_by === "event" && t.id).map((t) => t.id as string),
  );
  for (const { file, data } of files) {
    for (const n of data.narrows ?? []) {
      if (!narrowable.has(n)) {
        errors.push({
          file,
          message:
            `narrows "${n}", which is not a core check that may be narrowed. ` +
            (narrowable.size > 0
              ? `The core allows: ${[...narrowable].join(", ")}. Name the id, not the wording.`
              : "The core allows none."),
        });
      }
    }
  }

  const byId = new Map<string, string>();
  const byEvent = new Map<CommunicationEvent, string>();
  for (const { file, data } of files) {
    const seenId = byId.get(data.id);
    if (seenId) errors.push({ file, message: `id "${data.id}" is already used by ${seenId}` });
    byId.set(data.id, file);

    if (data.layer === "event" && data.event) {
      const seen = byEvent.get(data.event);
      if (seen) errors.push({ file, message: `"${data.event}" is already covered by ${seen}. One protocol per event.` });
      byEvent.set(data.event, file);
    }
  }
  return errors;
}
