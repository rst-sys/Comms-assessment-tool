---
id: core
name: Core protocol
layer: core
version: 0.5.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  Emergency risk-communication guidance (WHO, US CDC) applied to organizations by analogy, a plain-language standard, and three studies, none of them testing whether these checks build trust.
changelog:
  - 0.5.0 (2026-09-25): made to pass the build checker. Added rests_on; removed the frontmatter narrows (the core sits directly under the framework and can't narrow it; the relationship is described in the body); added a Source section. No element, trigger or question changed.
  - 0.4.0 (2026-09-25): cleared to activate without Seeger (2006) and Ma & Zhan (2016) in the original; limitation recorded.
  - 0.3.0 (2026-09-25): wording refined after testing on two versions of a workforce-reduction memo. Central fact must come in the first two or three sentences, in ordinary words; a one-line signpost is allowed; euphemism now fires the trigger. Reputation-first trigger broadened to strategy and ambitions.
  - 0.2.0 (2026-09-25): cut to what the framework prompt (SYSTEM_PROMPT) does not already check. Removed who decided, who is affected, what readers should do, what is being done and next update, which the framework's account and agency calibration already cover. Kept two narrowing elements and three triggers.
  - 0.1.0 (2026-09-25): first draft from the core protocol source review.

elements:
  - id: core.central_fact_first
    name: The central fact first, in ordinary words
    means: The draft states the central fact, what happened or what was decided, in its first two or three sentences and in ordinary words (for example, that jobs are ending, not that a workforce is "impacted"), before background, values, achievements or context. A one-line signpost before it is fine.
    weight: core
    dimension: clarity_plain_language
    basis: standard
    sources: [iso-24495-1-2023, who-erc-2017, li-2008]
  - id: core.estimates_as_estimates
    name: Estimates marked as estimates
    means: Whatever stage the situation is at, the draft marks what is estimated, expected or still being established as such, and does not state as settled anything the supplied context shows is not.
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

The framework prompt already asks every draft to make the account visible: the decision, who had authority, who is affected, what readers should do, what will change, who owns it, and when the next update comes. The core protocol does not repeat any of that. It **narrows** two framework elements for every named event:

- **The decision** must come in the first two or three sentences and in ordinary words, not after context or behind euphemism.
- **What is known and not yet known.** The framework applies this only when the situation is still unfolding. The core applies it at every stage, because planned announcements also contain forecasts and estimates.

It adds one trigger with its own basis: leading with the organization's strategy, ambitions, record or values before the people affected (Coombs 2007).

## Source

**Regulator and agency guidance (official, not binding), read:**

- World Health Organization, *Communicating risk in public health emergencies: a WHO guideline for emergency risk communication (ERC) policy and practice* (2017). https://www.who.int/publications/i/item/9789241550208 — recommendations A.1, A.2, C4.1 and C4.3.
- US Centers for Disease Control and Prevention, *Crisis and Emergency Risk Communication (CERC) Manual: Introduction* (2018 update). https://www.cdc.gov/cerc/media/pdfs/CERC_Introduction.pdf — the six CERC principles.

**Standards body, read in part:**

- ISO 24495-1:2023, *Plain language — Part 1: Governing principles and guidelines*. https://www.iso.org/standard/78907.html — catalogue page and abstract only.

**Research:**

- Coombs, W. T. (2007). "Protecting organization reputations during a crisis." *Corporate Reputation Review*, 10(3), 163–176. https://link.springer.com/article/10.1057/palgrave.crr.1550049 — read in the relevant sections.
- Li, F. (2008). "Annual report readability, current earnings, and earnings persistence." *Journal of Accounting and Economics*, 45(2–3), 221–247. https://www.sciencedirect.com/science/article/abs/pii/S0165410108000141 — abstract read.
- Seeger, M. W. (2006). "Best practices in crisis communication: An expert panel process." *Journal of Applied Communication Research*, 34(3), 232–244. https://www.tandfonline.com/doi/abs/10.1080/00909880600769944 — **not opened**; quoted from Veil et al. (2020).

**Declared professional judgement:** the wording of each trigger, the "first two or three sentences" threshold, and the choice of these two checks from the wider guidance.

Full source review, including what could not be read: `sources/reviews/core-protocol-source-review.md`.

## Basis

*The central fact first* rests on a plain-language standard (ISO 24495-1), WHO's recommendation against technical explanation, and research showing organizations write less plainly when the news is bad (Li 2008).

*Estimates marked as estimates* rests on WHO's strong recommendation to "indicate what is known and not known at a given time", CDC CERC's "Be Right" and Seeger's (2006) "Accept uncertainty and ambiguity". This guidance was written for public authorities in health emergencies; **the tool applies it to organizational communication by analogy.**

The reputation-first trigger rests on Coombs (2007): "The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation."


## What this protocol does not cover

- Everything the framework prompt already checks (see the source review's addendum, which maps its sources onto those framework elements).
- **Timing** (whether the organization spoke first): Stage overlay.
- **Acknowledging harm in words:** People harmed overlay.
- **Apology:** apology overlay and the Allegations family.
- **Legal obligations:** overlays.

## How other protocols relate to these checks

- The geopolitical protocol narrows *The central fact first*: general wording about locations or people in a danger zone may be a security decision, not euphemism.
- The workforce-reduction protocol's list of euphemisms (rightsizing, realignment, impacted…) is a sharper, event-specific form of *The central fact first*.
- The cyber-incident protocol's check on categorical claims ("no data was compromised", "contained") during an investigation is a sharper, event-specific form of *Estimates marked as estimates*.

Where both fire, the tool raises one finding, not two.

## Sources not read in the original

- **Seeger (2006)** was not available. Its best practices are cited as quoted in a peer-reviewed secondary source, Veil et al. (2020). Only `core.estimates_as_estimates` relies on it, alongside WHO (2017) and CDC CERC, which were read.
- **Ma & Zhan (2016)**, the main meta-analysis of crisis-response research, could not be opened. No element relies on it. It would have tested whether the crisis-response literature supports or contradicts these checks; that remains unchecked.

Decision (25 September 2026): activate without them, with this note. Revisit if either becomes available.
