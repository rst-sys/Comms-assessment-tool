---
id: core
name: Core protocol
layer: core
version: 0.3.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
changelog:
  - "0.3.0 (2026-09-25): wording refined after testing on two versions of a workforce-reduction memo. Central fact must come in the first two or three sentences, in ordinary words; a one-line signpost is allowed; euphemism now fires the trigger. Reputation-first trigger broadened to strategy and ambitions."
  - "0.2.0 (2026-09-25): cut to what the framework prompt (SYSTEM_PROMPT) does not already check. Removed who decided, who is affected, what readers should do, what is being done and next update, which the framework's account and agency calibration already cover. Kept two narrowing elements and three triggers."
  - "0.1.0 (2026-09-25): first draft from the core protocol source review."

narrows:
  - The decision (framework account element)
  - What is known and not yet known (framework rule for "still unfolding")

elements:
  - id: core.central_fact_first
    name: The central fact first, in ordinary words
    means: >-
      The draft states the central fact, what happened or what was decided, in its first two or three sentences and in ordinary words (for example, that jobs are ending, not that a workforce is "impacted"), before background, values, achievements or context. A one-line signpost before it is fine.
    weight: core
    dimension: clarity_plain_language
    basis: standard
    sources: [iso-24495-1-2023, who-erc-2017, li-2008]

  - id: core.estimates_as_estimates
    name: Estimates marked as estimates
    means: >-
      Whatever stage the situation is at, the draft marks what is estimated, expected or still being established as such, and does not state as settled anything the supplied context shows is not.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: guidance
    sources: [who-erc-2017, cdc-cerc-intro-2018, seeger-2006]

triggers:
  - check: The central fact first appears after the first two or three sentences, following background, values, achievements or context; or it is stated only in euphemism ("transformation", "impacted", "realignment") so that a reader skimming the opening would not know what happened.
    dimension: clarity_plain_language

  - check: The draft states certainty ("fully contained", "no impact", "all affected have been contacted", "no further changes are planned") that the supplied context shows is not yet established.
    dimension: truthfulness_factual_discipline
    review: [Legal]

  - check: The draft opens with the organization's strategy, ambitions, record or values before it says who is affected and how.
    dimension: stakeholder_respect_impact

questions:
  - ask: Which facts in this draft are confirmed, and by whom? Which are estimates or assumptions, and would the draft still stand if they changed?
    review: [Legal, Executive]
  - ask: If a reader read only the first two sentences, would they know what happened or what was decided?
---

## What this protocol is

The framework prompt already asks every draft to make the account visible: the decision, who had authority, who is affected, what readers should do, what will change, who owns it, and when the next update comes. The core protocol does not repeat any of that. It narrows two framework elements for every named event:

- The decision must come in the first two or three sentences and in ordinary words, not after context or behind euphemism.
- What is known and not yet known. The framework applies this only when the situation is still unfolding. The core applies it at every stage, because planned announcements also contain forecasts and estimates.

It adds one trigger with its own basis: leading with the organization's strategy, ambitions, record or values before the people affected (Coombs 2007).

## Basis

The central fact first rests on a plain-language standard (ISO 24495-1), WHO's recommendation against technical explanation, and research showing organizations write less plainly when the news is bad (Li 2008).

Estimates marked as estimates rests on WHO's strong recommendation to "indicate what is known and not known at a given time", CDC CERC's "Be Right" and Seeger's (2006) "Accept uncertainty and ambiguity". This guidance was written for public authorities in health emergencies; the tool applies it to organizational communication by analogy.

The reputation-first trigger rests on Coombs (2007): "The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation."

Full sources and limits: `sources/core-protocol-source-review.md`.

## What this protocol does not cover

- Everything the framework prompt already checks (see the source review's addendum, which maps its sources onto those framework elements).
- Timing (whether the organization spoke first): Stage overlay.
- Acknowledging harm in words: People harmed overlay.
- Apology: apology overlay and the Allegations family.
- Legal obligations: overlays.

## Before this protocol is marked active

- Obtain and read Ma & Zhan (2016) and Seeger (2006) in the original.
- Add the source ids to `sources/registry.yaml`.
