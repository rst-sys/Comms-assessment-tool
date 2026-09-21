---
id: event-core
name: High-stakes event core
layer: core
version: 1
status: draft

# Fires on any communication event except "None of these".
# Part B additionally requires the event to be marked as a failure.

applies:
  events: all
  except: [None of these]

elements:
  - name: Decision and response owner
    means: The draft names who made the decisions it describes, and who owns the response and the questions.
    weight: core
    dimension: accountability_agency

  - name: Who is affected, and how
    means: The draft names the affected groups and the concrete impact on them, or says the group is not yet known.
    weight: core
    dimension: stakeholder_respect_impact

  - name: Claim status
    means: The draft distinguishes what is confirmed, what is a current assessment, what is unknown, and what is a promise.
    weight: core
    dimension: truthfulness_factual_discipline

  - name: Reader action
    means: The draft tells the reader what to do now, or says that nothing is needed from them yet.
    weight: core
    dimension: clarity_plain_language

  - name: Next update and route for questions
    means: The draft gives a next update time or cadence, a place where updates appear, and a named way to ask.
    weight: core
    dimension: verification_follow_through

  - name: Own role separated from outside causes
    means: The draft distinguishes what happened to the organization from what it decided, enabled or failed to prevent.
    weight: core
    dimension: causation_explanation

  - name: Plain naming
    means: The draft states the central fact in ordinary words rather than in euphemism or abstraction.
    weight: core
    dimension: clarity_plain_language

  # Part B. Failure events only.
  - name: What changes
    means: The draft names what will change in practice, governance or incentives so the failure is less likely to recur, with an owner.
    weight: core
    dimension: future_readiness_learning
    only_when: failure

triggers:
  - check: The draft describes a decision and names no role, body or person who made it, and names no owner for the response or for questions.
    dimension: accountability_agency

  - check: The draft does not say who is affected, and does not say that the affected group is not yet known.
    dimension: stakeholder_respect_impact

  - check: The draft states an outcome as settled while also saying the matter is unresolved or under investigation, or states it with no basis given.
    dimension: truthfulness_factual_discipline

  - check: The draft describes something still unfolding and gives neither a next update time nor a place where updates will appear.
    dimension: verification_follow_through

  - check: The central fact is never stated in ordinary words. The draft refers to it only as "the situation", "recent events", "the incident" or similar.
    dimension: clarity_plain_language
    may_be_narrowed_by: event

questions:
  - ask: Which statements here are confirmed today, and who owns each one?
  - ask: Who decided, and does the draft say so?
  - ask: Who owns the next update, and can you meet the time you have named?
  - ask: Have the people most affected been told directly, before or at the same time as this?
---

## What this is

The checks that apply to every high-stakes communication event, whatever the
event is. Each event protocol adds only what is distinctive to that event and
does not repeat anything here.

Part A (the first seven elements and all five triggers) fires on any event.
Part B (the eighth element, "What changes") fires only on events marked as a
failure, because recurrence has no meaning for an acquisition or a planned
retirement.

## Where it came from

Derived from the three protocols in this folder, then tested against all
thirteen events rather than kept on the strength of appearing in all three.

| Core element | Breach | Restructuring | Apology |
|---|---|---|---|
| Decision and response owner | Decision and owner | Named decision owner | Organizational agency; Owner and follow-up |
| Who is affected, and how | Who and what is affected | Scope of impact | Impact recognized |
| Claim status | Claim status | Limited promises | Explanation |
| Reader action | Reader action | Individual notice; Timing and terms | Timely care information |
| Next update and route for questions | Update commitment; Reporting channel | Follow-up channel | Owner and follow-up |
| Own role separated from outside causes | Cause and own exposure | Stated reason | Organizational agency |
| Plain naming | (implicit) | Plain statement of job loss | Offense named |
| What changes (Part B) | Post-incident account | Change to practice | System change |

## What was considered and left out

**What changes — demoted to Part B, not dropped.** It appears in all three
source protocols, but all three describe failures. Tested against the full
thirteen it fails: an acquisition is not a failure, and a planned retirement
has nothing to recur. Keeping it in Part A would have produced a finding on
every merger announcement telling the author to explain how they will prevent
another merger.

This is the clearest evidence that "common to the three files we happen to have"
is not the same test as "true of all thirteen events".

**Cross-audience consistency — left out for now.** True of every event, but the
tool can only compare documents it is given, and the feature that supplies them
is switched off. It would be a check that almost never fires. Revisit when
audience documents are switched back on.

**Support offered, authenticity of the notice, individual notice before public
release.** Each is real but belongs to a subset of events, not all thirteen.
They stay with the events that need them.

## Narrowing

An event protocol may narrow a core trigger, and must say so explicitly. One
case is already known: the plain-naming trigger. In a geopolitical event,
vagueness about a country, a conflict or the location of staff may be a
deliberate safety decision rather than evasion, and the draft cannot show which.
That protocol will turn the trigger into a question instead of a finding.

No event protocol may weaken a core element, add a core check of its own, or
introduce an output section. It adds what is distinctive and nothing else.

## Budget

This block fires on every event review, so it stays short: eight elements, five
triggers, four questions. The four questions leave room for an event protocol's
own within the eight-question cap.
