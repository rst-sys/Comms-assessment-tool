# Fixture run captured for hand review

| Item | Value |
| --- | --- |
| Run timestamp (UTC) | 2026-09-19T20:07:28Z (start; stamp `2026-09-19T20-07-28-105Z`) |
| Provider | Anthropic |
| Model | claude-opus-5 |
| Effort | high |
| Command | `npm run fixtures 2>&1 \| tee fixture-run.log` (one run, seven provider calls, no retries logged) |
| Runner result | 2 check(s) failed of 48 |
| Engine commit | 74fb1d2 |

## Contents

- `fixture-run.log` — full console output of the run.
- `demo1-*.json`, `demo2-*.json`, `demo3-*.json`, `control-*.json`, `demo1-context-*.json`, `demo2-run2-*.json`, `demo2-run3-*.json` — the raw `EvaluationResult` written by the runner for each call.

## Summary per fixture

| Fixture | Score | Band | Risk | Readiness |
| --- | --- | --- | --- | --- |
| demo1 | 13 | Serious clarity, accountability, or ethical-risk concerns | Critical | Do not issue until material gaps are resolved |
| demo2 | 13 | Serious clarity, accountability, or ethical-risk concerns | Critical | Do not issue until material gaps are resolved |
| demo3 | 16 | Serious clarity, accountability, or ethical-risk concerns | Critical | Do not issue until material gaps are resolved |
| control | 83 | Credible, with targeted improvements | Low | Revise before issuing |
| demo1-context | 19 | Serious clarity, accountability, or ethical-risk concerns | Critical | Do not issue until material gaps are resolved |
| demo2-run2 | 14 | (determinism run) | — | — |
| demo2-run3 | 14 | (determinism run) | — | — |

## Every PASS/FAIL line from the log

