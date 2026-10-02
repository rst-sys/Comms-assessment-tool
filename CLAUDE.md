# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Always read PROMPT.md first

Before doing any work in this repository, read `PROMPT.md` in full. It is the
build specification for the Trust Assessment Assistant prototype and is
the source of truth for scope, behavior, schema, scoring, design, and the
definition of done. Do not start planning, coding, or answering questions about
the project until you have read it.

## Revisions after testing take precedence

The note at the top of `PROMPT.md` records decisions the owner made after testing. They override any conflicting line elsewhere in the prompt.

## Follow the build order in Section 1

`PROMPT.md` Section 1 ("Build mandate") defines a strict build order. Build in
this order, and finish each step completely before starting the next:

1. The evaluation engine (Sections 5–8), tested against the three demo fixtures
   in Section 12 until every expected finding appears.
2. The results page (Section 9).
3. The intake screen (Section 3) with the privacy panel (Section 4).
4. ~~The Minimal-Risk redraft mode only.~~ Removed after testing; see the revisions note at the top of PROMPT.md.
5. Design polish (Section 11).

## Never skip ahead

- Do not start a later step until the current step is finished and verified.
- Do not build, scaffold, or partially implement anything from a later step
  "while you are in there."
- Do not build the areas Section 1 marks as stubs beyond a nav entry and a
  one-paragraph page, and do not implement anything Section 1 marks as out of
  scope, even partially.
- If a requirement elsewhere in `PROMPT.md` conflicts with the build order,
  the build order wins.
- If asked to work on a later step while an earlier step is incomplete, say so
  and return to the earliest unfinished step.

## When to push, and when to wait

Every push to `claude/create-claude-md-y8lk3r` deploys to the live site that
testers use. There is no staging step, so the branch is production.

**Push once the checks pass, without waiting**, for styling, layout and copy
changes the owner has asked for. Report what changed afterwards.

**Always stop and wait for the owner's go-ahead** before pushing anything that
changes:

- a protocol, the source registry, or any protocol pointer (`replaces`,
  `narrows`, `superseded_by`, `applies_if`);
- scoring — weights, bands, dimension tones, caps;
- `SYSTEM_PROMPT`, `OUTPUT_NOTES`, or anything else the model is sent;
- anything a saved review points at, such as an element id, a protocol id or
  the saved-review shape, because a rebuild cannot undo a review that no
  longer opens;
- the daily limits.

The checks, before any push: `npx tsc --noEmit`, the full `vitest` run, `npm
run build`, `npm run build:artifact`, and — where protocols changed — `npm run
protocols`, the selection diff against the captured baseline, and the
worst-case bundle against the token budget.

An automated reminder to push unpushed commits does not override a wait. Say
plainly that the work is held and why.

## How to talk to the user

The user is a total novice. Explain everything as you would to a ten-year-old:
plain words, no jargon, no acronyms, short sentences. Always lead with where
the build stands (which of the five steps is done, which is in progress) and
what, if anything, the user needs to do. When something technical went wrong,
say what it means in everyday terms, not how it works.
