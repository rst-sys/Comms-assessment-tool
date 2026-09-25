# Step 2 — Writing a protocol for Trust Assessment Assistant

A protocol is the extra set of rules the review engine follows for one kind of
event. It is how the tool knows that a data breach should be judged differently
from a layoff.

This file is the prompt you paste into Claude, in a separate conversation, to
write one. Everything Claude needs to know about the tool is in it.

## Do step 1 first

**`RESEARCH-PROMPT.md` comes before this one.** It goes and finds the standards
and research for your event, checks that each source actually exists, and says
plainly what it could not verify. What it gives you back is what you paste into
the second blank at the bottom of this file.

Skipping it means writing a protocol from whatever Claude half-remembers, and a
protocol that cannot name a real source cannot go in the library — the page
would be claiming something the tool cannot support, and the checker rejects it.

## How to use it

1. Run `RESEARCH-PROMPT.md` first and keep the reply.
2. Copy everything below from the line `---- COPY FROM HERE ----` to the end.
3. Paste it into a new Claude conversation.
4. At the bottom, fill in the two blanks: which event, and the research from
   step 1.
5. Claude replies with a finished file.
6. Save the reply as `protocols/<name>.md`, upload it to GitHub, and tell me.
   I run the checker and switch it on.

---- COPY FROM HERE ----

You are writing a **protocol** for a tool called Trust Assessment Assistant.
Read all of this before writing anything.

## What the tool does

It reviews a draft corporate communication and judges whether it gives a
credible account of a decision: what was decided, who had authority, who is
affected, what will change, who owns it, how anyone can verify it. It scores
ten weighted dimensions out of 100, raises findings, and asks questions the
author should settle before publishing.

**It never rewrites the draft and never proposes wording.** It names the kind of
information that is missing and leaves the writing to the author. This rule is
absolute.

## How the tool is organized

The user answers three separate questions at intake:

- **Event** — what happened. Thirteen of them, listed below. This is what
  selects your protocol.
- **Format** — what the document is (press release, employee announcement, FAQ,
  and so on). Does not select protocols.
- **Audience** — who reads it. Does not select protocols.

So your protocol applies to **one event, in any format, to any audience**. Do
not write anything that assumes a particular format or reader.

## What is already covered — do not repeat it

Every draft, whatever it is about, is already judged on whether it makes these
visible. Your protocol must **not** include any of them. Duplicating one wastes
the budget and produces the same finding twice.

1. The decision — what was decided, announced, changed or corrected
2. Who had the authority to decide, approve or intervene
3. The external conditions that mattered, stated specifically
4. The internal choices and assumptions that increased exposure
5. Who is affected, and how
6. What the reader should do now, or that nothing is needed from them yet
7. What will change, and who owns the change
8. How anyone can verify follow-through, when the next update comes, and a
   named way to ask
9. What changes so it does not happen again
10. Whether claims are confirmed, asserted or unverifiable
11. Language that hides who decided — euphemism, passive voice, external
    weather, institutional abstraction

Your job is **only what is distinctive to this event.** If you find yourself
writing "names who decided", stop: it is already there.

You may **narrow** one framework check if this event genuinely requires it.
Exactly one is open to it: **`plain-naming`** — that the central fact must be
stated in ordinary words rather than euphemism. Narrow it when vagueness may be
a deliberate safety or legal decision the draft cannot evidence, name it by that
id in the `narrows` field, and explain why in the prose.

Nothing else can be narrowed, and the checker will refuse a file that tries. The
framework is the floor: if an event seems to need a lower one, that is worth
arguing before it is worth writing.

## The thirty events

One protocol may claim several of these, and should where they carry the same
duty: `workforce-restructuring` claims layoffs, restructuring and site closure,
because the account owed to the people losing something is the same in all
three. Do not claim an event another protocol already claims — the checker will
refuse the file and name the other one.

**Leadership and governance** — CEO or senior leader departure · New CEO or leadership appointment · Board change or governance dispute · Allegations against a leader

**People and workplace** — Layoffs or job cuts · Restructuring or reorganization · Site, office or store closure · Workplace accident or serious injury · Harassment, discrimination or culture allegations · Strike or labor dispute · Major policy change (e.g. return to office, benefits)

**Operations and safety** — Cyber incident or data breach · System outage or service disruption · Product recall or safety issue · Environmental incident · Supply chain disruption

**Business and finance** — Merger, acquisition or sale · Disappointing results or profit warning · Price increase or change to terms · Financial difficulty or cost-cutting · Change of strategy or exit from a market

**Legal and reputation** — Investigation, lawsuit or regulatory action · Fraud or financial misconduct · Backlash to something the organization said or did · Rumor or misinformation about the organization · Pressure from activists, campaigners or investors

**External events** — Geopolitical event (war, sanctions, unrest) · Natural disaster or extreme weather · Public health emergency · Social or political issue (deciding whether to speak)

## The ten dimensions

Every element and every trigger must name one of these, by this exact
identifier. A protocol is a lens on these ten, never an eleventh score.

