# Writing a protocol for Trust Assessment Assistant

A protocol is a set of extra instructions the review engine follows when it
meets one kind of communication. It is how the tool knows that a layoff memo
should be judged differently from a product launch.

This file is the prompt you paste into Claude, in a separate conversation, to
write one. Everything Claude needs to know about the tool is in it, so you do
not have to explain the tool each time.

## How to use it

1. Copy everything from the line `---- COPY FROM HERE ----` to the end.
2. Paste it into a new Claude conversation.
3. At the bottom, fill in the two blanks: the kind of communication, and the
   research or standards it should rest on.
4. Add your research — paste the papers, the codes, the guidance you found,
   or describe them.
5. Claude writes the protocol. Bring the whole reply back here and I will
   integrate it.

## Before you start

Have your sources to hand. The protocol is only as good as what it rests on,
and a protocol that cannot name its source cannot go in the Standards Library —
the page would be claiming something the tool cannot support.

---- COPY FROM HERE ----

You are helping write a **protocol** for a tool called Trust Assessment
Assistant. Read all of this before writing anything.

## What the tool does

It reviews a draft corporate communication — a layoff memo, an apology, a
breach notification — and judges whether it gives a credible account of a
decision: what was decided, who had authority, what context mattered, who is
affected, what will change, who owns it, how anyone can verify it.

It scores ten weighted dimensions out of 100, raises findings, and asks
questions the author should settle before publishing.

**It never rewrites the draft.** It never proposes wording. It names the kind
of information that is missing and leaves the writing to the author. This rule
is absolute and your protocol must not break it.

## The ten dimensions, with their weights

Your protocol may only refer to these, by these exact identifiers:

| Identifier | Weight | What it judges |
|---|---|---|
| `accountability_agency` | 18 | The decision is named, decision rights are visible, responsibility is matched to authority |
| `truthfulness_factual_discipline` | 12 | Specificity, supportability, fact distinguished from forecast, uncertainty disclosed |
| `causation_explanation` | 12 | Root cause not symptoms, external context distinguished from internal exposure |
| `stakeholder_respect_impact` | 12 | Affected groups named, material impact acknowledged, no euphemism |
| `listening_employee_voice` | 10 | Feedback used responsibly, stakeholder voice kept separate from leadership decisions |
| `corrective_action_proof` | 10 | Specific, proportionate, owned, timed, feasible commitments |
| `clarity_plain_language` | 8 | Affected audiences can understand what happened and what is next |
| `verification_follow_through` | 8 | Metrics, milestones, update dates, independent review, falsifiable commitments |
| `fairness_independence_conflicts` | 5 | Interests disclosed, no scapegoating or self-serving framing |
| `future_readiness_learning` | 5 | Changes to practice, governance or incentives that reduce recurrence |

A protocol is **a lens on these ten**, never an eleventh score. Everything it
checks must land on one of them.

## The kinds of communication it knows

CEO or executive message · Employee announcement · Layoff or restructuring ·
Press release · Crisis statement · Holding statement · Apology · Investor
communication · Product or service announcement · Policy or public-affairs ·
Change-management · Blog post · Social-media post · Talking points · Manager
toolkit · FAQ · Other

## Fixed vocabulary

Use these words exactly, including capital letters.

- Severity: `Low`, `Moderate`, `High`
- Specialist review types: `Legal`, `HR`, `Labor`, `Privacy`,
  `Information security`, `Investor relations`, `Local market`, `Executive`

## The standard to match

This is the tool's existing protocol for layoffs. It works because every line
is **checkable against the draft**. Match this level of concreteness.

```
LAYOFF AND RESTRUCTURING REVIEW
Treat the following as euphemism watchlist terms in addition to the
vague-action list: rightsizing, workforce optimization, simplification,
efficiency, synergies, realignment, organizational health, agile organization,
leaner organization, fewer layers, streamlining, cost discipline.

Raise a High-severity finding when any of these is true:
- Employee feedback is cited as a reason for reduction without an explicit
  statement that leadership, not employees, made the decision.
- Growth, complexity, the organization, or legacy structures are named as the
  cause without leadership agency.
- Headcount reduction is announced without role-selection criteria, transition
  support, or the review process available to affected people.

Always include these among the questions before publication:
- Were affected employees assessed for internal mobility before selection?
- What leadership decisions, incentives, or governance conditions produced the
  structure being removed?
- Are legal, labor, works-council, or local consultation obligations implicated
  in the selected market?

Set specialist_review_needed to true with type HR or Labor on every finding in
this set. Never state whether a consultation obligation applies; state that it
may and that counsel must confirm.
```

## Rules your protocol must follow

**Every trigger must be checkable against the draft.** "Growth is named as the
cause without leadership agency" can be verified by reading. "The message
should demonstrate empathy" cannot, and instructs the engine to assert things
it has no evidence for. A vague protocol produces worse reviews than none.

**Never propose wording.** Name the kind of information missing — a date, a
named owner, a metric, the selection criteria — never a sentence to paste.

**Never assert a legal conclusion.** Say an obligation *may* apply and that
counsel must confirm. Never say a draft is compliant or non-compliant.

**Be proportionate.** Reserve High for gaps where a reasonable reader could not
tell what was decided, who decided, who is affected, or what happens next.
If everything is High, nothing is.

**Write plainly.** The tool's own output is deliberately direct: "The draft
says who is leaving but not how roles were chosen", not "the communication
does not appear to provide clarity regarding selection methodology". Your
protocol should read the same way.

**Stay inside the ten dimensions.** If something you want to check does not
land on one of them, say so in your notes rather than inventing a category.

## What to give back

Produce exactly these eight sections, with these headings.

**1. Name** — what this protocol is called, a few words.

**2. Applies when** — which communication types trigger it, and any goal or
condition that should also trigger it. Be precise.

**3. Source** — the research, code or standard it rests on, cited properly:
author, title, publication, year, and a link if there is one. If part rests on
professional judgement rather than a published source, say so plainly. Do not
invent citations, and do not cite something you have not actually read.

**4. Basis** — one or two sentences on how that evidence was produced. For a
study: how many participants, what was measured. For a professional code: who
issues it and what standing it has.

**5. Elements** — the things a good communication of this kind contains. For
each: a short name, what it means in one sentence, how important it is relative
to the others, and which of the ten dimensions it bears on.

**6. High-severity triggers** — a list, each checkable by reading the draft,
in the style of the layoff example.

**7. Questions before publication** — questions this kind of communication
should always settle. Where one needs a named reviewer, say which.

**8. What this protocol does not cover** — its limits. What it cannot judge,
what it assumes, where a human must decide. Be honest here; it goes on the
page so users know what they are getting.

## Before you answer

If the research I give you is thin, or does not support the protocol I am
asking for, **say so instead of writing one anyway**. A protocol built on
nothing would make the tool claim rigour it does not have, which is exactly
what this tool exists to catch in other people's communications.

If you need to know something about the communication type before you can write
a good protocol, ask me first.

---

**The communication type I want a protocol for:**

[ WRITE IT HERE ]

**The research and standards it should rest on:**

[ PASTE OR DESCRIBE YOUR SOURCES HERE ]
