/**
 * Which protocols apply to a request, and what the engine sends when they do.
 *
 * Four layers, applied in order: the core whenever an event is named, the one
 * family that event belongs to, the event's own protocol where it has one, and
 * any overlays the intake answers switch on. Each layer may add an element or
 * narrow one above it; none may delete one, and none adds a score.
 *
 * Selection is by the intake answers alone — no model call, no reading the
 * draft for keywords — so the same answers always produce the same bundle.
 *
 * The protocols live in protocols/**.md and are compiled into
 * protocolLibrary.ts by `npm run protocols`. This file only chooses among them
 * and assembles the blocks. The Standards Library page reads the same list, so
 * what the tool claims to apply and what it sends cannot drift apart.
 */
import { createHash } from "node:crypto";
import { jurisdictionCountries } from "./countries.js";
import { buildProtocolBlock, PROTOCOL_RULES } from "./protocolPrompt.js";
import type { OverlayTrigger, ProtocolFile } from "./protocolFormat.js";
import { PROTOCOL_LIBRARY } from "./protocolLibrary.js";
import { EMPLOYEE_AUDIENCES, EVENT_BY_LABEL, type EvaluationRequest } from "./types.js";

export type { ProtocolFile } from "./protocolFormat.js";

const ACTIVE = PROTOCOL_LIBRARY.filter((p) => p.status === "active");

export const CORE_PROTOCOL: ProtocolFile | undefined = ACTIVE.find((p) => p.layer === "core");
export const FAMILY_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "family");
export const EVENT_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "event");
export const OVERLAY_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "overlay");

/** Every protocol the library carries, draft or not, for the Standards Library page. */
export const PROTOCOLS: ProtocolFile[] = [...PROTOCOL_LIBRARY];

/**
 * Element ids that moved between protocols, old id to new.
 *
 * workforce-reduction 2.0.0 handed five elements to the workforce-impact
 * overlay so they would also reach site closures, market exits and mergers.
 * The wording did not change, but the id did, and a review saved before the
 * move names the old one. Anything resolving an element id goes through here
 * first, so an old saved review still displays instead of showing a blank.
 */
export const MOVED_ELEMENT_IDS: Record<string, string> = {
  "workforce-reduction.decision-status": "workforce-impact.decision-status",
  "workforce-reduction.scope-of-impact": "workforce-impact.scope-of-impact",
  "workforce-reduction.selection-basis-and-alternatives": "workforce-impact.selection-basis-and-alternatives",
  "workforce-reduction.individual-notice-timing-and-terms": "workforce-impact.individual-notice-timing-and-terms",
  "workforce-reduction.voice-and-what-can-still-change": "workforce-impact.voice-and-what-can-still-change",
};

/** The element an id names today, following any move. Undefined if it never existed. */
export function elementById(id: string): ProtocolFile["elements"][number] | undefined {
  const current = MOVED_ELEMENT_IDS[id] ?? id;
  for (const p of PROTOCOL_LIBRARY) {
    const found = p.elements.find((e) => e.id === current);
    if (found) return found;
  }
  return undefined;
}

/** Whether the library still holds protocols that are written but not switched on. */
export const HAS_DRAFT_PROTOCOLS = PROTOCOL_LIBRARY.some((p) => p.status === "draft");

/**
 * Which overlay rules the intake answers switch on.
 *
 * Kept in code rather than in the protocol files because a rule reads across
 * several answers at once, and a file that could define its own trigger could
 * quietly widen it. A file names a rule; this decides what the rule means.
 */
export function activeTriggers(request: EvaluationRequest): OverlayTrigger[] {
  const event = EVENT_BY_LABEL.get(request.communication_event);
  const on: OverlayTrigger[] = [];

  if (request.organization.type === "Publicly listed company") on.push("listed-company");
  if (request.people_at_risk) on.push("people-harmed");

  // Named events rather than the workforce family: the family also holds
  // "Strike or labor dispute" and "Major policy change", where nobody's role
  // ends and the overlay's questions about selection criteria and last working
  // days would be noise. Labor-relations law during a dispute was not reviewed
  // for the overlay either, which is the other reason it stays out.
  const JOB_AFFECTING = ["layoffs", "restructuring", "site-closure"];
  const COMMERCIAL = ["financial-difficulty", "strategy-market-exit", "merger-acquisition"];
  const toEmployees = request.audiences.some((a) => (EMPLOYEE_AUDIENCES as readonly string[]).includes(a));
  const id = event?.id ?? "";
  if (JOB_AFFECTING.includes(id) || (COMMERCIAL.includes(id) && toEmployees)) on.push("workforce-impact");

  if (event?.id === "cyber-incident") on.push("personal-data");
  if (request.situation === "Not yet public" || request.situation === "Still unfolding") on.push("stage-unfolding");
  if (request.purpose === "Apologize and take responsibility") on.push("apology");

  return on;
}

/**
 * The protocols that apply, in the order they are sent.
 *
 * Overlays are ordered by id so a bundle is the same list however the intake
 * was filled in; a bundle hash that changed with the order of the answers
 * would be useless for tracing a review back to what produced it.
 */
