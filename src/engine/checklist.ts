import { createHash } from "node:crypto";
/**
 * The reviewer checklist: the protocols' own questions, shown rather than sent.
 *
 * A protocol's questions are fixed text. The model never wrote them — it chose
 * among them, up to twenty-two candidates for eight slots, so most were thrown
 * away and which ones survived varied from run to run on the same draft. They
 * also cost most of the prompt's remaining headroom to send.
 *
 * So the app builds this instead. Same intake, same checklist, every time, and
 * grouped by the reviewer who has to answer each one. What the model still
 * writes is the questions this particular draft raises, which is the part that
 * needs judgment.
 *
 * Wording is the protocol's, never reworded here: "Counsel must confirm which
 * rules apply" is a legal hedge the author put there on purpose.
 */
import { PROTOCOL_LAYERS, type ProtocolFile, type ProtocolLayer } from "./protocolFormat.js";
import { PROTOCOL_LIBRARY } from "./protocolLibrary.js";
import { resolveProtocols } from "./protocols.js";
import { SPECIALIST_REVIEW_TYPES, type EvaluationRequest, type SpecialistReviewType } from "./types.js";

/** Where a question with no named reviewer goes. */
export const GENERAL_GROUP = "General";

export interface ChecklistQuestion {
  ask: string;
  /** The protocol it came from, for the group's ordering and for tracing. */
  protocol: string;
  layer: ProtocolLayer;
  /** Review values beyond the one whose group it sits in. */
  also: SpecialistReviewType[];
}

export interface ChecklistGroup {
  /** A specialist review type, or "General". */
  name: string;
  questions: ChecklistQuestion[];
}

export const CHECKLIST_TITLE = "Before you publish: questions for your reviewers";
export const CHECKLIST_INTRO =
  "Standard questions for this kind of situation, from the protocols applied. Your draft-specific questions are above.";

/**
 * The checklist for a set of protocols, grouped by reviewer.
 *
 * A question naming several reviewers appears once, under the first it names,
 * with the rest as tags — printing it three times would make a checklist
 * nobody works through. Groups follow the order of SPECIALIST_REVIEW_TYPES so
 * two reviews of the same kind read the same way round; within a group,
 * questions keep protocol order, which is core first and the file's own order
 * inside that.
 */
export function buildChecklist(protocols: readonly ProtocolFile[]): ChecklistGroup[] {
  const byLayer = [...protocols].sort((a, b) => PROTOCOL_LAYERS.indexOf(a.layer) - PROTOCOL_LAYERS.indexOf(b.layer));
  const groups = new Map<string, ChecklistQuestion[]>();
  // Two protocols can carry the same question — the workforce family and the
  // workforce overlay both ask about union consultation. One checklist entry.
  const seen = new Set<string>();

  for (const protocol of byLayer) {
    for (const q of protocol.questions) {
      const key = q.ask.trim();
      if (seen.has(key)) continue;
      seen.add(key);
      const review = q.review ?? [];
      const group = review[0] ?? GENERAL_GROUP;
      const entry: ChecklistQuestion = {
        ask: q.ask,
        protocol: protocol.id,
        layer: protocol.layer,
        also: review.slice(1),
      };
      groups.set(group, [...(groups.get(group) ?? []), entry]);
    }
  }

  const order = [...SPECIALIST_REVIEW_TYPES, GENERAL_GROUP] as readonly string[];
  return order.flatMap((name) => {
    const questions = groups.get(name);
    return questions && questions.length > 0 ? [{ name, questions }] : [];
  });
}

/** The checklist for a live review, from the intake answers. */
export function checklistFor(request: EvaluationRequest): ChecklistGroup[] {
  return buildChecklist(resolveProtocols(request).protocols);
}

/**
 * Every bundle the library can produce, indexed by the hash a review stores.
 *
 * A saved review records only the hash, so the checklist it showed has to be
 * recovered from that. The hash is one-way, so this indexes the other
 * direction: each combination of layers the resolver could assemble, hashed
 * the same way, mapped back to the protocols.
 *
 * Combinations of protocols, not of intake answers — a few hundred rather than
 * a million, so it is cheap enough to build in the browser. A combination that
 * no intake can actually reach is harmless: its hash simply never matches.
 *
 * It can only recover bundles the CURRENT library can produce. A review run
 * against a protocol version since superseded hashes to something not in here,
 * and its checklist cannot be rebuilt — see checklistForHash.
 */
