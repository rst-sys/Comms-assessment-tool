import { describe, expect, it } from "vitest";
import { loadEnvFile, parseEnv } from "../env.js";

describe("parseEnv", () => {
  it("reads only ACR_ and ANTHROPIC_ keys, ignoring comments, blanks and quotes", () => {
    const parsed = parseEnv(`# comment\n\nACR_API_KEY="abc"\nACR_MODEL=claude-opus-5\nPATH=/evil\nnot a line\nANTHROPIC_API_KEY='xyz'\n`);
    expect(parsed).toEqual({ ACR_API_KEY: "abc", ACR_MODEL: "claude-opus-5", ANTHROPIC_API_KEY: "xyz" });
  });
});

describe("loadEnvFile", () => {
  it("returns nothing for a missing file and never overrides a set variable", () => {
    expect(loadEnvFile("/nonexistent/.env")).toEqual([]);
    const env: NodeJS.ProcessEnv = { ACR_MODEL: "already" };
    // A file that exists: package.json has no KEY=VALUE lines, so nothing loads.
    expect(loadEnvFile("package.json", env)).toEqual([]);
    expect(env.ACR_MODEL).toBe("already");
  });
});
