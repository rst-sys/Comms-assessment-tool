import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { EngineConfig } from "../config.js";
import { DEMO_1 } from "../fixtures.js";
import { buildRedraftUserMessage, extractPlaceholders, nonInventionRule, REDRAFT_SYSTEM_PROMPT, redraftMinimalRisk, validateRedraft } from "../redraft.js";
import { sampleAnalysis, sampleFinding } from "./helpers.js";

const config: EngineConfig = { provider: "Anthropic", model: "test-model", effort: "high", maxOutputTokens: 16000, trainingTerm: "x", processingMode: "y" };

describe("redraft prompt", () => {
  it("carries the verbatim non-invention rule from the Section 5 prompt", () => {
    const rule = nonInventionRule();
    expect(rule.startsWith("NON-INVENTION\nNever invent metrics, dates, figures")).toBe(true);
    expect(rule).toContain("Do not force self-blame the context does not support.");
    expect(REDRAFT_SYSTEM_PROMPT).toContain(rule);
  });

  it("includes the draft, intake fields, ranked findings and the retrospective note when published", () => {
    const analysis = sampleAnalysis({ findings: [sampleFinding({ id: "F-002", severity: "Low" }), sampleFinding({ id: "F-001", severity: "High" })] });
    const msg = buildRedraftUserMessage(DEMO_1.request, analysis);
    expect(msg).toContain("DRAFT\n<<<\nRapid growth brought complexity.");
    expect(msg).toContain("Communication type: Layoff or restructuring");
    expect(msg.indexOf("F-001 | High")).toBeLessThan(msg.indexOf("F-002 | Low"));
    expect(msg).not.toContain("already been issued");
    expect(buildRedraftUserMessage({ ...DEMO_1.request, already_published: true }, analysis)).toContain("already been issued");
  });
});

describe("extractPlaceholders", () => {
  it("lists each bracketed placeholder once, in order", () => {
    expect(extractPlaceholders("By [date], [accountable executive or team] will report [metric] on [date].")).toEqual(["[date]", "[accountable executive or team]", "[metric]"]);
    expect(extractPlaceholders("no placeholders")).toEqual([]);
  });
});

describe("validateRedraft", () => {
  const findings = [sampleFinding({ id: "F-001" })];
  it("accepts a well-formed redraft and recomputes placeholders from the text", () => {
    const out = validateRedraft(
      { revised_draft: "We decided. [accountable executive or team] owns this by [date].", change_log: [{ finding_id: "F-001", original: "x", revised: "y", reason: "z" }], placeholders: ["[date]"] },
      findings,
    );
    expect(out.placeholders).toEqual(["[accountable executive or team]", "[date]"]);
    expect(out.change_log[0]!.finding_id).toBe("F-001");
  });
  it("nulls unknown finding ids and rejects an empty revision or a bad shape", () => {
    const out = validateRedraft({ revised_draft: "text", change_log: [{ finding_id: "F-099", original: "", revised: "t", reason: "r" }], placeholders: [] }, findings);
    expect(out.change_log[0]!.finding_id).toBeNull();
    expect(() => validateRedraft({ revised_draft: "   ", change_log: [], placeholders: [] }, findings)).toThrow(/revised_draft/);
    expect(() => validateRedraft({ revised_draft: "t", change_log: "nope", placeholders: [] }, findings)).toThrow();
  });
});

describe("redraftMinimalRisk", () => {
  function fakeClient(text: string, captured: (p: unknown) => void): Anthropic {
    return {
      messages: {
        create: async (params: unknown) => {
          captured(params);
          return { id: "m", type: "message", role: "assistant", model: "served", content: [{ type: "text", text, citations: null }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 1, output_tokens: 2 } };
        },
      },
    } as unknown as Anthropic;
  }

  it("calls the model with the redraft prompt and schema and returns a validated result", async () => {
    let params: Record<string, unknown> = {};
    const analysis = sampleAnalysis();
    const body = JSON.stringify({ revised_draft: "Leadership decided to eliminate [number] roles.", change_log: [{ finding_id: "F-001", original: "we are eliminating roles", revised: "Leadership decided to eliminate [number] roles", reason: "names the decision-maker" }], placeholders: [] });
    const result = await redraftMinimalRisk({ ...DEMO_1.request, already_published: true }, analysis, { config, client: fakeClient(body, (p) => (params = p as Record<string, unknown>)) });
    expect(result.revised_draft).toContain("Leadership decided");
    expect(result.placeholders).toEqual(["[number]"]);
    expect(result.retrospective).toBe(true);
    expect(result.provider.model).toBe("served");
    const system = params.system as { text: string }[];
    expect(system[0]!.text.startsWith("You are the Minimal-Risk redraft mode")).toBe(true);
    const format = (params.output_config as { format: { schema: { properties: Record<string, unknown> } } }).format;
    expect(Object.keys(format.schema.properties)).toEqual(["revised_draft", "change_log", "placeholders"]);
    expect(params).not.toHaveProperty("temperature");
  });

  it("fails loudly on malformed output", async () => {
    await expect(redraftMinimalRisk(DEMO_1.request, sampleAnalysis(), { config, client: fakeClient("{bad", () => {}) })).rejects.toMatchObject({ kind: "invalid_json" });
    await expect(redraftMinimalRisk(DEMO_1.request, sampleAnalysis(), { config, client: fakeClient(JSON.stringify({ revised_draft: "" }), () => {}) })).rejects.toMatchObject({ kind: "validation" });
  });
});
