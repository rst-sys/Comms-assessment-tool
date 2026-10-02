import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildFooterLine, COPYRIGHT } from "../copy.js";
import { BUILD_COMMIT, BUILD_DATE_LABEL, BUILD_YEAR } from "../build.js";

describe("the Welcome screen's footer line", () => {
  it("reads copyright, build and date, joined by middle dots", () => {
    expect(buildFooterLine("abc1234", "28 Sep 2026")).toBe(`${COPYRIGHT} · Build abc1234 · 28 Sep 2026`);
  });

  it("leaves out whatever the build lacks, and never prints a blank or undefined", () => {
    expect(buildFooterLine(null, "28 Sep 2026")).toBe(`${COPYRIGHT} · 28 Sep 2026`);
    expect(buildFooterLine(null, null)).toBe(COPYRIGHT);
    for (const line of [buildFooterLine(null, "28 Sep 2026"), buildFooterLine(null, null), buildFooterLine("", "")]) {
      expect(line).not.toMatch(/undefined|null|Build\s*(·|$)|·\s*·|·\s*$/);
    }
  });

  it("takes its facts from the build, not from anything typed in", () => {
    // The test run goes through the same define the app build does.
    expect(BUILD_YEAR).toBe(new Date().getUTCFullYear());
    expect(BUILD_DATE_LABEL).toMatch(/^\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/);
    expect(BUILD_COMMIT === null || /^[0-9a-f]{7,}$/.test(BUILD_COMMIT)).toBe(true);
    expect(COPYRIGHT).toBe(`© ${BUILD_YEAR} Richard Thompson`);
  });

  it("shares its copyright with the PDF: both read the one constant", () => {
    const pdf = readFileSync("src/app/results/pdf.ts", "utf8");
    expect(pdf).toMatch(/w\.paragraph\(COPYRIGHT/);
    expect(pdf).not.toMatch(/©|&copy;|Richard Thompson/);
  });
});