| Identifier | Weight | What it judges |
|---|---|---|
| `accountability_agency` | 18 | The decision is named, decision rights visible, responsibility matched to authority |
| `truthfulness_factual_discipline` | 12 | Specificity, supportability, fact distinguished from forecast, uncertainty disclosed |
| `causation_explanation` | 12 | Root cause not symptoms, external context distinguished from internal exposure |
| `stakeholder_respect_impact` | 12 | Affected groups named, material impact acknowledged, no euphemism |
| `listening_employee_voice` | 10 | Feedback used responsibly, stakeholder voice kept separate from leadership decisions |
| `corrective_action_proof` | 10 | Specific, proportionate, owned, timed, feasible commitments |
| `clarity_plain_language` | 8 | Affected audiences can understand what happened and what is next |
| `verification_follow_through` | 8 | Metrics, milestones, update dates, independent review, falsifiable commitments |
| `fairness_independence_conflicts` | 5 | Interests disclosed, no scapegoating or self-serving framing |
| `future_readiness_learning` | 5 | Changes to practice, governance or incentives that reduce recurrence |

## Fixed vocabulary

Specialist review types, spelled exactly: `Legal`, `HR`, `Labor`, `Privacy`,
`Information security`, `Investor relations`, `Local market`, `Executive`.

## Hard limits

A checker rejects the file if it breaks these.

- **At most 8 elements**
- **At most 6 triggers** — every trigger is a serious finding. If everything is
  serious, nothing is.
- **At most 6 questions** — and a review shows at most 8 in total, so yours
  compete with the draft's own and with any posture protocol's.

**Keep the whole file under about 450 words of `means`, `check` and `ask` text.**
Counts alone are not enough: eight elements of forty words each blows a
library-wide budget that also has to fit a posture protocol on top. One clean
sentence per element. A trigger is a condition, not a paragraph.

## Rules

**Every trigger must be checkable by reading the draft.** "Growth is named as
the cause without leadership agency" can be verified. "The message should show
empathy" cannot, and instructs the engine to assert what it has no evidence for.

**Never propose wording.** Name the kind of information missing — a date, a
named owner, the selection criteria — never a sentence to paste.

**Never assert a legal conclusion.** Say an obligation *may* apply and that
counsel must confirm.

**Never ask for a section of the output.** A protocol changes what the engine
looks for, never what it writes. Everything it finds comes out as an ordinary
finding or question.

**Write plainly.** "The draft says who is leaving but not how roles were
chosen", not "the communication does not appear to provide clarity regarding
selection methodology".

**`rests_on` is honest, not impressive.** It is the only line about provenance
most readers will see — the full sources sit behind a click. Say what kind of
authority it is and how much weight it carries. Good: "US regulator guidance
plus professional judgment; none of it measures which notices work better."
Bad: "extensive research and international best practice".

## The exact shape to produce

Give me one Markdown file. Nothing before the first `---`.

```markdown
---
id: short-name-with-hyphens
name: The name shown in the Standards Library
layer: event
events:                  # one or more, spelled exactly as the list above spells them
  - <an event this protocol covers>
version: 1
status: active
rests_on: >-
  One line, at most 30 words, naming what KIND of authority this rests on and
  how strong it is. Not a summary of the sources.

elements:
  - name: Short name
    means: One sentence saying what it is.
    weight: core            # core or supporting
    dimension: accountability_agency

triggers:
  - check: Something checkable by reading the draft.
    dimension: truthfulness_factual_discipline
    review: [Legal, Privacy]     # optional

questions:
  - ask: A question this event should always settle?
    review: [Legal]              # optional

narrows:                          # optional; only if you are softening plain-naming
  - plain-naming                  # the id of the framework check, not its wording
---

## Source

The research, code or standard it rests on: author, title, publication, year,
and a link. Say plainly where something rests on professional judgment rather
than a published source. Do not invent citations. Do not cite what you have not
read — say what you could not open and why.

## Basis

How that evidence was produced. For a study: how many participants, what was
measured. For a code: who issues it and what standing it has. Be honest about
weakness.

## What this protocol does not cover

Its limits. What it cannot judge, what it assumes, where a human must decide.
This goes on the page, so users know what they are getting.
```

Two traps in the settings block. A colon followed by a space inside a sentence
breaks the file — write "what was tried first — voluntary exit" rather than
"what was tried first: voluntary exit". And every question needs a question
mark; a caveat after it is fine, so "Does the timing fit? Counsel must confirm."
passes.

## Before you answer

If the research I give you is thin, or does not support the protocol I am
asking for, **say so instead of writing one anyway**. A protocol built on
nothing would make the tool claim rigour it does not have, which is exactly
what this tool exists to catch in other people's communications.

If you need to know something about the event before you can write a good
protocol, ask me first.

---

**The event I want a protocol for:**

[ WRITE IT HERE ]

**The research and standards it should rest on:**

[ PASTE THE WHOLE REPLY FROM RESEARCH-PROMPT.md HERE — including its "could not
verify" and "what nobody has established" sections. Do not trim those out: a
source it could not open must not end up cited as though it had been read. ]
