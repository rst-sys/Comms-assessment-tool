# The protocol library

One file per protocol. The engine reads the settings block between the `---`
lines; the prose below it is what the Standards Library page shows.

## Adding one

1. Write it with `PROTOCOL-PROMPT.md`, in a separate Claude conversation.
2. Save the reply here as `<event-name>.md`.
3. Upload it to GitHub and say so.

The file is checked before it goes anywhere near a review: a dimension that
does not exist, a misspelled review type, too many triggers, two protocols
claiming the same event, or a missing Source section all fail by name.

## The layers

- **core** — `EVENT-CORE.md`. Fires on any of the thirteen events. There is
  exactly one.
- **event** — one per event, carrying only what that event adds. Selected by
  the event dropdown at intake.
- **posture** — a stance that sits on top of any event, such as an apology.
  Selected by the goal.

## Running the checker

```
npm run protocols          # check the folder and rebuild the engine's copy
npm run protocols -- --check   # check only, change nothing
```

Nothing here takes effect until `npm run protocols` has been run and the
result committed. A test fails if the folder and the engine's copy disagree,
so a forgotten rebuild is caught before a tester sees it.
