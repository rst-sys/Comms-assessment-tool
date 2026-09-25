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
  OTHER_EVENT,
  PURPOSES,
  SPECIALIST_REVIEW_TYPES,
  type CommunicationEvent,
  type DimensionId,
  type Purpose,
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
  triggers: 6,
  questions: 6,
} as const;

export function protocolWordBudget(): number {
  return SYSTEM_PROMPT.trim().split(/\s+/).filter(Boolean).length;
}

export const PROTOCOL_LAYERS = ["core", "family", "event", "overlay"] as const;
export type ProtocolLayer = (typeof PROTOCOL_LAYERS)[number];

/** Where an element's authority comes from. Set by the owner, never inferred. */
export const ELEMENT_BASES = ["law", "guidance", "standard", "research", "code", "judgement", "unclassified"] as const;
export type ElementBasis = (typeof ELEMENT_BASES)[number];

/**
 * The intake answers an overlay can be switched on by. The resolver holds the
 * rule for each; this list is what a protocol file is allowed to name.
 */
export const OVERLAY_TRIGGERS = [
  "listed-company",
  "people-harmed",
  "workforce-impact",
  "personal-data",
  "stage-unfolding",
  "apology",
] as const;
export type OverlayTrigger = (typeof OVERLAY_TRIGGERS)[number];

/**
 * How many elements each layer may carry.
 *
 * A family says what its events share, so it is the smallest; an event holds
 * only what differs from its family, and an overlay only what one intake
 * answer adds. Without these the layers grow until every review is mostly
 * protocol, which is the failure the word budget below also guards against.
 */
export const ELEMENT_CAPS: Record<ProtocolLayer, number> = {
  core: 8,
  family: 6,
  event: 8,
  overlay: 5,
};

/**
 * How many triggers each layer may carry.
 *
 * Per-layer for the same reason the element caps are. An overlay is switched
 * on by one intake answer but applies across every event that answer reaches,
 * so what it carries is the union of what those events have in common — the
 * workforce overlay took four triggers from workforce-reduction and added four
 * of its own for site closures, market exits and mergers. An event protocol
 * speaks to one event and has no such union to carry, so it stays at six.
 */
export const TRIGGER_CAPS: Record<ProtocolLayer, number> = {
  core: PROTOCOL_CAPS.triggers,
  family: PROTOCOL_CAPS.triggers,
  event: PROTOCOL_CAPS.triggers,
  overlay: 8,
};

/**
 * The whole compiled instruction set — core plus the longest event plus the
 * longest posture — must stay under the length of the framework itself.
 *
 * Not a speed limit. Instructions are read in parallel and cached, so a
 * thousand extra words of them cost a fraction of a second where a thousand
 * words of output cost twenty-five. The limit is about attention. The
 * framework is what makes the tool's judgment its own rather than a
 * checklist; let the protocol layer outgrow it and every review is mostly
 * protocol, whatever the draft in front of it actually needs.
 *
 * Derived rather than written down, for the same reason the score ceiling is:
 * a number picked by hand is a guess that rots. This one states the rule —
 * protocols stay the smaller voice — and stays true when the framework
 * changes.
 */


/**
 * The framework checks an event protocol may soften, and what softening means.
 *
 * Anchored in code rather than in a protocol file because the framework is
 * code: it is the standard every draft is held to, and nothing in the library
 * gets to move it. An event protocol names one of these ids when the event
 * makes the check unsafe to assert, and the engine is told to raise it as a
 * question instead of a finding.
 *
 * One entry, and it should stay hard to add to. The case that earned it: in a
 * geopolitical event, vagueness about a country or the location of staff may
 * be a deliberate safety decision, and the draft cannot show which.
 */
export const FRAMEWORK_NARROWABLE: Record<string, string> = {
  "plain-naming":
    "that the central fact must be stated in ordinary words rather than in euphemism or abstraction",
};
export type ElementWeight = "core" | "supporting";

export interface ProtocolElement {
  /** Stable, `<protocol>.<slug>`. What a finding or a changelog points at. */
  id: string;
  name: string;
  means: string;
  weight: ElementWeight;
  dimension: DimensionId;
  /** What kind of authority this rests on. "unclassified" until the owner says. */
  basis: ElementBasis;
  /** Ids from sources/registry.yaml. */
  sources: string[];
  /** Conditions under which the element applies at all; absent means always. */
  applies_if?: { org_type?: string[]; jurisdiction?: string[]; format?: string[] };
  /**
   * Overlay element ids this element supersedes.
   *
   * An overlay carries the general form of a check and an event protocol the
   * sharper one — support that fits the data exposed, rather than support in
   * general. Where both apply, sending both asks the model to find the same
   * gap twice and invites two findings for one hole in the draft. The event's
   * element wins and the overlay's is dropped, because the event knows more.
   */
  replaces?: string[];
}

