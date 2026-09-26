# The protocol library

Four layers, applied in this order whenever a review runs:

| Layer | Where | Applies when | Element cap |
|---|---|---|---|
| **core** | `core-protocol.md` | an event is named | 8 |
| **family** | `families/<id>.md` | the event belongs to that family | 6 |
| **event** | `events/<id>.md` | the event points at it in `events.yaml` | 8 |
| **overlay** | `overlays/<id>.md` | an intake answer switches it on | 5 |

A layer may add an element, or narrow one above it through `narrows`. None may
delete one, and none adds a score: every element maps to one of the ten
dimensions the engine already scores.

## events.yaml is the source of truth for what happened

One entry per event the intake offers, carrying its id, its exact menu label,
its family, its protocol if it has one, and the menu headings it appears under.
The intake menu and the resolver both read it, so the options a user sees and
the protocols the engine applies cannot drift apart. A protocol never names its
own events; the taxonomy points at the protocol.

The comments at the top of that file say how to place a new event.

## Adding a protocol

1. Find the sources with `RESEARCH-PROMPT.md`, in its own Claude conversation,
   with web search on.
2. Write the protocol with `PROTOCOL-PROMPT.md`, in a second conversation,
   pasting in what step 1 returned.
3. Save it in the folder for its layer, and register any new source in
   `sources/registry.yaml`.
4. Run `npm run protocols`. The file is checked before it goes anywhere near a
   review: a dimension that does not exist, a misspelled review type, too many
   elements for its layer, a source id nothing resolves to, an overlay claiming
   a rule another overlay already has, or a missing Source section all fail by
   name.

A protocol is skipped while its `status` is `draft`, so a stub in the folder
changes no review and appears nowhere in the Standards Library.

## Running the checker

```
npm run protocols               # check, rebuild the engine's copy, report the worst-case bundle
npm run protocols -- --check    # check only, change nothing
npm run protocols:baseline      # re-record the selection baseline, only when a change is intended
```
