/**
 * Runs the Section 12 demo fixtures and calibration tests against the live
 * engine and reports which expected findings appeared.
 *
 *   npm run fixtures                 # everything (7 provider calls)
 *   npm run fixtures -- demo1 demo3  # a subset: demo1 demo2 demo3 control calibration
 *
 * Raw results are written to fixture-runs/ (gitignored) for inspection.
 * Console output contains scores, labels and counts; it never prints a
 * response body except the fixture's own fictional draft excerpts when a
 * check fails, so the failure is actionable.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  ALL_FIXTURES,
  CONTROL,
  DEMO_1,
  DEMO_1_WITH_CONTEXT,
  DEMO_2,
  DEMO_3,
  evaluateDraft,
  getEngineConfig,
  rankFindings,
  SEVERITY_RANK,
  type EvaluationResult,
  type Finding,
  type Fixture,
} from "../src/engine/index.js";

interface Check {
  name: string;
  pass: boolean;
  detail?: string;
}

const args = new Set(process.argv.slice(2));
const wantAll = args.size === 0;
const want = (k: string) => wantAll || args.has(k);

const outDir = "fixture-runs";
mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");

const results = new Map<string, EvaluationResult>();
const failures: string[] = [];

function findingText(f: Finding): string {
  return [f.finding, f.omission ?? "", f.excerpt ?? "", f.why_it_matters, f.stakeholder_risk, f.recommended_action].join(" ");
}

const RETRYABLE_KINDS = new Set(["validation", "invalid_json", "truncated", "no_text"]);
const retried: string[] = [];

/**
 * One evaluation. A malformed response is rejected by the engine (Section 6);
 * the runner then makes one more call to the same model and says so, so a
 * single malformed response does not abort a seven-call run. Retries are
 * counted and reported at the end; a second failure aborts the run.
 */
async function evaluateOnce(fixture: Fixture, label: string): Promise<EvaluationResult> {
  const log = (l: string) => console.log(`\n  ${l}`);
  try {
    return await evaluateDraft(fixture.request, { log });
  } catch (error) {
    const e = error as { kind?: string; requestId?: string };
    if (!e.kind || !RETRYABLE_KINDS.has(e.kind)) throw error;
    console.log(`\n  [${e.requestId ?? "?"}] ${e.kind}: malformed response rejected; retrying once ... `);
    retried.push(label);
    return await evaluateDraft(fixture.request, { log });
  }
}

async function run(fixture: Fixture, label = fixture.key): Promise<EvaluationResult> {
  process.stdout.write(`\n→ ${fixture.name} [${label}] ... `);
  const started = Date.now();
  const result = await evaluateOnce(fixture, label);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`done in ${seconds}s (${result.usage.input_tokens} in / ${result.usage.output_tokens} out)`);
  writeFileSync(`${outDir}/${label}-${stamp}.json`, JSON.stringify(result, null, 2));
  results.set(label, result);
  return result;
}