| Section | Result | Check | Detail |
| --- | --- | --- | --- |
| Demo 1 expectations | PASS | score ≤ 39 | score 13 |
| Demo 1 expectations | PASS | readiness in [Do not issue until material gaps are resolved] | Do not issue until material gaps are resolved |
| Demo 1 expectations | PASS | High finding: growth as a nonhuman cause | F-004 (causation_explanation) |
| Demo 1 expectations | PASS | High finding: employee feedback near an adverse decision | F-001 (accountability_agency) |
| Demo 1 expectations | PASS | High finding: no leadership ownership | F-001 (accountability_agency) |
| Demo 1 expectations | PASS | High finding: no decision rights | F-001 (accountability_agency) |
| Demo 1 expectations | PASS | High finding: no selection criteria or support | F-002 (stakeholder_respect_impact) |
| Demo 1 expectations | PASS | High finding: no redeployment | F-003 (stakeholder_respect_impact) |
| Demo 1 expectations | PASS | High finding: no correction beyond headcount | F-001 (accountability_agency) |
| Demo 1 expectations | PASS | High finding: no learning plan | F-002 (stakeholder_respect_impact) |
| Demo 1 expectations | PASS | High finding: no verification | F-005 (truthfulness_factual_discipline) |
| Demo 1 expectations | PASS | scan flag /rapid growth brought complexity/i as Institutional abstraction High | "Rapid growth brought complexity" |
| Demo 1 expectations | PASS | scan flag /leaner and more agile/i as Vague action | "to become leaner and more agile" |
| Demo 1 expectations | PASS | specialist review includes HR | HR, Labor |
| Demo 1 expectations | PASS | specialist review includes Labor | HR, Labor |
| Demo 1 expectations | PASS | persona /affected employee/i | Affected employee; Remaining employee; Front-line manager; Labor representative; Journalist |
| Demo 1 expectations | PASS | persona /remaining employee/i | Affected employee; Remaining employee; Front-line manager; Labor representative; Journalist |
| Demo 2 expectations | PASS | score ≤ 44 | score 13 |
| Demo 2 expectations | PASS | High finding: audience displacement | F-001 (accountability_agency) |
| Demo 2 expectations | PASS | High finding: content treated as autonomous, no approval chain | F-001 (accountability_agency) |
| Demo 2 expectations | PASS | High finding: no harm acknowledgment | F-002 (stakeholder_respect_impact) |
| Demo 2 expectations | PASS | High finding: values without action | F-001 (accountability_agency) |
| Demo 2 expectations | PASS | High finding: no corrective action | F-001 (accountability_agency) |
| Demo 2 expectations | PASS | High finding: no timeline | F-004 (truthfulness_factual_discipline) |
| Demo 2 expectations | FAIL | High finding: no verification | no High finding matched /verif\|measur\|metric\|update\|follow[- ]through/i |
| Demo 2 expectations | PASS | scan flag /some customers were offended/i as Audience displacement | "Some customers were offended" |
| Demo 2 expectations | PASS | scan flag /committed to learning/i as Values without action | "We are committed to learning from this" |
| Demo 2 expectations | PASS | most damaging interpretation names /audience\|customer\|offen\|reaction\|blame\|responsib\|fault\|sensitiv/i |  |
| Demo 3 expectations | PASS | score ≤ 49 | score 16 |
| Demo 3 expectations | PASS | High finding: external conditions as the complete explanation | F-001 (accountability_agency) |
| Demo 3 expectations | PASS | High finding: no management assumptions or exposure | F-001 (accountability_agency) |
| Demo 3 expectations | PASS | High finding: unsupported reassurance | F-003 (causation_explanation) |
| Demo 3 expectations | PASS | High finding: no strategy correction | F-002 (stakeholder_respect_impact) |
| Demo 3 expectations | PASS | High finding: no measurable response | F-003 (causation_explanation) |
| Demo 3 expectations | FAIL | scan flag /macroeconomic headwinds and sector-wide conditions/i as External weather (Incomplete explanation) | not flagged |
| Demo 3 expectations | PASS | scan flag /remain confident/i as Values without action | "We remain confident in our strategy" |
| Demo 3 expectations | PASS | specialist review includes Investor relations | Investor relations, Legal, Executive |
| Demo 3 expectations | PASS | specialist review includes Legal | Investor relations, Legal, Executive |
| Calibration 2 — false-positive ceiling (control draft) | PASS | score ≥ 80 | score 83 |
| Calibration 2 — false-positive ceiling (control draft) | PASS | readiness in [Ready with minor edits \| Revise before issuing] | Revise before issuing |
| Calibration 2 — false-positive ceiling (control draft) | PASS | ≤ 1 scan flag(s) | 0 flag(s): none |
| Calibration 2 — false-positive ceiling (control draft) | PASS | scan severity ≤ Low |  |
| Calibration 1 — context sensitivity | PASS | bare run shows the draft-language-only confidence label | Scored on draft language only — add known facts and decision details for a substantiated score |
| Calibration 1 — context sensitivity | PASS | context run shows the supplied-context confidence label | Scored against supplied context |
| Calibration 1 — context sensitivity | PASS | accountability_agency scores higher with context | 0.5 → 1 |
| Calibration 1 — context sensitivity | PASS | corrective_action_proof scores higher with context | 0.5 → 1 |
| Calibration 3 — determinism (Demo 2 × 3) | PASS | score varies by ≤ 5 points | scores 13, 14, 14 (spread 1) |
| Calibration 3 — determinism (Demo 2 × 3) | PASS | top three findings share at least two dimensions across every pair of runs | accountability_agency+causation_explanation+stakeholder_respect_impact \| accountability_agency+causation_explanation+stakeholder_respect_impact \| accountability_agency+causation_explanation+stakeholder_respect_impact |

## FAIL lines

- Demo 2 expectations: High finding: no verification — no High finding matched `/verif|measur|metric|update|follow[- ]through/i`
- Demo 3 expectations: scan flag `/macroeconomic headwinds and sector-wide conditions/i` as External weather (Incomplete explanation) — not flagged

Captured as-is for hand review. No prompt, engine, or runner changes were made in this capture.
