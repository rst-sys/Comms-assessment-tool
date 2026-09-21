/**
 * Which protocols apply to a request, and what the engine sends when they do.
 *
 * Selection is by the intake dropdowns, not by reading the draft for keywords:
 * the user says what happened, so exactly one core, at most one event protocol
 * and at most one posture protocol load. Nothing scans thirteen files to guess.
 *
 * The protocols themselves live in protocols/*.md and are compiled into
 * protocolLibrary.ts by `npm run protocols`. This file only chooses among them
 * and assembles the blocks. The Standards Library page reads the same list, so
 * what the tool claims to apply and what it sends cannot drift apart.
 */
import { buildProtocolBlock, PROTOCOL_RULES } from "./protocolPrompt.js";
import type { ProtocolFile } from "./protocolFormat.js";
import { PROTOCOL_LIBRARY } from "./protocolLibrary.js";
import { FAILURE_EVENTS, NO_EVENT, type EvaluationRequest } from "./types.js";

export type { ProtocolFile } from "./protocolFormat.js";

const ACTIVE = PROTOCOL_LIBRARY.filter((p) => p.status === "active");

export const CORE_PROTOCOL: ProtocolFile | undefined = ACTIVE.find((p) => p.layer === "core");
export const EVENT_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "event");
export const POSTURE_PROTOCOLS: ProtocolFile[] = ACTIVE.filter((p) => p.layer === "posture");

/** Every protocol the library carries, for the Standards Library page. */
export const PROTOCOLS: ProtocolFile[] = ACTIVE;

/**
 * The protocols that apply, in the order they are sent: the core first, then
 * the event, then the posture. Order matters for the provider's cache — the
 * core is identical on every high-stakes review, so it belongs in front of the
 * part that varies.
 */
export function protocolsFor(request: EvaluationRequest): ProtocolFile[] {
  const applied: ProtocolFile[] = [];
  const event = request.communication_event;

  if (event !== NO_EVENT) {
    if (CORE_PROTOCOL) applied.push(CORE_PROTOCOL);
    const forEvent = EVENT_PROTOCOLS.find((p) => p.event === event);
    if (forEvent) applied.push(forEvent);
  }

  // A posture sits on top of any event, and on top of none: an apology for a
  // routine mistake still needs to acknowledge responsibility and offer repair.
  const posture = POSTURE_PROTOCOLS.find((p) => p.goals?.includes(request.goal));
  if (posture) applied.push(posture);

  return applied;
}

/** The prompt blocks for a request: one per protocol, then the shared rules once. */
export function protocolBlocksFor(request: EvaluationRequest): string[] {
  const applied = protocolsFor(request);
  if (applied.length === 0) return [];
  const failure = FAILURE_EVENTS.has(request.communication_event);
  return [...applied.map((p) => buildProtocolBlock(p, failure)), PROTOCOL_RULES];
}
