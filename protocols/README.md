# The protocol library

One file per protocol. The engine reads the settings block between the `---`
lines; the prose below it is what the Standards Library page shows.

## Adding one

1. Find the sources with `RESEARCH-PROMPT.md`, in its own Claude conversation,
   with web search on.
2. Write the protocol with `PROTOCOL-PROMPT.md`, in a second conversation,
   pasting in what step 1 returned.
3. Save the reply here as `<event-name>.md`.
4. Upload it to GitHub and say so.

The file is checked before it goes anywhere near a review: a dimension that
does not exist, a misspelled review type, too many triggers, two protocols
claiming the same event, or a missing Source section all fail by name.

## The layers

- **event** — carries only what the event adds to the framework. It names the
  events it covers in `events:`, a list, and may cover several where they carry
  the same duty. Selected by "What's happening?" at intake.
- **posture** — a stance that sits on top of any event, such as an apology. It
  names the intake purposes that bring it in, in `purposes:`. Selected by "What
  is this draft mainly trying to do?".

There is no third layer. A "core" protocol existed briefly and was removed:
six of its eight checks were already in the framework, two of them word for
word. What was genuinely new moved into the framework instead.

## Running the checker

```
npm run protocols          # check the folder and rebuild the engine's copy
npm run protocols -- --check   # check only, change nothing
```

Nothing here takes effect until `npm run protocols` has been run and the
result committed. A test fails if the folder and the engine's copy disagree,
so a forgotten rebuild is caught before a tester sees it.
