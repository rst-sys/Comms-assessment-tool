# Writing a protocol for Trust Assessment Assistant

A protocol is the extra set of rules the review engine follows for one kind of
event. It is how the tool knows that a data breach should be judged differently
from a layoff.

This file is the prompt you paste into Claude, in a separate conversation, to
write one. Everything Claude needs to know about the tool is in it.

## How to use it

1. Copy everything from the line `---- COPY FROM HERE ----` to the end.
2. Paste it into a new Claude conversation.
3. At the bottom, fill in the two blanks: which event, and the research it
   should rest on.
4. Claude replies with a finished file.
5. Save the reply as `protocols/<name>.md`, upload it to GitHub, and tell me.
   I run the checker and switch it on.

## Before you start

Have your sources to hand. A protocol that cannot name its source cannot go in
the library — the page would be claiming something the tool cannot support, and
the checker rejects it.

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

## How the tool is organised

The user answers three separate questions at intake:

- **Event** — what happened. Thirteen of them, listed below. This is what
  selects your protocol.
- **Format** — what the document is (press release, employee announcement, FAQ,
  and so on). Does not select protocols.
- **Audience** — who reads it. Does not select protocols.

So your protocol applies to **one event, in any format, to any audience**. Do
not write anything that assumes a particular format or reader.

## What is already covered — do not repeat it

Every review of any high-stakes event already applies a shared core. Your
protocol must **not** include any of these. Duplicating one wastes the budget
and produces the same finding twice.

1. Who decided, and who owns the response and the questions
2. Who is affected, and the concrete impact on them
3. What is confirmed, what is an assessment, what is unknown, what is a promise
4. What the reader should do now, or that nothing is needed yet
5. A next update time, where updates appear, and a named way to ask
6. What happened *to* the organization, kept separate from what it decided,
   enabled or failed to prevent
7. The central fact stated in ordinary words rather than euphemism
8. What changes so it does not recur — on failure events only

Your job is **only what is distinctive to this event.** If you find yourself
writing "names who decided", stop: the core has it.

You may **narrow** one of the core checks if this event genuinely requires it —
for example, vagueness about a location may be a staff-safety decision rather
than evasion. Say so explicitly in the `narrows` field and explain it in the
prose.

## The thirteen events

CEO or senior-leader departure · Workforce reduction or major reorganization ·
Cyberattack or data incident · Workplace safety event or facility emergency ·
Service outage, product defect, recall or quality failure · Regulatory
investigation, litigation or ethics allegation · Acquisition, divestiture or
major integration · Poor financial results, site closure or strategic retreat ·
Employee-relations controversy or union escalation · Public backlash — values,
culture, DEI or political pressure · Supply-chain disruption affecting customers
or employees · Community or environmental incident at a facility · Geopolitical
event affecting operations or employee welfare

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
  compete with the core's and with the draft's own.

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

## The exact shape to produce

Give me one Markdown file. Nothing before the first `---`.

```markdown
---
id: short-name-with-hyphens
name: The name shown in the Standards Library
layer: event
event: <one of the thirteen, spelled exactly>
version: 1
status: active

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

narrows:                          # optional; only if you are softening a core check
  - The exact core check you are softening.
---

## Source

The research, code or standard it rests on: author, title, publication, year,
and a link. Say plainly where something rests on professional judgement rather
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

Watch for one trap: in the settings block, a colon followed by a space inside a
sentence breaks the file. Write "what was tried first — voluntary exit" rather
than "what was tried first: voluntary exit".

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

[ PASTE OR DESCRIBE YOUR SOURCES HERE ]
