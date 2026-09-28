---
id: change-readiness
name: Change readiness
layer: overlay
trigger: change-readiness
version: 0.2.0
status: draft
last_reviewed: 2026-09-27
review_by: 2027-03-27
rests_on: >-
  Research on the five beliefs that decide whether employees are ready for change (Armenakis and colleagues), with field and meta-analytic support for information, confidence and explanation.
changelog:
  - "0.2.0 (2026-09-28): wording tightened to save space in the prompt, before going live; no check added or removed."
  - "0.1.0 (2026-09-27): first draft from the Change readiness source review."

elements:
  - id: change-readiness.why-this-change
    name: Why this change, rather than another
    means: The draft names the problem the change solves and why this option was chosen over the alternatives the context shows were considered.
    weight: core
    dimension: causation_explanation
    basis: research
    sources: [armenakis-harris-2009, shaw-2003-explanations]
    basis_note: "One of five beliefs research links to readiness for change (appropriateness); a meta-analysis of 54 samples found explanations improve fairness judgements. Applied to a single message as professional judgement."
  - id: change-readiness.able-to-make-it
    name: Able to make the change
    means: The draft says what training, time, tools or support people will get, when, and who to go to when something doesn't work.
    weight: core
    dimension: future_readiness_learning
    basis: research
    sources: [armenakis-harris-2009, wanberg-banas-2000]
    basis_note: "Efficacy is one of five beliefs linked to readiness for change; a longitudinal study found information and confidence in coping predicted openness. Applied to a single message as professional judgement."
  - id: change-readiness.leaders-committed
    name: Leaders' commitment shown, not just stated
    means: The draft names who owns the change and how progress will be reported, and, where earlier changes of this kind stalled, what is different this time.
    weight: supporting
    dimension: accountability_agency
    basis: research
    sources: [armenakis-harris-2009]
    basis_note: "Principal support, one of five beliefs linked to readiness for change: that leaders are committed and it is not another passing fad. Applied to a single message as professional judgement."
  - id: change-readiness.gains-and-losses
    name: What people gain and lose, honestly
    means: The draft says what stays the same for the people receiving it, what they gain, and what gets harder, at least for a while.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: research
    sources: [armenakis-harris-2009, oreg-2011-reactions]
    basis_note: "Valence, one of five beliefs linked to readiness for change; a review of 79 studies lists perceived benefit or harm among the causes of reactions. Applied to a single message as professional judgement."

triggers:
  - check: The draft presents the change only as an opportunity ("exciting", "a journey") while the supplied context shows costs or disruption.
    dimension: truthfulness_factual_discipline
  - check: The draft promises training or support ("fully supported") without saying what, when or from whom.
    dimension: future_readiness_learning
  - check: The draft tells readers how to feel ("embrace", "we're all excited") instead of giving reasons.
    dimension: stakeholder_respect_impact

questions:
  - ask: Have earlier changes of this kind stalled, been reversed or left people worse off, and does the draft need to say what is different this time?
    review: [Executive, HR]
  - ask: Is the training or support the draft promises funded, scheduled and confirmed by whoever will deliver it?
    review: [HR]
  - ask: Do managers have what they need to answer their teams' questions before this goes out?
    review: [HR]
---

## What this overlay is

Checks for any message asking employees to make a change: a restructuring or reorganization, a major policy change, a new or updated strategy, or a merger or acquisition. It adds what the Workforce family, the Workforce impact overlay and the framework don't cover: why *this* change, whether people will be able to make it, whether leaders are visibly committed, and an honest account of what people gain and lose.

It doesn't repeat what the others check: what changes and when (Workforce family), whether the decision is final and what can still be influenced (Workforce impact overlay), consultation and bargaining (Workforce family), or why change is needed at all (the framework's causation dimension).

## Source

**Research:** Armenakis & Harris (2009), *Journal of Change Management* 9(2); Armenakis, Bernerth, Pitts & Walker (2007), *Journal of Applied Behavioral Science* 43(4); Wanberg & Banas (2000), *Journal of Applied Psychology* 85(1); Shaw, Wild & Colquitt (2003), *Journal of Applied Psychology* 88(3); Oreg, Vakola & Armenakis (2011), *Journal of Applied Behavioral Science* 47(4).

**Declared professional judgement:** applying beliefs measured in people to the content of a single message; the wording of all three triggers.

Full source review: `sources/reviews/change-readiness-source-review.md`.

## What this overlay does not cover

- A change campaign over time. The tool reviews one message.
- How people feel. It checks what the message says.
- Whether the change is the right one.
