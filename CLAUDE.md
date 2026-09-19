# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Always read PROMPT.md first

Before doing any work in this repository, read `PROMPT.md` in full. It is the
build specification for the Accountable Communications Review prototype and is
the source of truth for scope, behavior, schema, scoring, design, and the
definition of done. Do not start planning, coding, or answering questions about
the project until you have read it.

## Follow the build order in Section 1

`PROMPT.md` Section 1 ("Build mandate") defines a strict build order. Build in
this order, and finish each step completely before starting the next:

1. The evaluation engine (Sections 5–8), tested against the three demo fixtures
   in Section 12 until every expected finding appears.
2. The results page (Section 9).
3. The intake screen (Section 3) with the privacy panel (Section 4).
4. The Minimal-Risk redraft mode only.
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