export function protocolsFor(request: EvaluationRequest, library: readonly ProtocolFile[] = PROTOCOL_LIBRARY): ProtocolFile[] {
  const active = library === PROTOCOL_LIBRARY ? ACTIVE : library.filter((p) => p.status === "active");
  const applied: ProtocolFile[] = [];
  const event = EVENT_BY_LABEL.get(request.communication_event);

  // The core applies to every event on the menu, "Something else" included: it
  // is what the tool asks of any high-stakes message, and an event nobody has
  // written a protocol for still gets one. Only the family and the event's own
  // protocol need a family, which "Something else" has not got.
  if (event) {
    const core = active.find((p) => p.layer === "core");
    if (core) applied.push(core);
    if (event.family !== null) {
      const family = active.find((p) => p.layer === "family" && p.id === event.family);
      if (family) applied.push(family);
      if (event.event_protocol) {
        const own = active.find((p) => p.layer === "event" && p.id === event.event_protocol);
        if (own) applied.push(own);
      }
    }
  }

  const triggers = activeTriggers(request);
  const overlays = active
    .filter((p) => p.layer === "overlay" && p.trigger && triggers.includes(p.trigger))
    .sort((a, b) => a.id.localeCompare(b.id));
  applied.push(...overlays);

  return applied;
}

/**
 * Elements dropped because their conditions do not hold.
 *
 * Jurisdiction is not an overlay: a US filing rule does not deserve a protocol
 * of its own, it deserves not to be sent to a German charity. An element with
 * no `applies_if` always applies.
 */
export function elementApplies(element: ProtocolFile["elements"][number], request: EvaluationRequest): boolean {
  const cond = element.applies_if;
  if (!cond) return true;
  if (cond.org_type && cond.org_type.length > 0) {
    const type = request.organization.type.toLowerCase().replace(/[^a-z]+/g, "_");
    if (!cond.org_type.some((t) => type.includes(t.toLowerCase()))) return false;
  }
  if (cond.jurisdiction && cond.jurisdiction.length > 0) {
    // A bloc expands to the countries the intake actually offers. Matching on
    // whole names, not substrings: "Niger" must not answer for "Nigeria".
    const places = new Set([...request.locations, request.organization.headquarters].map((p) => p.toLowerCase()));
    const covered = cond.jurisdiction.flatMap((j) => jurisdictionCountries(j)).map((c) => c.toLowerCase());
    if (!covered.some((c) => places.has(c))) return false;
  }
  // Exact match on the intake's own option, not a substring: "Holding
  // statement" and "Press release or public statement" are different answers
  // and an element written for one must not reach the other.
  if (cond.format && cond.format.length > 0) {
    if (!cond.format.includes(request.communication_format)) return false;
  }
  return true;
}

/** A protocol with the elements this request does not qualify for removed. */
function filtered(protocol: ProtocolFile, request: EvaluationRequest, superseded: Set<string> = new Set()): ProtocolFile {
  const elements = protocol.elements.filter((e) => elementApplies(e, request) && !superseded.has(e.id));
  return elements.length === protocol.elements.length ? protocol : { ...protocol, elements };
}

/**
 * Overlay elements an event protocol's own element supersedes.
 *
 * Only elements that survived the applies_if filter get to supersede anything.
 * An EU-only element dropped for a US organization has not been sent, so
 * letting it silently delete the overlay's general version would leave the
 * check missing from both layers.
 */
function supersededBy(protocols: ProtocolFile[]): Set<string> {
  return new Set(protocols.flatMap((p) => p.elements.flatMap((e) => e.replaces ?? [])));
}

export interface ResolvedBundle {
  protocols: ProtocolFile[];
  /** Framework check ids the bundle softens, gathered from every layer. */
  narrows: string[];
  /** Identifies the exact protocol versions a review was run against. */
  hash: string;
}

/** Everything the engine needs to know about which standards this review applied. */
export function resolveProtocols(request: EvaluationRequest, library?: readonly ProtocolFile[]): ResolvedBundle {
  // Two passes. The first drops what the intake does not qualify for; the
  // second drops the overlay elements that what survived has replaced.
  const applicable = protocolsFor(request, library).map((p) => filtered(p, request));
  const superseded = supersededBy(applicable);
  const protocols = applicable.map((p) => filtered(p, request, superseded));
  const narrows = [...new Set(protocols.flatMap((p) => p.narrows ?? []))].sort();
  const stamp = protocols.map((p) => `${p.id}@${p.version}`).join(" ");
  return { protocols, narrows, hash: createHash("sha256").update(stamp).digest("hex").slice(0, 12) };
}

/** The prompt blocks for a request: one per protocol, then the shared rules once. */
export function protocolBlocksFor(request: EvaluationRequest): string[] {
  const { protocols } = resolveProtocols(request);
  if (protocols.length === 0) return [];
  return [...protocols.map((p) => buildProtocolBlock(p)), PROTOCOL_RULES];
}