function checkFixture(fixture: Fixture, result: EvaluationResult): Check[] {
  const checks: Check[] = [];
  const { expect } = fixture;
  const a = result.analysis;

  if (expect.max_score !== undefined) {
    checks.push({ name: `score ≤ ${expect.max_score}`, pass: result.score <= expect.max_score, detail: `score ${result.score}` });
  }
  if (expect.min_score !== undefined) {
    checks.push({ name: `score ≥ ${expect.min_score}`, pass: result.score >= expect.min_score, detail: `score ${result.score}` });
  }
  if (expect.readiness) {
    checks.push({
      name: `readiness in [${expect.readiness.join(" | ")}]`,
      pass: expect.readiness.includes(a.executive_summary.readiness),
      detail: a.executive_summary.readiness,
    });
  }
  for (const exp of expect.high_findings ?? []) {
    const floor = exp.min_severity ?? "High";
    const pool = a.findings.filter((f) => SEVERITY_RANK[f.severity] <= SEVERITY_RANK[floor]);
    const hit = pool.find((f) => exp.pattern.test(findingText(f)));
    const label = floor === "High" ? "High finding" : `${floor}-or-higher finding`;
    checks.push({ name: `${label}: ${exp.label}`, pass: Boolean(hit), detail: hit ? `${hit.id} ${hit.severity} (${hit.dimension})` : `no ${label} matched ${exp.pattern}` });
  }
  for (const exp of expect.scan_flags ?? []) {
    // Several entries can contain the expected text (a whole sentence and the
    // clause inside it); prefer the one whose category, severity and
    // assessment match, and fall back to the first so the mismatch is shown.
    const matches = a.agency_scan.filter((s) => exp.phrase.test(s.phrase));
    const hit =
      matches.find(
        (s) =>
          (!exp.category || s.category === exp.category) &&
          (!exp.severity || s.severity === exp.severity) &&
          (!exp.assessment || s.assessment === exp.assessment),
      ) ?? matches[0];
    let pass = Boolean(hit);
    const problems: string[] = [];
    if (hit) {
      if (exp.category && hit.category !== exp.category) { pass = false; problems.push(`category ${hit.category}`); }
      if (exp.severity && hit.severity !== exp.severity) { pass = false; problems.push(`severity ${hit.severity}`); }
      if (exp.assessment && hit.assessment !== exp.assessment) { pass = false; problems.push(`assessment ${hit.assessment}`); }
    }
    checks.push({
      name: `scan flag ${exp.phrase}${exp.category ? ` as ${exp.category}` : ""}${exp.severity ? ` ${exp.severity}` : ""}${exp.assessment ? ` (${exp.assessment})` : ""}`,
      pass,
      detail: hit ? (problems.length ? problems.join(", ") : `"${hit.phrase}"`) : "not flagged",
    });
  }
  if (expect.max_scan_flags !== undefined) {
    checks.push({ name: `≤ ${expect.max_scan_flags} scan flag(s)`, pass: a.agency_scan.length <= expect.max_scan_flags, detail: `${a.agency_scan.length} flag(s): ${a.agency_scan.map((s) => `"${s.phrase}" ${s.severity}`).join("; ") || "none"}` });
  }
  if (expect.max_scan_severity) {
    const worst = a.agency_scan.reduce<number>((m, s) => Math.min(m, SEVERITY_RANK[s.severity]), 99);
    checks.push({ name: `scan severity ≤ ${expect.max_scan_severity}`, pass: a.agency_scan.length === 0 || worst >= SEVERITY_RANK[expect.max_scan_severity] });
  }
  for (const type of expect.specialist_review ?? []) {
    checks.push({ name: `specialist review includes ${type}`, pass: a.specialist_review_summary.includes(type), detail: a.specialist_review_summary.join(", ") || "none" });
  }
  for (const persona of expect.personas ?? []) {
    const names = a.devils_advocate.personas.map((p) => p.persona);
    checks.push({ name: `persona ${persona}`, pass: names.some((n) => persona.test(n)), detail: names.join("; ") });
  }
  if (expect.most_damaging) {
    checks.push({ name: `most damaging interpretation names ${expect.most_damaging}`, pass: expect.most_damaging.test(a.devils_advocate.most_damaging_interpretation) });
  }
  return checks;
}

function report(title: string, checks: Check[]): void {
  console.log(`\n${title}`);
  for (const c of checks) {
    console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
    if (!c.pass) failures.push(`${title}: ${c.name}`);
  }
}

function summarize(label: string, r: EvaluationResult): void {
  const a = r.analysis;
  console.log(`  ${label}: score ${r.score} (${r.band}); risk ${a.executive_summary.risk_level}; readiness "${a.executive_summary.readiness}"; ${a.findings.length} findings (${a.findings.filter((f) => f.severity === "High").length} High); ${a.agency_scan.length} scan flags; specialist: ${a.specialist_review_summary.join(", ") || "none"}`);
  const dims = a.dimensions.map((d) => `${d.id.split("_")[0]} ${d.score.toFixed(1)}`).join(", ");
  console.log(`    dimensions: ${dims}`);
  if (r.adjustments.dropped_findings || r.adjustments.dropped_scan_phrases || r.adjustments.readiness_overridden) {
    console.log(`    adjustments: ${JSON.stringify(r.adjustments)}`);
  }
}

