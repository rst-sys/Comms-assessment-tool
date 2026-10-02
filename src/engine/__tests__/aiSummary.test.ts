import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { AI_SUMMARY_MAX_WORDS, aiSummaryLeak, normalizeAiSummary } from "../aiSummary.js";
import type { EngineConfig } from "../config.js";
import { evaluateDraft, finishEvaluation } from "../evaluate.js";
import { DEMO_1 } from "../fixtures.js";
import { normalizeAnalysis } from "../normalize.js";
import { ANALYSIS_SCHEMA, relaxForProvider } from "../schema.js";
import type { EvaluationRequest } from "../types.js";
import { sampleAnalysis } from "./helpers.js";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

describe("normalizeAiSummary: a bad summary is dropped, never repaired", () => {
  it.each([
    ["missing", undefined, "ai_summary_missing"],
    ["null", null, "ai_summary_missing"],
    ["a number", 42, "ai_summary_malformed"],
    ["an object", { text: "The company says…" }, "ai_summary_malformed"],
    ["empty", "", "ai_summary_empty"],
    ["only spaces", "   \n ", "ai_summary_empty"],
    ["over the word limit", words(AI_SUMMARY_MAX_WORDS + 1), "ai_summary_too_long"],
  ])("%s → dropped with a repaired code", (_label, value, code) => {
    const repairs: string[] = [];
    expect(normalizeAiSummary(value, repairs)).toBeUndefined();
    expect(repairs).toEqual([code]);
  });

  it("keeps a summary at the word limit, with its spacing tidied", () => {
    const repairs: string[] = [];
    expect(normalizeAiSummary(`  ${words(AI_SUMMARY_MAX_WORDS)}\n`, repairs)).toBe(words(AI_SUMMARY_MAX_WORDS));
    expect(normalizeAiSummary("The company says\n it is  cutting jobs.", repairs)).toBe("The company says it is cutting jobs.");
    expect(repairs).toEqual([]);
  });

  it("leaves no ai_summary key behind on the normalized analysis when it drops one", () => {
    const repairs: string[] = [];
    const normalized = normalizeAnalysis({ ...sampleAnalysis(), ai_summary: "  " }, repairs) as Record<string, unknown>;
    expect("ai_summary" in normalized).toBe(false);
    expect(repairs).toContain("ai_summary_empty");
  });
});

describe("the schemas", () => {
  it("lets the strict check pass without a summary, so older and dropped ones still validate", () => {
    expect(ANALYSIS_SCHEMA.required).not.toContain("ai_summary");
    expect(Object.keys(ANALYSIS_SCHEMA.properties as object)).toContain("ai_summary");
  });

  it("still asks the provider for a summary every time", () => {
    const relaxed = relaxForProvider(ANALYSIS_SCHEMA) as { required: string[]; properties: object };
    expect(relaxed.required).toContain("ai_summary");
    expect(relaxed.required).toEqual(Object.keys(relaxed.properties));
  });
});

const withContext = (context: string, extra: Partial<EvaluationRequest> = {}): EvaluationRequest => ({
  ...DEMO_1.request,
  draft:
    "We are closing the Leeds warehouse in March. About 40 roles will go. We are eliminating roles to become leaner and more agile.",
  context,
  ...extra,
});

