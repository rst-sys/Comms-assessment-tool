# Accountable Communications Review

Does this message give an account?

A prototype that evaluates whether a draft communication gives a credible account of a decision: what was decided, who had authority, what external context mattered, what internal choices increased exposure, who is affected, what will change, who owns the change, how stakeholders can verify it, and what the organization is learning. The build specification is `PROMPT.md`; read it before working here.

## Status

Built in the order PROMPT.md Section 1 requires.

| Step | Status |
| --- | --- |
| 1. Evaluation engine (Sections 5–8), tested against the Section 12 fixtures | Done. Live run captured in `fixture-reports/`; 48 of 48 checks pass after hand review (see `DEVIATIONS.md`, item 16). |
| 2. Results page (Section 9) | Done. `src/app/results/`, rendered from a captured sample until step 3 supplies live results. |
| 3. Intake screen (Section 3) with the privacy panel (Section 4) | Not started. |
| 4. Minimal-Risk redraft mode | Not started. |
| 5. Design polish (Section 11) | Not started. |

Run the app with `npm run dev` and open the printed URL. Until step 3 lands, the header offers the captured sample analyses.

## Provider and model

| Setting | Value | Where |
| --- | --- | --- |
| Provider | Anthropic, via the official `@anthropic-ai/sdk` | `src/engine/client.ts` |
| Model | `claude-opus-5` by default | `ACR_MODEL` environment variable, read in `src/engine/config.ts` |
| Effort | `high` by default | `ACR_EFFORT` |
| Credential | `ACR_API_KEY`, falling back to `ANTHROPIC_API_KEY` | environment only; never stored by the app |

To change the model, set `ACR_MODEL` to another model id. The UI reads provider and model from `getEngineConfig()`; nothing is hardcoded there. There is one configured endpoint, no fallback provider and no retry to a different model. The provider's retention and training terms shown in the privacy panel come from `ACR_PROCESSING_MODE` and `ACR_TRAINING_TERM`; set them to the actual terms of the endpoint your organization uses.

## Layout

```
src/app/
  main.tsx, App.tsx   entry point and the step 2 shell (sample picker)
  results/            the results page: summary, top findings, register, scorecard,
                      agency scan, devil's advocate, questions, footer
  copy.ts             the core principle and the decision-support disclaimer
  styles.css          design tokens from Section 11 and structural styles
src/engine/
  types.ts        intake enumerations and the analysis shape (Sections 3, 6)
  promptText.ts   the verbatim system prompt and layoff block, generated from PROMPT.md
  prompt.ts       system blocks and the labeled user message
  schema.ts       JSON schema for the analysis, used for structured output and validation
  validate.ts     ajv validation plus the code-enforced constraints (Section 6)
  scoring.ts      weights, score, bands, color scale, confidence label (Section 7)
  config.ts       provider, model and effort from the environment
  client.ts       the single provider call; errors carry a kind and a hashed request id
  evaluate.ts     build → call → parse → validate → score
  fixtures.ts     the three demos, the control draft and their expectations (Section 12)
scripts/
  run-fixtures.ts live fixture and calibration runner
```

## Commands

```
npm install
npm run dev            # the web app, on a local port
npm run build          # production build to dist/
npm run typecheck      # tsc --noEmit
npm test               # vitest: engine, results-page helpers, and rendered page (no network)
npm run fixtures       # live run of all demos and calibration tests (7 provider calls)
npm run fixtures -- demo1 control   # a subset
```

The live runner needs `ACR_API_KEY` (or `ANTHROPIC_API_KEY`). Hosted Claude Code environments reserve `ANTHROPIC_API_KEY` for session auth and refuse to set it, so set `ACR_API_KEY` there. It writes each raw result to `fixture-runs/` (gitignored) and exits non-zero when an expected finding is missing.

## Regenerating the prompt text

`src/engine/promptText.ts` is generated from the fenced blocks under Sections 5 and 10 of `PROMPT.md`. After editing those sections, regenerate with:

```
node scripts/extract-prompt.mjs
```

## Deviations from PROMPT.md

See `DEVIATIONS.md`.
