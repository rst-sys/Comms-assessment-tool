---
id: people-harmed
name: People harmed or at risk
layer: overlay
# rule: people_at_risk = true
trigger: people-harmed
version: 0.3.1
status: active
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  The EU workplace-safety directive (binding only for EU employers toward their workers) and US CDC emergency-communication guidance applied by analogy, plus crisis-communication theory.
changelog:
  - "0.3.1 — basis notes moved into the file"
  - "0.3.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed."
  - "0.2.0 (2026-09-25): combination rule with the geopolitical and cyber protocols set: their event-specific elements replace this overlay's equivalents when both apply."
  - "0.1.0 (2026-09-25): first draft, built from sources already opened in the geopolitical and core protocol source reviews. No new research."

elements:
  - id: people-harmed.harm_acknowledged
    name: Harm acknowledged in plain words
    means: The draft says plainly that people were harmed or put at risk, and who, rather than describing only an "incident", "event" or "impact".
    weight: core
    dimension: stakeholder_respect_impact
    basis: guidance
    sources: [cdc-cerc-intro-2018, coombs-2007]
    basis_note: "US CDC emergency guidance and crisis-communication theory, applied by analogy; not a measured effect."

  - id: people-harmed.danger_and_protection
    name: The danger now, and the protective steps
    means: For people who may still be at risk, the draft states the danger as currently assessed, the protective steps taken or planned, and who is responsible for them.
    weight: core
    dimension: corrective_action_proof
    basis: law
    sources: [eu-directive-89-391, cdc-cerc-intro-2018]
    basis_note: "Binding for EU employers toward their workers; applied by analogy elsewhere."

  - id: people-harmed.support
    name: Support people can actually reach
    means: Where support is offered, the draft says what it is, who provides it, how to get it and for how long, and offers only what the supplied context confirms exists.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: research
    sources: [coombs-2007]
    basis_note: "Crisis-communication theory (Coombs 2007), not a measured effect."

triggers:
  - check: Harm is described only in impersonal terms ("individuals were impacted", "an incident occurred") and the draft never says that people were hurt or put at risk.
    dimension: stakeholder_respect_impact
  - check: The draft calls the harm or risk "minor", "isolated" or "limited" while the supplied context doesn't establish its extent.
    dimension: truthfulness_factual_discipline
    review: [Legal, Health and safety]
  - check: The draft describes effects on operations, customers or results before it says anything about the people harmed.
    dimension: stakeholder_respect_impact
  - check: Support is mentioned ("support is available", "we are here for our people") with no provider, route or contact.
    dimension: stakeholder_respect_impact

questions:
  - ask: Have the people harmed, and where relevant their families, been told directly before this message goes out?
    review: [HR, Health and safety]
  - ask: Are the protective steps described in the draft actually in place today, and who confirmed it?
    review: [Health and safety, Legal]
  - ask: Does any legal duty to inform workers or a regulator about the danger apply here, and has it been met? Counsel must confirm which rules apply.
    review: [Legal, Health and safety]

---

## What this overlay does

It adds what a message owes people who were hurt or are still at risk. The framework already asks who is affected and what readers should do. This overlay narrows both: harm must be named as harm, and people still at risk must be told the danger and what is being done about it.

## Source

- **Harm acknowledged:** CDC CERC, "Express Empathy: Crises create harm, and the suffering should be acknowledged in words" (core review 2.2). Coombs (2007): "The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation" (core review 5.2). Guidance and theory, not measured effect.
- **Danger and protective steps:** EU OSH Framework Directive 89/391/EEC, Article 8, which requires employers to inform workers "as soon as possible" of "the serious and imminent danger" and "the steps taken or to be taken as regards protection" (geopolitical review 1.3). **Binding only for employers in the EU and only toward their workers.** For other readers and places, the element applies CERC guidance and the same reasoning by analogy.
- **Support people can reach:** Coombs (2007), adjusting information. The requirement to offer only what context confirms comes from the framework's non-invention rule.

## How it combines with event protocols

Two active event protocols already have their own, event-specific version of an element here:

- `geopolitical.danger-and-protective-steps` (people in or near a conflict area) → replaces `people-harmed.danger_and_protection`
- `cyber-incident.support-matched-to-harm` (support that fits the data exposed) → replaces `people-harmed.support`

Rule: when an event protocol and an overlay both apply, and the event protocol's element is marked `replaces: [<overlay element id>]`, the resolver drops the overlay's element and keeps the event's. The event protocols keep their wording; the overlay covers every other event where people are harmed. Add the `replaces` field to those two elements in the same change that activates this overlay.

## Limits

- US workplace-safety duties (OSHA) were not reviewed.
- The overlay only fires when the intake box is ticked. It can't detect harm the author didn't declare.
- Nothing reviewed addresses notifying next of kin; the first question is professional judgement.
