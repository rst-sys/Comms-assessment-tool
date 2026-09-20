import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { buildCompareUserMessage, compareWithSaved, finishComparison } from "../compare.js";
import type { EngineConfig } from "../config.js";
import type { EvaluationResult } from "../evaluate.js";
import { DEMO_1 } from "../fixtures.js";
import { buildSavedReview } from "../savedReview.js";

const config: EngineConfig = { provider: "Anthropic", model: "test-model", effort: "high", maxOutputTokens: 16000, trainingTerm: "x", processingMode: "y" };
const usage = { input_tokens: 1, output_tokens: 2, cache_read_input_tokens: null, cache_creation_input_tokens: null };

function load(prefix: string): EvaluationResult {
  const dir = "fixture-reports";
  const file = readdirSync(dir).find((f) => f.startsWith(prefix + "-2026") && f.endsWith(".json"))!;
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as EvaluationResult;
}

const fresh = load("demo1");
const saved = buildSavedReview(load("demo1"), DEMO_1.request);
const newRequest = { ...DEMO_1.request, draft: "The executive team decided on 4 September to eliminate 40 roles in support." };

describe("buildCompareUserMessage", () => {
  it("carries the earlier findings and the new draft, and never claims to have the earlier draft", () => {
    const msg = buildCompareUserMessage(saved, newRequest, fresh);
    expect(msg).toContain("EARLIER REVIEW");
    expect(msg).toContain(saved.findings[0]!.finding);
    expect(msg).toContain("NEW VERSION OF THE DRAFT");
    expect(msg).toContain("The executive team decided on 4 September");
    expect(msg).toContain("FRESH REVIEW OF THE NEW VERSION");
    // The earlier draft is never available to pass on: only the review's own words go in.
    expect(msg).not.toContain(DEMO_1.request.draft);
  });
});

describe("finishComparison", () => {
  it("computes score and dimension movement and drops ids that do not exist", () => {
    const raw = {
      summary: "The new version names the deciding body. Support and verification are still missing.",
      verdicts: [
        { finding_id: saved.findings[0]!.id, verdict: "Resolved", evidence: "The new version names the executive team." },
        { finding_id: "F-999", verdict: "Still open", evidence: "not a real finding" },
      ],
      new_concerns: [fresh.analysis.findings[0]!.id, "F-888"],
    };
    const result = finishComparison(raw, saved, fresh, ["Primary audience"], { requestId: "abc", provider: { provider: "Anthropic", model: "m" }, usage });
    expect(result.verdicts).toHaveLength(1);
    expect(result.new_concerns).toEqual([fresh.analysis.findings[0]!.id]);
    expect(result.score_before).toBe(saved.score);
    expect(result.score_after).toBe(fresh.score);
    expect(result.movements).toHaveLength(10);
    expect(result.movements[0]).toMatchObject({ before: expect.any(Number), after: expect.any(Number) });
    expect(result.drift).toEqual(["Primary audience"]);
  });

  it("fails loudly on a malformed comparison", () => {
    expect(() => finishComparison({ summary: "x" }, saved, fresh, [], { requestId: "a", provider: { provider: "p", model: "m" }, usage })).toThrow(/expected format/);
    expect(() => finishComparison({ summary: "x", verdicts: [{ finding_id: "F-001", verdict: "Better", evidence: "e" }], new_concerns: [] }, saved, fresh, [], { requestId: "a", provider: { provider: "p", model: "m" }, usage })).toThrow(/expected format/);
  });
});

describe("compareWithSaved", () => {
  it("calls the model with the comparison prompt and schema", async () => {
    let params: Record<string, unknown> = {};
    const body = JSON.stringify({ summary: "Stronger on ownership. Verification still absent.", verdicts: [], new_concerns: [] });
    const client = {
      messages: {
        create: async (p: unknown) => {
          params = p as Record<string, unknown>;
          return { id: "m", type: "message", role: "assistant", model: "served", content: [{ type: "text", text: body, citations: null }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 3, output_tokens: 4 } };
        },
      },
    } as unknown as Anthropic;
    const result = await compareWithSaved(saved, newRequest, fresh, [], { config, client });
    expect(result.summary).toContain("Stronger on ownership");
    expect((params.system as { text: string }[])[0]!.text.startsWith("You compare two versions")).toBe(true);
    const format = (params.output_config as { format: { schema: { properties: Record<string, unknown> } } }).format;
    expect(Object.keys(format.schema.properties).sort()).toEqual(["new_concerns", "summary", "verdicts"]);
  });
});
