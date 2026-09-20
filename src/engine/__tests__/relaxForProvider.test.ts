import { describe, expect, it } from "vitest";
import { Ajv } from "ajv";
import { ANALYSIS_SCHEMA, relaxForProvider } from "../schema.js";
import { COMPARE_SCHEMA } from "../compare.js";
import { sampleAnalysis } from "./helpers.js";

function countKeys(node: unknown, key: string): number {
  if (Array.isArray(node)) return node.reduce<number>((n, x) => n + countKeys(x, key), 0);
  if (!node || typeof node !== "object") return 0;
  return Object.entries(node as Record<string, unknown>).reduce(
    (n, [k, v]) => n + (k === key ? 1 : 0) + countKeys(v, key),
    0,
  );
}

/**
 * The provider compiles the schema it is sent into a grammar with a size
 * ceiling; exceeding it rejects the call with "the compiled grammar is too
 * large". Enumerated values are the expensive part, so they are stripped from
 * the provider's copy only.
 */
describe("relaxForProvider", () => {
  const relaxed = relaxForProvider(ANALYSIS_SCHEMA);

  it("removes every enum and const at any depth", () => {
    expect(countKeys(ANALYSIS_SCHEMA, "enum")).toBeGreaterThan(10);
    expect(countKeys(relaxed, "enum")).toBe(0);
    expect(countKeys(relaxed, "const")).toBe(0);
  });

  it("keeps the structure that actually forces the shape", () => {
    for (const key of ["properties", "required", "additionalProperties", "items", "anyOf", "type"]) {
      expect(countKeys(relaxed, key), key).toBe(countKeys(ANALYSIS_SCHEMA, key));
    }
  });

  it("leaves a nullable union nullable, just without the value list", () => {
    const claim = (relaxed as Record<string, any>).properties.findings.items.properties.claim_status;
    expect(claim).toEqual({ anyOf: [{ type: "string" }, { type: "null" }] });
  });

  it("is materially smaller, which is the whole point", () => {
    const before = JSON.stringify(ANALYSIS_SCHEMA).length;
    const after = JSON.stringify(relaxed).length;
    expect(after).toBeLessThan(before * 0.75);
  });

  it("does not mutate the strict schema it derives from", () => {
    const snapshot = JSON.stringify(ANALYSIS_SCHEMA);
    relaxForProvider(ANALYSIS_SCHEMA);
    expect(JSON.stringify(ANALYSIS_SCHEMA)).toBe(snapshot);
  });

  it("relaxes the comparison schema too", () => {
    expect(countKeys(COMPARE_SCHEMA, "enum")).toBeGreaterThan(0);
    expect(countKeys(relaxForProvider(COMPARE_SCHEMA), "enum")).toBe(0);
  });

  it("still accepts a real analysis, so the shape was not broken", () => {
    const validate = new Ajv({ allErrors: false, strict: false }).compile(relaxed as object);
    expect(validate(sampleAnalysis())).toBe(true);
  });

  it("is the loose one: the strict schema still catches a bad value", () => {
    const ajv = new Ajv({ allErrors: false, strict: false });
    const strict = ajv.compile(ANALYSIS_SCHEMA as object);
    const loose = ajv.compile(relaxed as object);
    const bad = sampleAnalysis();
    (bad.executive_summary as { risk_level: string }).risk_level = "Severe";
    expect(loose(bad)).toBe(true);   // the provider would allow it through
    expect(strict(bad)).toBe(false); // and validate.ts rejects it before anyone sees it
  });
});
