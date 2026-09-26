/**
 * The largest bundle the intake can actually produce.
 *
 * The build used to estimate this by adding the heaviest protocol of each
 * layer to every overlay at once. That number was both wrong and unfalsifiable:
 * wrong because no request can switch on every overlay — a CEO departure
 * cannot also be a layoff, so the workforce overlay never joins the heaviest
 * event protocol — and unfalsifiable because nothing tied it to the resolver
 * that does the real work. A budget nobody can reach is a budget nobody
 * believes, and the first thing anyone does with one is raise it.
 *
 * So this enumerates. Every event, every organization type, both answers to
 * "anyone harmed", every purpose, every format, every stage, an EU and a
 * non-EU headquarters, and each audience on its own plus all of them at once —
 * pushed through `protocolsFor` and `resolveProtocols`, the same functions a
 * review uses. No case is written down here, so none can be quietly chosen to
 * flatter the total.
 *
 * Audiences are the one dimension not fully enumerated: all 512 subsets across
 * every other answer is tens of millions of resolves. Each audience alone and
 * all together is enough, because nothing in the resolver reads more than
 * whether an Employees option is among them — the assertion in
 * bundleWorstCase.test.ts is what keeps that true.
 */
import { buildProtocolBlock, PROTOCOL_RULES, protocolWordCount } from "./protocolPrompt.js";
import type { ProtocolFile } from "./protocolFormat.js";
import { resolveProtocols } from "./protocols.js";
import { DEMOS } from "./fixtures.js";
import {
  AUDIENCES,
  type Audience,
  COMMUNICATION_EVENTS,
  COMMUNICATION_FORMATS,
  ORGANIZATION_TYPES,
  PURPOSES,
  SITUATION_STATUSES,
  type EvaluationRequest,
} from "./types.js";

/** Four chars to the token is the usual rule of thumb, and what the report assumes. */
export const CHARS_PER_TOKEN = 4;

export interface WorstCase {
  words: number;
  tokens: number;
  /** The protocols in the largest bundle, in the order they are sent. */
  protocols: string[];
  /** The intake answers that produce it, in words. */
  answers: string;
  /** How many distinct bundles the enumeration found, and how many requests it tried. */
  bundles: number;
  requests: number;
}

/** An EU and a non-EU headquarters, so bloc-conditional elements are exercised both ways. */
const PLACES = ["Germany", "United States"];

export function worstCase(library?: readonly ProtocolFile[]): WorstCase {
  const audienceSets: Audience[][] = [...AUDIENCES.map((a) => [a]), [...AUDIENCES]];
  const seen = new Map<string, { words: number; tokens: number; protocols: string[]; answers: string }>();
  let requests = 0;

  // Every field the resolver reads is overwritten below; the rest comes from a
  // real request so this cannot drift from the shape a review carries.
  const base: EvaluationRequest = { ...DEMOS[0]!.request, locations: [] };

  for (const communication_event of COMMUNICATION_EVENTS)
    for (const type of ORGANIZATION_TYPES)
      for (const people_at_risk of [true, false])
        for (const purpose of PURPOSES)
          for (const communication_format of COMMUNICATION_FORMATS)
            for (const situation of SITUATION_STATUSES)
              for (const headquarters of PLACES)
                for (const audiences of audienceSets) {
                  requests += 1;
                  const request: EvaluationRequest = {
                    ...base,
                    communication_event,
                    communication_format,
                    purpose,
                    situation,
                    people_at_risk,
                    audiences,
                    organization: { type, headquarters },
                  };
                  const { protocols } = resolveProtocols(request, library);
                  if (protocols.length === 0) continue;
                  // Two requests that resolve to the same protocols and the same
                  // surviving elements produce the same text, so measure once.
                  const key = protocols.map((p) => `${p.id}:${p.elements.map((e) => e.id).join(",")}`).join("|");
                  if (seen.has(key)) continue;
                  const text = [...protocols.map(buildProtocolBlock), PROTOCOL_RULES].join("\n\n");
                  seen.set(key, {
                    words: protocolWordCount(text),
                    tokens: Math.ceil(text.length / CHARS_PER_TOKEN),
                    protocols: protocols.map((p) => p.id),
                    answers:
                      `${communication_event} · ${type} · ${headquarters} · ${communication_format} · ` +
                      `${purpose} · ${situation} · anyone harmed: ${people_at_risk ? "yes" : "no"} · ` +
                      `audiences: ${audiences.length === AUDIENCES.length ? "all" : audiences.join(", ")}`,
                  });
                }

  const all = [...seen.values()];
  const top = all.reduce((a, b) => (b.words > a.words ? b : a), all[0]!);
  return { ...top, bundles: seen.size, requests };
}
