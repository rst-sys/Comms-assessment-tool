import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { evaluateDraft, MAX_ATTEMPTS } from "../evaluate.js";
import { EngineError } from "../client.js";
import type { EngineConfig } from "../config.js";
import { DEMO_1 } from "../fixtures.js";
import { sampleAnalysis } from "./helpers.js";

const config: EngineConfig = {
  provider: "Anthropic",
  model: "test-model",
  effort: "high",
  maxOutputTokens: 16000,
  speed: "standard",
  trainingTerm: "Not used to train models",
  processingMode: "Zero-retention API",
};

function fakeClient(response: Partial<Anthropic.Message> & { captured?: (params: unknown) => void }): Anthropic {
  const message: Anthropic.Message = {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "test-model-served",
    content: [],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: null, cache_creation_input_tokens: null } as Anthropic.Usage,
    ...response,
  } as Anthropic.Message;
  return {
    messages: {
      create: async (params: unknown) => {
        response.captured?.(params);
        return message;
      },
    },
  } as unknown as Anthropic;
}

describe("evaluateDraft", () => {
  it("returns a scored, validated result from a well-formed response", async () => {
    let params: Record<string, unknown> = {};
    const client = fakeClient({
      content: [{ type: "text", text: JSON.stringify(sampleAnalysis()), citations: null }],
      captured: (p) => (params = p as Record<string, unknown>),
    });
    const logs: string[] = [];
    const result = await evaluateDraft(DEMO_1.request, { config, client, log: (l) => logs.push(l) });

    expect(result.score).toBe(30); // all dimensions 1.5 → 30
    expect(result.band).toBe("Serious clarity, accountability, or ethical-risk concerns");
    expect(result.confidence_label).toMatch(/draft language only/);
    expect(result.provider).toEqual({ provider: "Anthropic", model: "test-model-served" });
    expect(result.analysis.findings).toHaveLength(1);
    // The only line on a clean run is the latency record, which carries no content.
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(/provider call \d+s \(20 output tokens, effort high, speed standard\)/);
    expect(logs[0]).not.toContain("Rapid growth");

    // The request went out with the configured model, the schema, no sampling temperature, and no fallbacks.
    expect(params.model).toBe("test-model");
    expect(params).not.toHaveProperty("temperature");
    expect(params).not.toHaveProperty("fallbacks");
    const outputConfig = params.output_config as { effort: string; format: { type: string } };
    expect(outputConfig.effort).toBe("high");
    expect(outputConfig.format.type).toBe("json_schema");
    // Framework, then the protocols in the order the layers apply — core, the
    // event, the overlays — then the shared rules and the output notes. The
    // framework comes first so the provider's cache covers as long a prefix as
    // possible. Demo 1 is a layoffs draft, so the workforce overlay applies
    // alongside the event's own protocol.
    const system = params.system as { text: string }[];
    expect(system.map((b) => b.text.split("\n")[0])).toEqual([
      expect.stringContaining("You are the evaluation engine"),
      "CORE PROTOCOL (core protocol)",
      "WORKFORCE REDUCTION AND RESTRUCTURING (event protocol)",
      "WORKFORCE IMPACT (overlay protocol)",
      "HOW TO APPLY THE PROTOCOLS ABOVE",
      expect.stringContaining("OUTPUT STRUCTURE"),
    ]);
  });

  it("fails loudly on malformed JSON without echoing the body", async () => {
    const client = fakeClient({ content: [{ type: "text", text: "{not json", citations: null }] });
    await expect(evaluateDraft(DEMO_1.request, { config, client })).rejects.toMatchObject({
      name: "EngineError",
      kind: "invalid_json",
    });
  });

  it("fails loudly on a schema violation and logs only the path", async () => {
    const bad = sampleAnalysis();
    bad.dimensions = bad.dimensions.slice(0, 9);
    const client = fakeClient({ content: [{ type: "text", text: JSON.stringify(bad), citations: null }] });
    const logs: string[] = [];
    await expect(evaluateDraft(DEMO_1.request, { config, client, log: (l) => logs.push(l) })).rejects.toMatchObject({
      kind: "validation",
      // The path travels with the message: it names the field, never the draft.
      message: "The analysis did not return in the expected format (at /dimensions). Try again.",
    });
    // Two attempts, each logging its latency and the path it failed at, plus
    // the line saying it asked again.
    expect(logs.filter((l) => /validation failed at \/dimensions/.test(l))).toHaveLength(2);
    expect(logs.join("\n")).not.toContain("Rapid growth");
  });

  it("asks once more when the reply is unusable, and gives up after that", async () => {
    // What a tester hit on a good cyber draft: 80 seconds of work thrown away
    // because one reply came back malformed, and a straight retry succeeded.
    // The engine does that retry now.
    const bad = sampleAnalysis();
    bad.dimensions = bad.dimensions.slice(0, 9);
    let calls = 0;
    const flaky = {
      messages: {
        create: async () => {
          calls += 1;
          const analysis = calls === 1 ? bad : sampleAnalysis();
          return {
            id: "msg_test", type: "message", role: "assistant", model: "test-model-served",
            content: [{ type: "text", text: JSON.stringify(analysis), citations: null }],
            stop_reason: "end_turn", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: null, cache_creation_input_tokens: null },
          } as unknown as Anthropic.Message;
        },
      },
    } as unknown as Anthropic;
    const logs: string[] = [];
    const result = await evaluateDraft(DEMO_1.request, { config, client: flaky, log: (l) => logs.push(l) });
    expect(calls).toBe(2);
    expect(result.score).toBeGreaterThan(0);
    expect(logs.join("\n")).toMatch(/came back unusable \(validation\); asking once more/);

    // Twice is the limit: a second bad reply is reported, not a third attempt.
    let always = 0;
    const broken = {
      messages: {
        create: async () => {
          always += 1;
          return {
            id: "msg_test", type: "message", role: "assistant", model: "test-model-served",
            content: [{ type: "text", text: JSON.stringify(bad), citations: null }],
            stop_reason: "end_turn", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: null, cache_creation_input_tokens: null },
          } as unknown as Anthropic.Message;
        },
      },
    } as unknown as Anthropic;
    await expect(evaluateDraft(DEMO_1.request, { config, client: broken })).rejects.toMatchObject({ kind: "validation" });
    expect(always).toBe(MAX_ATTEMPTS);
  });

  it("does not ask again when a second call would fail the same way", async () => {
    // A refusal is the provider's answer, not a bad reply; asking again spends
    // another minute of the reader's time to be told the same thing.
    let calls = 0;
    const refused = {
      messages: {
        create: async () => {
          calls += 1;
          return {
            id: "msg_test", type: "message", role: "assistant", model: "test-model-served",
            content: [], stop_reason: "refusal", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: null, cache_creation_input_tokens: null },
          } as unknown as Anthropic.Message;
        },
      },
    } as unknown as Anthropic;
    await expect(evaluateDraft(DEMO_1.request, { config, client: refused })).rejects.toMatchObject({ kind: "refusal" });
    expect(calls).toBe(1);
  });

  it("surfaces a refusal and a truncated response as distinct errors", async () => {
    const refused = fakeClient({ stop_reason: "refusal", content: [] });
    await expect(evaluateDraft(DEMO_1.request, { config, client: refused })).rejects.toMatchObject({ kind: "refusal" });

    const truncated = fakeClient({ stop_reason: "max_tokens", content: [{ type: "text", text: "{", citations: null }] });
    await expect(evaluateDraft(DEMO_1.request, { config, client: truncated })).rejects.toMatchObject({ kind: "truncated" });
  });

  it("logs drop counts, never the dropped text", async () => {
    const analysis = sampleAnalysis();
    analysis.findings[0]!.excerpt = "This is not in the draft at all.";
    const client = fakeClient({ content: [{ type: "text", text: JSON.stringify(analysis), citations: null }] });
    const logs: string[] = [];
    const result = await evaluateDraft(DEMO_1.request, { config, client, log: (l) => logs.push(l) });
    expect(result.analysis.findings).toHaveLength(0);
    expect(result.adjustments.dropped_findings).toBe(1);
    expect(logs.join("\n")).toMatch(/dropped 1 finding/);
    expect(logs.join("\n")).not.toContain("not in the draft");
  });

  it("rejects an empty draft before calling the provider", async () => {
    await expect(evaluateDraft({ ...DEMO_1.request, draft: "  " }, { config })).rejects.toThrow(/draft is required/);
  });

  it("wraps provider construction failures as auth errors", async () => {
    const saved = { ACR_API_KEY: process.env.ACR_API_KEY, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY };
    delete process.env.ACR_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      await expect(evaluateDraft(DEMO_1.request, { config })).rejects.toSatisfy(
        (e: unknown) => e instanceof EngineError && e.kind === "auth" && /ACR_API_KEY/.test(e.message),
      );
    } finally {
      for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v;
    }
  });
});
