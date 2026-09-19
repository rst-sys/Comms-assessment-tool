# Deviations from PROMPT.md

Every place the build departs from the prompt, and why. Kept current as steps land.

## Step 1 — evaluation engine

1. **No sampling temperature.** Section 5 asks for temperature 0.2 or lower. The configured model (`claude-opus-5`) rejects non-default `temperature`, `top_p` and `top_k` with a 400. The request omits them and uses `output_config.effort` (default `high`) instead. Section 12's determinism test still applies and is run by the fixture runner.

2. **Structured output plus ajv.** Section 5 says "request JSON output"; Section 6 says validate with a JSON Schema library. The engine sends the Section 6 schema as the provider's structured-output format, then validates the returned object with ajv anyway and applies the code-enforced constraints. The provider's schema subset cannot express counts, 0.5 steps or verbatim excerpts, so those are enforced in `validate.ts`.

3. **Output-structure notes appended to the system prompt.** The Section 5 prompt is sent verbatim as the first system block. A short third block (`OUTPUT_NOTES` in `prompt.ts`) states the structural conventions the schema cannot carry: ten dimensions in Section 7 order, five personas, five to twelve questions, three strongest elements and three priority improvements, `F-001` ids, verbatim excerpts, and the exact disclaimer string. The layoff block from Section 10 is inserted between them for Layoff or restructuring.

4. **Agency-scan phrases are checked for verbatim presence, like excerpts.** Section 6 requires dropping findings whose excerpt is not verbatim in the draft. The engine applies the same rule to `agency_scan.phrase`, since Section 8 highlights each phrase in the draft and a phrase that is not there cannot be highlighted. Drops are counted separately in `adjustments.dropped_scan_phrases`. Whitespace runs and quote styles are matched loosely, and the stored excerpt is always the draft's own text.

5. **Readiness override target.** When a finding needs specialist review and the model returned "Ready with minor edits", the engine sets readiness to "Escalate for senior or specialist review" and records `adjustments.readiness_overridden`. The prompt says only that the value must never be "Ready with minor edits" in that case; the escalation value was chosen because it names the reason.

6. **`context_supplied` is set in code.** The schema has the model return this flag, but the application knows whether any context field was sent. The engine overwrites the flag with the truth so the Section 7 confidence label can never be wrong, and records `adjustments.context_flag_corrected` when the model disagreed.

7. **Specialist review summary is the union.** The model's `specialist_review_summary` is merged with every type named by a kept finding, so the chips on the results page never miss a flagged review.

8. **Word-count limits are not enforced by the engine.** Section 3's 50–5,000 word range is an intake rule. The Section 12 demo drafts are under 50 words, so the engine accepts any non-empty draft and the intake screen will enforce the range.

9. **Provider-side prompt caching of the system prompt.** The system blocks carry an ephemeral cache marker so the verbatim prompt is not re-billed on every call. Only the system prompt sits before the cache breakpoint; the draft is in the user message and is never cached.

10. **No server-side refusal fallback.** The provider offers a server-side fallback that re-runs a declined request on another model. Section 4 forbids a fallback provider or a silent retry to a different model, so it is not enabled. A refusal surfaces as an `EngineError` of kind `refusal`.

11. **Credential variable name.** The SDK's default is `ANTHROPIC_API_KEY`, but hosted Claude Code environments reserve that name for the session's own account auth and refuse to set it. The engine reads `ACR_API_KEY` first and `ANTHROPIC_API_KEY` second (`resolveApiKey` in `config.ts`) and passes the value to the SDK explicitly. There is still one credential and one endpoint; this only changes where the value is read from.