describe("aiSummaryLeak: nothing only the context knows", () => {
  // The test the owner asked for: a figure and a phrase that appear only in the
  // context must both be caught.
  const context = "The board approved a severance budget of 2.4 million. Staff with over five years of service get twelve weeks' pay.";

  it("catches a figure that appears in the context and not in the draft", () => {
    expect(aiSummaryLeak("The company is closing a warehouse and has set aside 2.4 million for severance.", withContext(context))).toBe("context_number");
  });

  it("catches a run of four words that appears in the context and not in the draft", () => {
    expect(aiSummaryLeak("The company is closing a warehouse; staff with over five years get more.", withContext(context))).toBe("context_phrase");
  });

  it("keeps a figure the draft also states, even when the context repeats it", () => {
    const request = withContext("Confirmed: 40 roles, all in Leeds.");
    expect(aiSummaryLeak("The company says it is closing its Leeds warehouse in March and cutting about 40 jobs.", request)).toBeNull();
  });

  it("keeps a phrase the draft also uses, even when the context repeats it", () => {
    const request = withContext("Leadership wants to become leaner and more agile by year end.");
    expect(aiSummaryLeak("The company says it is eliminating roles to become leaner and more agile, which means cutting jobs.", request)).toBeNull();
  });

  it("matches figures written with and without a thousands separator", () => {
    const request = withContext("Severance totals 1200000 pounds.");
    expect(aiSummaryLeak("The company has set aside 1,200,000 pounds.", request)).toBe("context_number");
  });

  it("treats curly and straight apostrophes alike", () => {
    const request = withContext("Everyone gets twelve weeks’ pay as a minimum.");
    expect(aiSummaryLeak("Everyone gets twelve weeks' pay, it says.", request)).toBe("context_phrase");
  });

  it("checks attached documents and the main announcement as well as the context box", () => {
    const doc = { kind: "prior_communication" as const, title: "FAQ", description: "", delivery: "", reach: "all" as const, same_time: false, text: "Redundancy pay starts at 16 weeks." };
    expect(aiSummaryLeak("Redundancy pay starts at 16 weeks.", withContext("", { audience_documents: [doc] }))).not.toBeNull();
    expect(aiSummaryLeak("It follows a 7 percent fall in sales.", withContext("", { main_announcement: "Sales fell 7 percent this year." }))).toBe("context_number");
  });

  it("has nothing to check when no context was supplied", () => {
    expect(aiSummaryLeak("The company has set aside 2.4 million.", withContext(""))).toBeNull();
  });

  it("does not catch a leak the model has fully reworded — the stated limit", () => {
    expect(aiSummaryLeak("The company is closing a warehouse and paying long-serving staff extra.", withContext(context))).toBeNull();
  });
});

/**
 * The Arcadia merger test, where honest summaries were being dropped: the
 * draft restates its context closely, so a faithful summary shares four-word
 * runs with it. A run now counts only when it carries a telling word the
 * draft never uses.
 */
describe("aiSummaryLeak on the Arcadia merger test", () => {
  const arcadia: EvaluationRequest = {
    ...DEMO_1.request,
    communication_event: "Merger, acquisition or sale",
    draft: [
      "Arcadia and Halvorsen: what yesterday's announcement means for you",
      "Dear Halvorsen colleagues,",
      "Yesterday Arcadia signed an agreement to acquire Halvorsen. I want to tell you directly what that means, and what it doesn't.",
      "The deal isn't done yet. It needs clearance from US competition authorities and approval from Halvorsen's shareholders. We expect it to close in the first quarter of 2027, but that could take longer, and a deal like this can be blocked.",
      "Until then, we are two separate companies, and competitors. Please keep doing your jobs exactly as you do today, for Halvorsen and its customers. Keep competing with Arcadia for business. Don't share pricing, customer or product plans with anyone at Arcadia, and don't take instructions from Arcadia. If anyone asks you to, tell your manager or Halvorsen's legal team.",
      "What happens after closing hasn't been decided. That includes jobs, leadership, products and prices. A small team, working under strict rules set by our lawyers, is planning for the day the deal closes. It isn't making decisions for either company today.",
      "What I can tell you is why Arcadia wants to bring the companies together: we think Halvorsen's engineering and Arcadia's distribution would serve customers better together. Whether that proves true depends on decisions we can't make yet.",
      "We'll write again when the deal has cleared, or sooner if anything significant changes. Questions: dealquestions@halvorsenfixings.com, answered by Halvorsen, not Arcadia.",
      "Maria Lind\nChief Executive Officer, Arcadia Tools",
    ].join("\n\n"),
    context:
      "Agreement signed 27 September 2026. Needs US antitrust clearance under the HSR Act (waiting period not yet expired) and Halvorsen shareholder approval. Expected to close in the first quarter of 2027; could be delayed or blocked. Until closing the companies must operate independently and keep competing; counsel has set up a clean team for integration planning. No decisions have been made about jobs, leadership, products or prices after closing. The announcement was filed with the SEC under Rule 425.",
  };
  const summary =
    "Arcadia Tools' chief executive tells Halvorsen employees that Arcadia has signed an agreement to acquire their company, pending US competition clearance and a Halvorsen shareholder vote, with closing expected in early 2027 and possibly blocked. Until then the two firms remain separate competitors; staff are told to keep working as normal and not share plans with Arcadia. Decisions on jobs, leadership, products and prices are not yet made.";
  const restated = summary.replace(
    "Decisions on jobs, leadership, products and prices are not yet made.",
    "No decisions have been made about jobs, leadership, products or prices.",
  );

  it("keeps the accurate, draft-only summary", () => {
    expect(aiSummaryLeak(summary, arcadia)).toBeNull();
  });

  it("keeps a summary that echoes the context's sentence using only words the draft or common speech supplies", () => {
    // Every word of "No decisions have been made about jobs, leadership,
    // products or prices" is in the draft except "made", which is common.
    expect(aiSummaryLeak(restated, arcadia)).toBeNull();
  });

  it.each([
    ["the clean team", summary.replace("Until then", "A clean team for integration planning is preparing for closing. Until then")],
    ["the HSR Act", summary.replace("pending US competition clearance", "pending US competition clearance under the HSR Act")],
    ["the SEC filing, with no figure", `${summary} The announcement was filed with the SEC.`],
  ])("drops a summary that copies %s from the context", (_label, leaked) => {
    expect(aiSummaryLeak(leaked, arcadia)).toBe("context_phrase");
  });

  it("drops a summary citing Rule 425, through the figure: the words are not one run in the context", () => {
    expect(aiSummaryLeak(`${summary} The announcement was filed under Rule 425.`, arcadia)).toBe("context_number");
  });

  // Expected behaviour, not a bug: the known gap in the phrase rule. A
  // context phrase whose every telling word also appears somewhere in the
  // draft passes, even though the draft never says it. That is the price of
  // not dropping honest summaries of drafts that restate their context.
  it("known gap (expected): passes a copied context phrase whose telling words all appear elsewhere in the draft", () => {
    const leeds: EvaluationRequest = {
      ...DEMO_1.request,
      draft:
        "Our Leeds team has done outstanding work this year. Every site in the group is part of the review. We will close the review and share what we decide in March.",
      context: "Decided: the Leeds site will close in March.",
    };
    expect(aiSummaryLeak("The company says the Leeds site will close in March.", leeds)).toBeNull();
  });
});