async function main(): Promise<void> {
  const config = getEngineConfig();
  console.log(`Communications Trustability Review — fixture run\nprovider ${config.provider}, model ${config.model}, effort ${config.effort}`);

  if (want("demo1") || want("calibration")) {
    const r = await run(DEMO_1);
    summarize("demo1", r);
    if (want("demo1")) report("Demo 1 expectations", checkFixture(DEMO_1, r));
  }

  const demo2Runs: EvaluationResult[] = [];
  if (want("demo2") || want("calibration")) {
    const r = await run(DEMO_2, "demo2");
    summarize("demo2", r);
    demo2Runs.push(r);
    if (want("demo2")) report("Demo 2 expectations", checkFixture(DEMO_2, r));
  }

  if (want("demo3")) {
    const r = await run(DEMO_3);
    summarize("demo3", r);
    report("Demo 3 expectations", checkFixture(DEMO_3, r));
  }

  if (want("control") || want("calibration")) {
    const r = await run(CONTROL);
    summarize("control", r);
    report("Calibration 2 — false-positive ceiling (control draft)", checkFixture(CONTROL, r));
  }

  if (want("calibration")) {
    // Calibration 1 — context sensitivity.
    const bare = results.get("demo1")!;
    const withContext = await run(DEMO_1_WITH_CONTEXT);
    summarize("demo1-context", withContext);
    const dim = (r: EvaluationResult, id: string) => r.analysis.dimensions.find((d) => d.id === id)!.score;
    report("Calibration 1 — context sensitivity", [
      { name: "bare run shows the draft-language-only confidence label", pass: /draft language only/.test(bare.confidence_label), detail: bare.confidence_label },
      { name: "context run shows the supplied-context confidence label", pass: /supplied context/.test(withContext.confidence_label), detail: withContext.confidence_label },
      { name: "accountability_agency scores higher with context", pass: dim(withContext, "accountability_agency") > dim(bare, "accountability_agency"), detail: `${dim(bare, "accountability_agency")} → ${dim(withContext, "accountability_agency")}` },
      { name: "corrective_action_proof scores higher with context", pass: dim(withContext, "corrective_action_proof") > dim(bare, "corrective_action_proof"), detail: `${dim(bare, "corrective_action_proof")} → ${dim(withContext, "corrective_action_proof")}` },
    ]);

    // Calibration 3 — determinism: Demo 2 three times.
    demo2Runs.push(await run(DEMO_2, "demo2-run2"), await run(DEMO_2, "demo2-run3"));
    const scores = demo2Runs.map((r) => r.score);
    const spread = Math.max(...scores) - Math.min(...scores);
    // "Same in substance" proxy: the distinct dimensions covered by each run's
    // top three findings must overlap in at least two dimensions for every pair
    // of runs. The findings themselves are printed below for a check by eye.
    const topDimSets = demo2Runs.map((r) => new Set(rankFindings(r.analysis.findings).slice(0, 3).map((f) => f.dimension)));
    const topDims = topDimSets.map((set) => [...set].sort().join("+"));
    let topSame = true;
    for (let i = 0; i < topDimSets.length; i++) {
      for (let j = i + 1; j < topDimSets.length; j++) {
        const shared = [...topDimSets[i]!].filter((d) => topDimSets[j]!.has(d)).length;
        if (shared < 2) topSame = false;
      }
    }
    report("Calibration 3 — determinism (Demo 2 × 3)", [
      { name: "score varies by ≤ 5 points", pass: spread <= 5, detail: `scores ${scores.join(", ")} (spread ${spread})` },
      { name: "top three findings share at least two dimensions across every pair of runs", pass: topSame, detail: topDims.join(" | ") },
    ]);
    console.log("  Top-three findings per run, for a substance check by eye:");
    demo2Runs.forEach((r, i) => {
      console.log(`    run ${i + 1}:`);
      for (const f of rankFindings(r.analysis.findings).slice(0, 3)) console.log(`      ${f.id} ${f.severity} ${f.dimension}: ${f.finding}`);
    });
  }

  if (retried.length > 0) console.log(`\n${retried.length} call(s) needed one retry after a malformed response: ${retried.join(", ")}`);
  console.log(`\n${failures.length === 0 ? "All checks passed." : `${failures.length} check(s) failed:`}`);
  for (const f of failures) console.log(`  - ${f}`);
  console.log(`Raw results: ${outDir}/*-${stamp}.json`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  const e = error as { name?: string; kind?: string; message?: string; requestId?: string };
  console.error(`\nRun aborted: ${e.name ?? "Error"}${e.kind ? ` (${e.kind})` : ""}: ${e.message ?? String(error)}${e.requestId ? ` [${e.requestId}]` : ""}`);
  process.exitCode = 2;
});

void ALL_FIXTURES;