function everyBundle(library: readonly ProtocolFile[]): ProtocolFile[][] {
  const active = library.filter((p) => p.status === "active");
  const of = (layer: ProtocolLayer) => active.filter((p) => p.layer === layer);
  const optional = <T,>(items: T[]): (T | null)[] => [null, ...items];
  const overlays = of("overlay");
  const out: ProtocolFile[][] = [];

  for (const core of optional(of("core")))
    for (const family of optional(of("family")))
      for (const event of optional(of("event")))
        // Every subset of the overlays, in the id order the resolver sorts to.
        for (let mask = 0; mask < 1 << overlays.length; mask += 1) {
          const chosen = overlays.filter((_, i) => (mask >> i) & 1).sort((a, b) => a.id.localeCompare(b.id));
          const bundle = [core, family, event].filter((p): p is ProtocolFile => p !== null).concat(chosen);
          if (bundle.length > 0) out.push(bundle);
        }
  return out;
}

let index: Map<string, ProtocolFile[]> | null = null;

/** Built once, on first use, so a page that never opens a saved review pays nothing. */
export function bundlesByHash(library: readonly ProtocolFile[] = PROTOCOL_LIBRARY): Map<string, ProtocolFile[]> {
  if (library === PROTOCOL_LIBRARY && index) return index;
  const map = new Map<string, ProtocolFile[]>();
  for (const bundle of everyBundle(library)) map.set(bundleHash(bundle), bundle);
  if (library === PROTOCOL_LIBRARY) index = map;
  return map;
}

/**
 * The same hash resolveProtocols computes, from a list of protocols.
 *
 * Kept identical to the one in protocols.ts by the test that hashes every
 * reachable bundle both ways: if the two ever disagree, saved reviews silently
 * lose their checklists, which is the kind of failure nobody notices.
 */
export function bundleHash(protocols: readonly ProtocolFile[]): string {
  return hashOf(protocols.map((p) => `${p.id}@${p.version}`).join(" "));
}

function hashOf(stamp: string): string {
  return createHash("sha256").update(stamp).digest("hex").slice(0, 12);
}

/**
 * The checklist a saved review showed, recovered from its stored bundle hash.
 *
 * Null when the hash names protocol versions this library no longer has: the
 * review was run against a library since revised, and showing today's
 * checklist in its place would be a quiet lie about what was checked. Prefer
 * checklistForBundle, which survives that.
 */
export function checklistForHash(hash: string | undefined): ChecklistGroup[] | null {
  if (!hash) return null;
  const bundle = bundlesByHash().get(hash);
  return bundle ? buildChecklist(bundle) : null;
}

/**
 * The checklist for a stored `id@version` list.
 *
 * Exact when every version is still in the library. When one is not — the
 * review predates a revision — the protocols are still found by id, so the
 * reader gets the right checklist for the right protocols rather than nothing,
 * and `exact` says the wording may have moved on since. A protocol deleted
 * outright is simply absent, which the count makes visible.
 */
export function checklistForBundle(
  bundle: readonly string[] | undefined,
  library: readonly ProtocolFile[] = PROTOCOL_LIBRARY,
): { groups: ChecklistGroup[]; exact: boolean } | null {
  if (!bundle || bundle.length === 0) return null;
  const found: ProtocolFile[] = [];
  let exact = true;
  for (const entry of bundle) {
    const at = entry.lastIndexOf("@");
    const id = at === -1 ? entry : entry.slice(0, at);
    const version = at === -1 ? "" : entry.slice(at + 1);
    const sameVersion = library.find((p) => p.id === id && p.version === version);
    if (sameVersion) {
      found.push(sameVersion);
      continue;
    }
    exact = false;
    const byId = library.find((p) => p.id === id);
    if (byId) found.push(byId);
  }
  return found.length === 0 ? null : { groups: buildChecklist(found), exact };
}

/** How many questions a checklist holds, for the section's count. */
export function checklistSize(groups: readonly ChecklistGroup[]): number {
  return groups.reduce((n, g) => n + g.questions.length, 0);
}