const finish = (raw: unknown, request: EvaluationRequest, log: string[] = []) =>
  finishEvaluation(raw, request, {
    requestId: "req",
    provider: { provider: "Anthropic", model: "test" },
    usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } as never,
    log: (l) => log.push(l),
  });

describe("finishEvaluation and the summary", () => {
  it("drops a leaking summary, logs a code without the text, and keeps the review", () => {
    const log: string[] = [];
    const summary = "The company has set aside 2.4 million for severance.";
    const request = withContext("Severance budget: 2.4 million.");
    const raw = sampleAnalysis({ ai_summary: summary, findings: [] });
    const result = finish(raw, request, log);
    expect(result.analysis.ai_summary).toBeUndefined();
    expect("ai_summary" in result.analysis).toBe(false);
    expect(log).toContain("[req] repaired: ai_summary_context_number");
    expect(log.join("\n")).not.toContain("2.4");
  });

  it("keeps a clean summary", () => {
    const result = finish(sampleAnalysis({ findings: [] }), withContext(""));
    expect(result.analysis.ai_summary).toBe(sampleAnalysis().ai_summary);
  });

  it("gives the same score with a summary, without one, and with one dropped", () => {
    const request = withContext("Severance budget: 2.4 million.");
    const { ai_summary: _none, ...without } = sampleAnalysis({ findings: [] });
    const scores = [
      finish(sampleAnalysis({ findings: [] }), request).score,
      finish(without, request).score,
      finish(sampleAnalysis({ findings: [], ai_summary: "It has set aside 2.4 million." }), request).score,
    ];
    expect(new Set(scores).size).toBe(1);
  });
});

describe("evaluateDraft with a reply that has no usable summary", () => {
  const config: EngineConfig = {
    provider: "Anthropic",
    model: "test-model",
    effort: "high",
    maxOutputTokens: 16000,
    speed: "standard",
    trainingTerm: "Not used to train models",
    processingMode: "Zero-retention API",
  };

  it.each([
    ["missing", undefined, "ai_summary_missing"],
    ["malformed", ["not", "text"], "ai_summary_malformed"],
  ])("succeeds on the first call when the summary is %s, and logs why it went", async (_label, value, code) => {
    let calls = 0;
    const reply = { ...sampleAnalysis(), ai_summary: value };
    const client = {
      messages: {
        create: async () => {
          calls += 1;
          return {
            id: "msg", type: "message", role: "assistant", model: "test-model-served",
            content: [{ type: "text", text: JSON.stringify(reply), citations: null }],
            stop_reason: "end_turn", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: null, cache_creation_input_tokens: null },
          };
        },
      },
    } as unknown as Anthropic;
    const logs: string[] = [];
    const result = await evaluateDraft(DEMO_1.request, { config, client, log: (l) => logs.push(l) });
    expect(calls).toBe(1);
    expect(result.analysis.ai_summary).toBeUndefined();
    expect(logs.some((l) => l.includes(`repaired: ${code}`))).toBe(true);
  });
});