export interface ProtocolTrigger {
  check: string;
  dimension: DimensionId;
  review?: SpecialistReviewType[];
  /**
   * A core protocol element id this trigger is the event-specific form of.
   *
   * The core says the central fact must not hide behind euphemism;
   * workforce-reduction lists the euphemisms. One gap in the draft, two ways
   * of describing it, and without this the model is invited to raise it twice.
   */
  narrows?: string;
}

export interface ProtocolQuestion {
  ask: string;
  review?: SpecialistReviewType[];
}

export interface ProtocolFile {
  id: string;
  name: string;
  layer: ProtocolLayer;
  /** Event protocols: the family they sit under. */
  family?: string;
  /** Overlay protocols: the intake rule that switches them on. */
  trigger?: OverlayTrigger;
  /** Semver. The minor turns when checks change, the patch when wording does. */
  version: string;
  status: "draft" | "active" | "retired";
  /** When a human last read this against its sources. Null if never. */
  last_reviewed?: string | null;
  /** When it should be read again. Null until the owner sets a cadence. */
  review_by?: string | null;
  changelog: string[];
  /**
   * One line naming what kind of authority this protocol rests on.
   *
   * Required because the Standards Library page cannot show every citation at
   * once and stay readable: five protocols' sources ran to three thousand
   * words, 42% of the page. The full sources stay, one click away; this is
   * what a reader sees first, and it has to be honest about the weight of the
   * evidence rather than impressive about its quantity.
   */
  rests_on: string;
  elements: ProtocolElement[];
  triggers: ProtocolTrigger[];
  questions: ProtocolQuestion[];
  /**
   * What this protocol softens, as framework check ids, core element ids, or
   * both. A framework check becomes a question; a core element is replaced by
   * this protocol's narrower reading of it.
   */
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
  if (!isStr(d.rests_on)) {
    err('needs rests_on: one line naming what kind of authority it rests on, such as "US regulator guidance plus professional judgment; no effectiveness studies exist"');
  } else if ((d.rests_on as string).trim().split(/\s+/).length > 30) {
    err(`rests_on is ${(d.rests_on as string).trim().split(/\s+/).length} words; keep it to 30. It is the line a reader sees instead of the full sources, not a summary of them.`);
  }
  if (!isStr(d.version) || !/^\d+\.\d+\.\d+$/.test(d.version as string)) {
    err(`version must be semver, such as 1.0.0. Got ${JSON.stringify(d.version)}`);
  }
  if (!one(d.status, ["draft", "active", "retired"] as const)) err('status must be "draft", "active" or "retired"');
  for (const field of ["last_reviewed", "review_by"] as const) {
    const v = d[field];
    if (v !== null && v !== undefined && !(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v))) {
      err(`${field} must be a date as YYYY-MM-DD, or null. Got ${JSON.stringify(v)}`);
    }
  }
  if (!isArr(d.changelog) || d.changelog.length === 0) {
    err('needs a changelog: a list of lines, starting with the version, such as "1.0.0 — first version."');
  }

  if (!one(d.layer, PROTOCOL_LAYERS)) {
    err(`layer must be one of ${PROTOCOL_LAYERS.join(", ")}. Got ${JSON.stringify(d.layer)}`);
    return errors;
  }
  const layer = d.layer;

  // An event protocol names its family; the taxonomy names its events. One
  // direction only, so the menu and the engine cannot drift apart.
  if (layer === "event") {
    if (!isStr(d.family)) err("an event protocol needs family: the family id it sits under");
  } else if (d.family !== undefined) {
    err("only a protocol with layer: event names a family");
  }
  if (d.events !== undefined || d.purposes !== undefined) {
    err("events and purposes are no longer named here. protocols/events.yaml points at an event protocol; an overlay names a trigger.");
  }

  if (layer === "overlay") {
    if (!one(d.trigger, OVERLAY_TRIGGERS)) {
      err(`an overlay needs trigger: one of ${OVERLAY_TRIGGERS.join(", ")}. Got ${JSON.stringify(d.trigger)}`);
    }
  } else if (d.trigger !== undefined) {
    err("only a protocol with layer: overlay names a trigger");
  }

  // Elements.
  if (!isArr(d.elements)) err("needs an elements list, even if it is empty");
  else {
    const cap = ELEMENT_CAPS[layer];
    if (d.elements.length > cap) {
      err(`has ${d.elements.length} elements; the most a ${layer} protocol may carry is ${cap}. Keep the ones this layer turns on and let the layer above carry the rest.`);
    }
    const seenIds = new Set<string>();
    d.elements.forEach((raw, i) => {
      const e = raw as Record<string, unknown>;
      const at = `element ${i + 1}`;
      if (!isStr(e.id)) err(`${at} needs an id, such as ${isStr(d.id) ? d.id : "protocol"}.what-it-checks`);
      else {
        if (seenIds.has(e.id)) err(`${at} repeats the id "${e.id}"`);
        seenIds.add(e.id);
        if (isStr(d.id) && !e.id.startsWith(`${d.id}.`)) err(`${at} id "${e.id}" must start with "${d.id}."`);
      }
      if (!isStr(e.name)) err(`${at} needs a name`);
      if (!isStr(e.means)) err(`${at} needs "means": one sentence saying what it is`);
      if (!one(e.weight, ["core", "supporting"] as const)) err(`${at} weight must be "core" or "supporting"`);
      if (!one(e.dimension, DIMENSION_IDS)) err(`${at} dimension ${JSON.stringify(e.dimension)} is not one of the ten scored dimensions`);
      if (!one(e.basis, ELEMENT_BASES)) err(`${at} basis must be one of ${ELEMENT_BASES.join(", ")}. Got ${JSON.stringify(e.basis)}`);
      if (!isArr(e.sources)) err(`${at} needs a sources list, even if it is empty`);
      else for (const src of e.sources) if (typeof src !== "string") err(`${at} lists a source that is not an id`);
      if (e.replaces !== undefined) {
        if (!isArr(e.replaces)) err(`${at} replaces must be a list of overlay element ids this one supersedes`);
        else {
          if (layer !== "event") err(`${at} names replaces, which only an event protocol's element may do: it is the sharper reading that wins`);
          for (const r of e.replaces) if (typeof r !== "string") err(`${at} replaces an entry that is not an element id`);
        }
      }
      if (e.applies_if !== undefined) {
        if (typeof e.applies_if !== "object" || e.applies_if === null) err(`${at} applies_if must be a list of conditions`);
        else {
          for (const key of Object.keys(e.applies_if)) {
            if (key !== "org_type" && key !== "jurisdiction" && key !== "format") {
              err(`${at} applies_if does not understand "${key}"; it takes org_type, jurisdiction and format`);
            }
          }
        }
      }
    });
  }

  // Triggers.
  if (!isArr(d.triggers)) err("needs a triggers list, even if it is empty");
  else {
    const triggerCap = TRIGGER_CAPS[layer];
    if (d.triggers.length > triggerCap) {
      err(`has ${d.triggers.length} triggers; the most a ${layer} protocol may carry is ${triggerCap}. If everything is serious, nothing is.`);
    }
    d.triggers.forEach((raw, i) => {
      const t = raw as Record<string, unknown>;
      const at = `trigger ${i + 1}`;
      if (!isStr(t.check)) err(`${at} needs "check": what to look for, checkable by reading the draft`);
      if (!one(t.dimension, DIMENSION_IDS)) err(`${at} dimension ${JSON.stringify(t.dimension)} is not one of the ten scored dimensions`);
      if (t.narrows !== undefined && !(typeof t.narrows === "string" && t.narrows.startsWith("core."))) {
        err(`${at} narrows ${JSON.stringify(t.narrows)}. A trigger may only sharpen a core protocol element, named by its id, such as core.central_fact_first.`);
      }
      reviewList(t.review, at, err);
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
    if (!isArr(d.narrows)) err("narrows must be a list of framework check ids this protocol softens");
    else if (layer === "core") err("the core protocol cannot narrow the framework it sits directly under");
    else {
      for (const n of d.narrows) {
        if (typeof n !== "string" || !(n in FRAMEWORK_NARROWABLE || n.startsWith("core."))) {
          err(
            `narrows ${JSON.stringify(n)}, which is neither a framework check that may be narrowed nor a core protocol element. ` +
              `The framework allows: ${Object.keys(FRAMEWORK_NARROWABLE).join(", ")}. A core element is named by its id, such as core.central_fact_first. ` +
              `Name the id, not the wording.`,
          );
        }
      }
    }
  }

  // A protocol changes what the engine looks for, never what it writes.
  const body = JSON.stringify(d);
  if (/protocol_review|a section of its own|own section/i.test(body)) {
    err("asks for an output section. A protocol adds instructions, never output: raise what it finds through the ordinary findings.");
  }
  if (prose.trim().length === 0) {
    err("has no prose below the front matter. Source, Basis and Limits are what the Standards Library page shows.");
  } else {
    // Every protocol shows its sources. Only an event protocol needs the
    // separate Basis heading: rests_on, which every protocol now carries,
    // already names what kind of authority it rests on, and the event
    // protocols are where the distinction between binding law and professional
    // consensus is long enough to need a section of its own.
    for (const heading of layer === "event" ? ["Source", "Basis"] : ["Source"]) {
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

/** What the taxonomy says about an event; the compiler passes it in. */
export interface EventEntry {
  id: string;
  label: string;
  family: string | null;
  event_protocol?: string;
  ui_groups: string[];
}

/** Problems that only show up across the whole library, not in one file. */
export function checkLibrary(
  files: { file: string; data: ProtocolFile }[],
  events: EventEntry[] = [],
  families: string[] = [],
  sourceIds: string[] = [],
): CheckError[] {
  const errors: CheckError[] = [];
  const byId = new Map<string, string>();
  const byTrigger = new Map<string, string>();
  const known = new Set(sourceIds);

  for (const { file, data } of files) {
    const seenId = byId.get(data.id);
    if (seenId) errors.push({ file, message: `id "${data.id}" is already used by ${seenId}` });
    byId.set(data.id, file);

    if (data.layer === "overlay" && data.trigger) {
      const seen = byTrigger.get(data.trigger);
      if (seen) errors.push({ file, message: `trigger "${data.trigger}" is already claimed by ${seen}. One overlay per rule.` });
      byTrigger.set(data.trigger, file);
    }
    if (data.layer === "event" && data.family && families.length > 0 && !families.includes(data.family)) {
      errors.push({ file, message: `family "${data.family}" is not one of the families in events.yaml: ${families.join(", ")}` });
    }
    if (sourceIds.length > 0) {
      for (const e of data.elements) {
        for (const src of e.sources ?? []) {
          if (!known.has(src)) errors.push({ file, message: `element ${e.id} cites source "${src}", which is not in sources/registry.yaml` });
        }
      }
    }
  }

  // Every `replaces` and every core-element `narrows` must point at an element
  // that exists. A dangling pointer is silent: the overlay element is never
  // dropped, or the model is told to fold a finding into a check that is not
  // there, and the only sign is two findings for one gap.
  const elementIds = new Set(files.flatMap(({ data }) => data.elements.map((e) => e.id)));
  for (const { file, data } of files) {
    for (const e of data.elements) {
      for (const target of e.replaces ?? []) {
        if (!elementIds.has(target)) errors.push({ file, message: `element ${e.id} replaces "${target}", which no protocol defines` });
      }
    }
    for (const n of data.narrows ?? []) {
      if (n.startsWith("core.") && !elementIds.has(n)) {
        errors.push({ file, message: `narrows "${n}", which the core protocol does not define` });
      }
    }
    data.triggers.forEach((t, i) => {
      if (t.narrows && !elementIds.has(t.narrows)) {
        errors.push({ file, message: `trigger ${i + 1} narrows "${t.narrows}", which the core protocol does not define` });
      }
    });
  }

  // The taxonomy and the folder have to agree in both directions.
  for (const event of events) {
    if (event.family === null) continue;
    if (families.length > 0 && !families.includes(event.family)) {
      errors.push({ file: "protocols/events.yaml", message: `event "${event.id}" names family "${event.family}", which is not declared` });
    }
    if (families.includes(event.family) && !byId.has(event.family)) {
      errors.push({ file: "protocols/events.yaml", message: `event "${event.id}" needs family "${event.family}", but protocols/families/${event.family}.md does not exist` });
    }
    if (event.event_protocol && !byId.has(event.event_protocol)) {
      errors.push({ file: "protocols/events.yaml", message: `event "${event.id}" points at protocol "${event.event_protocol}", which does not exist` });
    }
  }
  const claimed = new Set(events.flatMap((e) => (e.event_protocol ? [e.event_protocol] : [])));
  for (const { file, data } of files) {
    if (data.layer === "event" && !claimed.has(data.id)) {
      errors.push({ file, message: `no event in events.yaml points at "${data.id}", so it can never apply` });
    }
  }
  return errors;
}
