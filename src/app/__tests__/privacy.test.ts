import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Section 4: no storage APIs, analytics or telemetry anywhere in the app or engine. */
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "__tests__") walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe("privacy guardrails in code", () => {
  const files = walk("src");
  it("uses no browser storage, cookies or URL parameters for state", () => {
    const banned = /\b(localStorage|sessionStorage|indexedDB|document\.cookie|history\.pushState|history\.replaceState|URLSearchParams)\b/;
    for (const f of files) {
      expect(readFileSync(f, "utf8"), f).not.toMatch(banned);
    }
  });
  it("includes no analytics or error-tracking libraries", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(names.filter((n) => /sentry|segment|analytics|posthog|amplitude|mixpanel|datadog|bugsnag|logrocket|hotjar/i.test(n))).toEqual([]);
  });
  it("never sets the page title from content", () => {
    for (const f of files) {
      expect(readFileSync(f, "utf8"), f).not.toMatch(/document\.title\s*=/);
    }
  });
});
