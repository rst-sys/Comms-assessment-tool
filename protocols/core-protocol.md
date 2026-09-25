---
id: core
name: Core protocol
layer: core
version: 0.4.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
changelog:
  - "0.4.0 (2026-09-25): cleared to activate without Seeger (2006) and Ma & Zhan (2016) in the original; limitation recorded."
  - "0.3.0 (2026-09-25): wording refined after testing on two versions of a workforce-reduction memo. Central fact must come in the first two or three sentences, in ordinary words; a one-line signpost is allowed; euphemism now fires the trigger. Reputation-first trigger broadened to strategy and ambitions."
  - "0.2.0 (2026-09-25): cut to what the framework prompt (SYSTEM_PROMPT) does not already check. Removed who decided, who is affected, what readers should do, what is being done and next update, which the framework's account and agency calibration already cover. Kept two narrowing elements and three triggers."
  - "0.1.0 (2026-09-25): first draft from the core protocol source review."
rests_on: >-
  A plain-language standard, WHO and CDC emergency guidance applied by analogy, and two research findings. No effectiveness study.

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

- The decision (framework account element). The decision must come in the first two or three sentences and in ordinary words, not after context or behind euphemism.
- What is known and not yet known (framework rule for "still unfolding"). The framework applies this only when the situation is still unfolding. The core applies it at every stage, because planned announcements also contain forecasts and estimates.

It adds one trigger with its own basis: leading with the organization's strategy, ambitions, record or values before the people affected (Coombs 2007).

## Basis

The central fact first rests on a plain-language standard (ISO 24495-1), WHO's recommendation against technical explanation, and research showing organizations write less plainly when the news is bad (Li 2008).

Estimates marked as estimates rests on WHO's strong recommendation to "indicate what is known and not known at a given time", CDC CERC's "Be Right" and Seeger's (2006) "Accept uncertainty and ambiguity". This guidance was written for public authorities in health emergencies; the tool applies it to organizational communication by analogy.

The reputation-first trigger rests on Coombs (2007): "The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation."

## Source

Full sources and limits: `sources/core-protocol-source-review.md`.

### Sources not read in the original

- Seeger (2006) was not available. Its best practices are cited as quoted in a peer-reviewed secondary source, Veil et al. (2020). Only `core.estimates_as_estimates` relies on it, alongside WHO (2017) and CDC CERC, which were read.
- Ma & Zhan (2016), the main meta-analysis of crisis-response research, could not be opened. No element relies on it. It would have tested whether the crisis-response literature supports or contradicts these checks; that remains unchecked.

Decision (25 September 2026): activate without them, with this note. Revisit if either becomes available.

## What this protocol does not cover

- Everything the framework prompt already checks (see the source review's addendum, which maps its sources onto those framework elements).
- Timing (whether the organization spoke first): Stage overlay.
- Acknowledging harm in words: People harmed overlay.
- Apology: apology overlay and the Allegations family.
- Legal obligations: overlays.

## Existing protocols that already narrow these checks

Not yet applied. The mechanism these three need does not exist in the format yet, and two different things are being asked for; see the note below.

- `geopolitical` has `narrows: [plain-naming]`, written for the old event core's plain-naming check, which no longer exists. Point it at `core.central_fact_first`. Its narrowing (general wording about locations or people in a danger zone may be a security decision, not euphemism) still applies.
- `workforce-reduction`'s euphemism trigger (rightsizing, realignment, impacted…) is a narrower, event-specific form of `core.central_fact_first`. Mark it as narrowing that element, so one gap produces one finding.
- `cyber-incident`'s trigger on categorical outcomes ("no data was compromised", "contained") while the investigation is ongoing is a narrower form of `core.estimates_as_estimates`. Mark it the same way.

`ceo-departure` also carries `narrows: [plain-naming]`, for the same dead check, and is not listed above.

## Before this protocol is marked active

- ~~Add the source ids to `sources/registry.yaml`.~~ Done: all five are in the registry, `seeger-2006` marked `not_opened` with the Veil et al. (2020) note.
- Decide what `narrows` should mean for the four protocols above, and set `status: active`.
