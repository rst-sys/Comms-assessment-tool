/**
 * Find public context (PROMPT.md revision 10): one provider call with the
 * provider's web search tool, for a topic the user typed. The draft is never
 * part of the query. Returns short, sourced items the user chooses from.
 */
import Anthropic from "@anthropic-ai/sdk";
import { EngineError, newRequestId, type ModelUsage } from "./client.js";
import { getEngineConfig, type EngineConfig } from "./config.js";
import { resolveApiKey } from "./config.js";

export interface PublicContextItem {
  title: string;
  source: string;
  url: string;
  date: string | null;
  /** The material claims and concerns a reader would take from it, 2-4 sentences. */
  summary: string;
}

export interface PublicContextResult {
  items: PublicContextItem[];
  request_id: string;
  usage: ModelUsage;
}

export const PUBLIC_CONTEXT_SYSTEM = `You help a communications professional understand what the public already knows about a topic before they issue a statement. Use the web search tool to find recent, relevant public coverage of the topic you are given: news reports, trade press, analyst or regulator commentary, notable public reactions. Return at most six items. For each, give the title, the source (publication or site), the URL, the date if known, and a summary of two to four sentences stating the material claims and concerns a reader would take from it. Report what sources say; do not assert that any claim is true. If nothing relevant exists, return an empty list.

Reply with only a JSON object of the form {"items":[{"title":"","source":"","url":"","date":"" or null,"summary":""}]} and no other text.`;

const MAX_QUERY = 300;

function extractJson(text: string): unknown {
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fence ? fence[1]! : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no json");
  return JSON.parse(body.slice(start, end + 1));
}

function normalizeItems(raw: unknown): PublicContextItem[] {
  const items = typeof raw === "object" && raw !== null && Array.isArray((raw as { items?: unknown }).items) ? ((raw as { items: unknown[] }).items) : [];
  return items
    .filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null)
    .map((it) => ({
      title: String(it.title ?? "").trim() || "Untitled",
      source: String(it.source ?? "").trim() || "Unknown source",
      url: typeof it.url === "string" && /^https?:\/\//.test(it.url) ? it.url : "",
      date: typeof it.date === "string" && it.date.trim() ? it.date.trim() : null,
      summary: String(it.summary ?? "").trim(),
    }))
    .filter((it) => it.summary.length > 0)
    .slice(0, 6);
}

export interface PublicContextOptions {
  config?: EngineConfig;
  client?: Anthropic;
}

export async function findPublicContext(query: string, options: PublicContextOptions = {}): Promise<PublicContextResult> {
  const requestId = newRequestId();
  const q = query.trim().slice(0, MAX_QUERY);
  if (q.length < 3) throw new EngineError("api", "Enter a topic of at least three characters.", requestId);
  const config = options.config ?? getEngineConfig();
  let client = options.client;
  if (!client) {
    const apiKey = resolveApiKey();
    if (!apiKey) throw new EngineError("auth", "No provider credential is configured.", requestId);
    client = new Anthropic({ apiKey });
  }

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: `Topic: ${q}` }];
  const usage: ModelUsage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: null, cache_creation_input_tokens: null };
  let text = "";
  for (let round = 0; round < 3; round++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: config.model,
        max_tokens: 4000,
        system: PUBLIC_CONTEXT_SYSTEM,
        messages,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 } as unknown as Anthropic.Messages.ToolUnion],
      });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) throw new EngineError("auth", "The provider rejected the configured credential.", requestId, error);
      if (error instanceof Anthropic.APIError) throw new EngineError("api", `Provider error ${error.status ?? "unknown"}: ${error.name}`, requestId, error);
      throw new EngineError("api", "The search failed.", requestId, error);
    }
    usage.input_tokens += response.usage.input_tokens;
    usage.output_tokens += response.usage.output_tokens;
    text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n");
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    if (response.stop_reason === "refusal") throw new EngineError("refusal", "The provider declined this search.", requestId);
    break;
  }

  let items: PublicContextItem[];
  try {
    items = normalizeItems(extractJson(text));
  } catch (error) {
    throw new EngineError("invalid_json", "The search did not return in the expected format. Try again.", requestId, error);
  }
  return { items, request_id: requestId, usage };
}
