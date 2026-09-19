/**
 * Development samples: the captured fixture run in fixture-reports/, paired
 * with the request each was made from. Used only until the intake screen
 * (step 3) produces live results.
 */
import type { EvaluationResult } from "../engine/evaluate.js";
import { CONTROL, DEMO_1, DEMO_1_WITH_CONTEXT, DEMO_2, DEMO_3, type Fixture } from "../engine/fixtures.js";

export interface Sample {
  key: string;
  name: string;
  request: Fixture["request"];
  result: EvaluationResult;
}

const modules = import.meta.glob<EvaluationResult>("../../fixture-reports/*.json", { eager: true, import: "default" });

const fixtureFor = (file: string): Fixture | null => {
  const base = file.split("/").pop() ?? "";
  if (base.startsWith("demo1-context")) return DEMO_1_WITH_CONTEXT;
  if (base.startsWith("demo1")) return DEMO_1;
  if (base.startsWith("demo2")) return DEMO_2;
  if (base.startsWith("demo3")) return DEMO_3;
  if (base.startsWith("control")) return CONTROL;
  return null;
};

export const SAMPLES: Sample[] = Object.entries(modules)
  .flatMap(([file, result]) => {
    const fixture = fixtureFor(file);
    if (!fixture) return [];
    const base = file.split("/").pop()!.replace(/-\d{4}-.*$/, "");
    return [{ key: base, name: `${fixture.name}${base.includes("run") ? ` (${base.split("-").pop()})` : ""}`, request: fixture.request, result }];
  })
  .sort((a, b) => a.key.localeCompare(b.key));
