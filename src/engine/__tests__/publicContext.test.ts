import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { EngineConfig } from "../config.js";
import { findPublicContext } from "../publicContext.js";

const config: EngineConfig = { provider: "Anthropic", model: "test-model", effort: "high", maxOutputTokens: 16000, speed: "standard", trainingTerm: "x", processingMode: "y" };

function fakeClient(responses: Array<{ text: string; stop: string }>, captured: (p: unknown) => void): Anthropic {
  let i = 0;
  return {
    messages: {
      create: async (params: unknown) => {
        captured(params);
        const r = responses[Math.min(i++, responses.length - 1)]!;
        return { id: "m", type: "message", role: "assistant", model: "served", content: [{ type: "text", text: r.text, citations: null }], stop_reason: r.stop, stop_sequence: null, usage: { input_tokens: 5, output_tokens: 7 } };
      },
    },
  } as unknown as Anthropic;
}

describe("findPublicContext", () => {
  it("sends the topic with the web search tool and normalizes the items", async () => {
    let params: Record<string, unknown> = {};
    const text = 'Here you go:\n```json\n{"items":[{"title":"Layoffs planned","source":"Trade Daily","url":"https://example.com/a","date":"2026-09-12","summary":"Reports 200 roles will go."},{"title":"Junk","source":"","url":"notaurl","date":"","summary":""}]}\n```';
    const result = await findPublicContext("Northwind layoffs", { config, client: fakeClient([{ text, stop: "end_turn" }], (p) => (params = p as Record<string, unknown>)) });
    expect(result.items).toEqual([{ title: "Layoffs planned", source: "Trade Daily", url: "https://example.com/a", date: "2026-09-12", summary: "Reports 200 roles will go." }]);
    const tools = params.tools as { type: string; name: string }[];
    expect(tools[0]!.type).toBe("web_search_20260209");
    expect((params.messages as { content: string }[])[0]!.content).toBe("Topic: Northwind layoffs");
    expect(result.usage.input_tokens).toBe(5);
  });

  it("continues after a pause_turn and fails loudly on unparseable output", async () => {
    const ok = await findPublicContext("topic here", { config, client: fakeClient([{ text: "", stop: "pause_turn" }, { text: '{"items":[]}', stop: "end_turn" }], () => {}) });
    expect(ok.items).toEqual([]);
    await expect(findPublicContext("topic here", { config, client: fakeClient([{ text: "no json at all", stop: "end_turn" }], () => {}) })).rejects.toMatchObject({ kind: "invalid_json" });
  });

  it("rejects a too-short topic before calling anything", async () => {
    await expect(findPublicContext("ab", { config, client: fakeClient([], () => { throw new Error("should not be called"); }) })).rejects.toMatchObject({ kind: "api" });
  });
});
