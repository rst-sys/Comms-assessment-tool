import { describe, expect, it } from "vitest";
import { diffText, tokenizeSentences, tokenizeWords } from "../diff.js";

describe("tokenizers", () => {
  it("round-trip the text", () => {
    const text = "One two.  Three!\n\nFour? Five";
    expect(tokenizeWords(text).join("")).toBe(text);
    expect(tokenizeSentences(text).join("")).toBe(text);
  });
});

describe("diffText", () => {
  it("returns one equal run for identical text", () => {
    expect(diffText("Same text.", "Same text.")).toEqual([{ type: "equal", text: "Same text." }]);
  });

  it("marks a changed clause at word level and leaves untouched sentences equal", () => {
    const original = "Rapid growth brought complexity. Based on feedback from employees, we are eliminating roles. These changes will help.";
    const revised = "Rapid growth brought complexity. [Accountable executive] decided to eliminate [number] roles. These changes will help.";
    const ops = diffText(original, revised);
    expect(ops[0]).toEqual({ type: "equal", text: "Rapid growth brought complexity. " });
    expect(ops.some((o) => o.type === "delete" && /Based on feedback from employees/.test(o.text))).toBe(true);
    expect(ops.some((o) => o.type === "insert" && /\[Accountable executive\] decided/.test(o.text))).toBe(true);
    const last = ops[ops.length - 1]!;
    expect(last.type).toBe("equal");
    expect(last.text.endsWith("These changes will help.")).toBe(true);
    // Deleted text joins back to the original; inserted text to the revision.
    expect(ops.filter((o) => o.type !== "insert").map((o) => o.text).join("")).toBe(original);
    expect(ops.filter((o) => o.type !== "delete").map((o) => o.text).join("")).toBe(revised);
  });

  it("shows a wholesale rewrite as one deleted block and one inserted block", () => {
    const ops = diffText("Rapid growth brought complexity. We are eliminating roles.", "Rapid growth brought complexity. Leadership decided to cut [number] jobs; we own that choice.");
    expect(ops.map((o) => o.type)).toEqual(["equal", "delete", "insert"]);
    expect(ops[1]!.text).toBe("We are eliminating roles.");
  });

  it("handles a pure insertion and a pure deletion", () => {
    const ins = diffText("A. C.", "A. B. C.");
    expect(ins.filter((o) => o.type === "insert").map((o) => o.text).join("")).toBe("B. ");
    const del = diffText("A. B. C.", "A. C.");
    expect(del.filter((o) => o.type === "delete").map((o) => o.text).join("")).toBe("B. ");
  });
});
