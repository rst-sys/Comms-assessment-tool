import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { evaluateDraft } from "../evaluate.js";
import { EngineError } from "../client.js";
import type { EngineConfig } from "../config.js";
import { DEMO_1 } from "../fixtures.js";
import { sampleAnalysis } from "./helpers.js";

const config: EngineConfig = {
  provider: "Anthropic",
  model: "test-model",
  effort: "high",
  maxOutputTokens: 16000,
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
    expect(logs).toEqual([]);

    // The request went out with the configured model, the schema, no sampling temperature, and no fallbacks.
    expect(params.model).toBe("test-model");
    expect(params).not.toHaveProperty("temperature");
    expect(params).not.toHaveProperty("fallbacks");
    const outputConfig = params.output_config as { effort: string; format: { type: string } };
    expect(outputConfig.effort).toBe("high");
    expect(outputConfig.format.type).toBe("json_schema");
    const system = params.system as { text: string }[];
    expect(system).toHaveLength(3);
    expect(system[0]!.text.startsWith("You are the evaluation engine")).toBe(true);
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
      message: "The analysis did not return in the expected format. Try again.",
    });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(/validation failed at \/dimensions/);
    expect(logs[0]).not.toContain("Rapid growth");
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
