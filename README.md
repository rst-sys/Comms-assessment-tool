# Accountable Communications Review

Does this message give an account?

A prototype that evaluates whether a draft communication gives a credible account of a decision: what was decided, who had authority, what external context mattered, what internal choices increased exposure, who is affected, what will change, who owns the change, how stakeholders can verify it, and what the organization is learning. The build specification is `PROMPT.md`; read it before working here.

## Status

Built in the order PROMPT.md Section 1 requires.

| Step | Status |
| --- | --- |
| 1. Evaluation engine (Sections 5–8), tested against the Section 12 fixtures | Done. Live run captured in `fixture-reports/`; 48 of 48 checks pass after hand review (see `DEVIATIONS.md`, item 16). |
| 2. Results page (Section 9) | Done. `src/app/results/`, rendered from a captured sample until step 3 supplies live results. |
| 3. Intake screen (Section 3) with the privacy panel (Section 4) | Done. `src/app/intake/`, `src/app/PrivacyPanel.tsx`, and the server in `src/server/` (evaluate, URL import, config). Verified end to end in a browser against the live provider. |
| 4. Minimal-Risk redraft mode | Removed after the owner's testing: the tool never proposes wording (see the revisions note in `PROMPT.md`). |
| 5. Design polish (Section 11) | Done. Tokens, type scale, spacing, print stylesheet and responsive layout in `src/app/styles.css`; contrast checked (see `DEVIATIONS.md`, item 25). |

New to this? `SETUP.md` explains, without any coding, how to run the app by double-clicking a start file.

Run the server and the app:

```
npm run server     # API on http://localhost:8787 (needs ACR_API_KEY)
npm run dev        # the app, with /api proxied to the server
```

Or build once and serve both from the server: `npm run build && npm start`.

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
  main.tsx, App.tsx   entry point; intake → evaluating → results, plus the stub pages
  intake/             the intake screen and its rules (word range, heightened review,
                      high-risk warning, demo loader, URL import)
  results/            the results page: summary, top findings, register, scorecard,
                      agency scan, devil's advocate, questions, footer
  PrivacyPanel.tsx    the Section 4 panel, provider and model read from the server
  ConfidentialityNotice.tsx, stubs.ts, api.ts, copy.ts, styles.css
src/server/
  server.ts           POST /api/evaluate, /api/import; GET /api/config; serves dist/ in production
  import.ts           stateless fetch-and-extract for URL import (Readability)
  requestSchema.ts    validation of the intake request
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
npm run dev            # the web app, on a local port (proxies /api to the server)
npm run server         # the API server, reloading on change
npm run build          # production build to dist/
npm start              # the API server also serving dist/
npm run typecheck      # tsc --noEmit
npm test               # vitest: engine, results-page helpers, and rendered page (no network)
npm run fixtures       # live run of all demos and calibration tests (7 provider calls)
npm run fixtures -- demo1 control   # a subset
```

The live runner needs `ACR_API_KEY` (or `ANTHROPIC_API_KEY`). Hosted Claude Code environments reserve `ANTHROPIC_API_KEY` for session auth and refuse to set it, so set `ACR_API_KEY` there. It writes each raw result to `fixture-runs/` (gitignored) and exits non-zero when an expected finding is missing.

## Definition of done (PROMPT.md Section 13)

| Item | Status |
| --- | --- |
| All three demos produce every expected finding in Section 12 | Met. Captured live run in `fixture-reports/`; 48 of 48 checks after the hand review recorded in `DEVIATIONS.md` item 16. |
| All three calibration tests pass, including the control draft | Met. Control scored 83 with zero scan flags; context sensitivity and determinism passed on the same run. |
| Every rendered score is one click from its rationale and cited excerpt | Met. The score opens the scorecard; each dimension row expands to its rationale and "what would raise this"; findings cite excerpts or omissions. |
| Schema validation rejects malformed output and the UI never renders a partial analysis | Met. ajv plus code-enforced constraints; failures return the Section 6 message and nothing renders. |
| Excerpts that do not appear verbatim in the draft are dropped in code | Met. Dropped and counted; the same rule applies to agency-scan phrases. |
| Readiness cannot show "Ready with minor edits" while any specialist review flag is set | Met. Enforced in code after excerpt drops. |
| Draft text appears nowhere in storage, URLs, page titles, or console output | Met. No storage or history APIs (tested by source scan); page title fixed; logs carry kinds, hashed ids, domains and status codes only. |
| The privacy panel shows the real provider and model from config and the planned-controls line | Met. Read from `GET /api/config`. |
| The confidentiality notice appears on first load | Met. Once per page load, dismissable. |
| Stubbed areas show a nav entry and a one-paragraph page, nothing more | Met. |
| Keyboard-only navigation reaches every control; contrast passes AA | Met. Verified by keyboard in a browser; contrast measured, see `DEVIATIONS.md` item 25. |
| Every results page and print view ends with the core principle and the decision-support disclaimer | Met. |
| URL import extracts readable text from a public press release, shows a plain error on a paywalled page, sets the retrospective framing, and the proxy logs only domain and status | Met in tests with sample pages (article, paywall, PDF) and in the browser with a stubbed response; a live fetch of a public site could not be exercised from the build sandbox, whose outbound proxy blocks external sites. |

## Preview on claude.ai

`npm run build:artifact` builds the same app for a private claude.ai page (`dist-artifact/`) that asks Claude through the viewer's own account instead of the server. See `DEVIATIONS.md` item 28.

## Regenerating the prompt text

`src/engine/promptText.ts` is generated from the fenced blocks under Sections 5 and 10 of `PROMPT.md`. After editing those sections, regenerate with:

```
node scripts/extract-prompt.mjs
```

## Deviations from PROMPT.md

See `DEVIATIONS.md`.
