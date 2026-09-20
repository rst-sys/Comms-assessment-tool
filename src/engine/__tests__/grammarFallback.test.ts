import { describe, expect, it, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { callModel, isGrammarTooLarge } from "../client.js";
import { getEngineConfig } from "../config.js";

function grammarError() {
  return new Anthropic.APIError(
    400,
    { type: "error", error: { type: "invalid_request_error", message: "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools." } },
    "400",
    undefined,
  );
}

function reply(): unknown {
  return {
    stop_reason: "end_turn",
    model: "claude-opus-5",
    content: [{ type: "text", text: '{"ok":true}' }],
    usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  };
}

const config = getEngineConfig({ ACR_API_KEY: "k" } as NodeJS.ProcessEnv);
const args = { system: [{ text: "S" }], user: "U", config };

describe("the grammar-too-large fallback", () => {
  it("recognizes only that rejection", () => {
    expect(isGrammarTooLarge(grammarError())).toBe(true);
    expect(isGrammarTooLarge(new Anthropic.APIError(400, { type: "error", error: { type: "invalid_request_error", message: "credit balance is too low" } }, "400", undefined))).toBe(false);
    expect(isGrammarTooLarge(new Error("socket hang up"))).toBe(false);
  });

  it("retries without the format and succeeds, rather than failing the review", async () => {
    const create = vi.fn()
      .mockRejectedValueOnce(grammarError())
      .mockResolvedValueOnce(reply());
    const log = vi.fn();
    const result = await callModel({ ...args, client: { messages: { create } } as unknown as Anthropic, log });

    expect(result.text).toBe('{"ok":true}');
    expect(create).toHaveBeenCalledTimes(2);
    // First attempt carries the schema; the retry carries effort but no format.
    expect(create.mock.calls[0]![0].output_config.format).toBeTruthy();
    expect(create.mock.calls[1]![0].output_config.format).toBeUndefined();
    expect(create.mock.calls[1]![0].output_config.effort).toBe(config.effort);
    expect(log.mock.calls[0]![0]).toMatch(/grammar too large; retrying/);
  });

  it("does not retry any other rejection", async () => {
    const other = new Anthropic.APIError(400, { type: "error", error: { type: "invalid_request_error", message: "credit balance is too low" } }, "400", undefined);
    const create = vi.fn().mockRejectedValue(other);
    await expect(callModel({ ...args, client: { messages: { create } } as unknown as Anthropic })).rejects.toThrow(/credit balance/);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("surfaces the real error when the retry also fails", async () => {
    const create = vi.fn()
      .mockRejectedValueOnce(grammarError())
      .mockRejectedValueOnce(new Anthropic.APIError(400, { type: "error", error: { type: "invalid_request_error", message: "something else entirely" } }, "400", undefined));
    await expect(callModel({ ...args, client: { messages: { create } } as unknown as Anthropic })).rejects.toThrow(/something else entirely/);
  });

  it("sends no enum lists to the provider, which is what caused this", async () => {
    const create = vi.fn().mockResolvedValue(reply());
    await callModel({ ...args, client: { messages: { create } } as unknown as Anthropic });
    const sent = JSON.stringify(create.mock.calls[0]![0].output_config.format.schema);
    expect(sent).not.toContain('"enum"');
    expect(sent).toContain('"properties"');
  });
});
