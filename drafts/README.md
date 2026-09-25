# Drafts

Protocol text the owner has supplied but that is not yet in `protocols/`.

`scripts/compile-protocols.ts` walks `protocols/` only, so nothing here is
compiled, validated or sent to the model. A file lands here when it has been
written but the build still refuses it, so the text is kept safely in the
repository rather than in a chat window while the open questions are settled.

## core-protocol-0.3.0.md

The Core Protocol as supplied on 2026-09-25, word for word. Four things stop
it being moved to `protocols/core-protocol.md`, and each needs the owner's
decision rather than a guess:

1. No `rests_on:`. Every protocol needs one line naming what kind of authority
   it rests on; it is what the Standards Library card shows.
2. `narrows:` is rejected on the core layer — the core sits directly under the
   framework, so it cannot narrow it. The two entries are prose rather than
   framework check ids, and the body already says the same thing.
3. No `## Source` heading. The body points at
   `sources/core-protocol-source-review.md`, which does not exist yet.
4. Five cited source ids are not in `sources/registry.yaml`:
   `iso-24495-1-2023`, `who-erc-2017`, `li-2008`, `cdc-cerc-intro-2018`,
   `seeger-2006`. The build checks draft protocols too, so this fails now
   rather than at activation.

Nothing here changes a review. `protocols/core-protocol.md` remains the empty
`status: draft` stub, which the resolver skips.
