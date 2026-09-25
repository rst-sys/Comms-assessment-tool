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
import { buildProtocolBlock, PROTOCOL_RULES } from "./protocolPrompt.js";
import type { OverlayTrigger, ProtocolFile } from "./protocolFormat.js";
import { PROTOCOL_LIBRARY } from "./protocolLibrary.js";
import { EVENT_BY_LABEL, type EvaluationRequest } from "./types.js";

export type { ProtocolFile } from "./protocolFormat.js";

const ACTIVE = PROTOCOL_LIBRARY.filter((p) => p.status === "active");

export const CORE_PROTOCOL: ProtocolFile | undefined = ACTIVE.find((p) => p.layer === "core");
export const FAMILY_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "family");
export const EVENT_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "event");
export const OVERLAY_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "overlay");

/** Every protocol the library carries, draft or not, for the Standards Library page. */
export const PROTOCOLS: ProtocolFile[] = [...PROTOCOL_LIBRARY];

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

  const toEmployees = request.audiences.some((a) => a.includes("employee") || a.includes("Employee") || a === "Managers and leaders");
  const commercialWithStaff = ["financial-difficulty", "strategy-market-exit", "merger-acquisition"].includes(event?.id ?? "");
  if (event?.family === "workforce" || (commercialWithStaff && toEmployees)) on.push("workforce-impact");

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
export function protocolsFor(request: EvaluationRequest): ProtocolFile[] {
  const applied: ProtocolFile[] = [];
  const event = EVENT_BY_LABEL.get(request.communication_event);

  // The core and the family need a named event. "Something else" has neither,
  // and is judged on the framework plus whatever overlays apply.
  if (event && event.family !== null) {
    if (CORE_PROTOCOL) applied.push(CORE_PROTOCOL);
    const family = FAMILY_PROTOCOLS.find((p) => p.id === event.family);
    if (family) applied.push(family);
    if (event.event_protocol) {
      const own = EVENT_PROTOCOLS.find((p) => p.id === event.event_protocol);
      if (own) applied.push(own);
    }
  }

  const triggers = activeTriggers(request);
  const overlays = OVERLAY_PROTOCOLS.filter((p) => p.trigger && triggers.includes(p.trigger)).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
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
    const places = [...request.locations, request.organization.headquarters].map((p) => p.toLowerCase());
    if (!cond.jurisdiction.some((j) => places.some((p) => p.includes(j.toLowerCase())))) return false;
  }
  return true;
}

/** A protocol with the elements this request does not qualify for removed. */
function filtered(protocol: ProtocolFile, request: EvaluationRequest): ProtocolFile {
  const elements = protocol.elements.filter((e) => elementApplies(e, request));
  return elements.length === protocol.elements.length ? protocol : { ...protocol, elements };
}

export interface ResolvedBundle {
  protocols: ProtocolFile[];
  /** Framework check ids the bundle softens, gathered from every layer. */
  narrows: string[];
  /** Identifies the exact protocol versions a review was run against. */
  hash: string;
}

/** Everything the engine needs to know about which standards this review applied. */
export function resolveProtocols(request: EvaluationRequest): ResolvedBundle {
  const protocols = protocolsFor(request).map((p) => filtered(p, request));
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
