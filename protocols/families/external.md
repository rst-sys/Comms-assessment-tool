---
id: external
name: External events and societal issues
layer: family
version: 0.2.1
status: active
last_reviewed: 2026-09-27
review_by: 2027-03-27
rests_on: >-
  Research on corporate stances and brand activism, WHO guidance on consistent emergency messages applied by analogy, and the geopolitical source review; binding law arrives through the overlays.
changelog:
  - "0.2.1 (2026-10-02): opening description reworded in plain English; no check changed."
  - "0.2.0 (2026-09-27): after the duplicate check, the practice element checks only for practice contradicting the stated position (asking for action, not just language, is already the corrective-action dimension); the solidarity and practice-contradiction triggers removed (covered by the core, the People harmed overlay, the framework's scan, and now the element)."
  - "0.1.0 (2026-09-27): first draft from the External family source review."

elements:
  - id: external.why-speaking
    name: Why the organization is speaking
    means: The draft says how the event or issue connects to the organization (its people, operations, customers or stated commitments) and why it is speaking now. Where it takes a position, it says why this organization has standing to.
    weight: core
    dimension: causation_explanation
    basis: research
    sources: [braga-2026-sociopolitical-activism, bamiatzi-2024-partisan-csr]
    basis_note: "A meta-analysis found a small positive effect of corporate stances, with employees responding least favourably; a study of the Russia–Ukraine war found firms often followed peers. A caution, not a standard."
  - id: external.what-it-means-here
    name: What it means here
    means: The draft separates what is happening in the world from what it means for the organization, saying which people, sites, customers or services are affected, how, and what the organization is doing about it.
    weight: core
    dimension: stakeholder_respect_impact
    basis: judgement
    sources: []
  - id: external.actions-match-words
    name: Practice that matches the words
    means: Nothing in the supplied context shows the organization's own practice (donations, lobbying, policies or conduct) contradicting the support or position the draft states; where it does, the draft addresses the contradiction.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: research
    sources: [vredenburg-2020-woke-washing, braga-2026-sociopolitical-activism]
    basis_note: "A conceptual paper defines authentic activism as messaging matched by practice; a meta-analysis found consistent, resource-backed stances worked best. Neither measures trust in a message."
  - id: external.consistent-with-authorities
    name: Consistent with the authorities
    means: Where the draft tells people what to do to stay safe, it matches the authorities' current guidance, names the authority, and says the advice will change if that guidance changes.
    weight: supporting
    dimension: truthfulness_factual_discipline
    basis: guidance
    sources: [who-erc-2017]
    basis_note: "WHO recommends consistent messages from different sources early in an emergency; written for health authorities, applied to organizations by analogy."
    applies_if: { event: [natural-disaster, public-health-emergency, geopolitical-event] }

triggers:
  - check: The draft presents a step the organization is required to take (an authority's closure or evacuation order, sanctions compliance, insurance terms) as a moral choice or an act of generosity.
    dimension: truthfulness_factual_discipline
    review: [Legal]
    superseded_by: geopolitical
  - check: The draft gives safety or health instructions that differ from, or go beyond, the authorities' current guidance without saying so.
    dimension: truthfulness_factual_discipline
    review: [Health and safety, Legal]

questions:
  - ask: Does the organization's record (earlier statements, donations, lobbying, practices) support what this draft says, and could someone show otherwise?
    review: [Executive, Legal]
  - ask: Do the instructions in this draft match the authorities' current guidance, and who will update the message when that guidance changes?
    review: [Health and safety]
  - ask: Will employees in different countries, or on different sides of this issue, read this message, and has someone from each group reviewed it?
    review: [HR, Local market]
  - ask: Is attending any meeting about this, or receiving the message, optional for employees? Some US states restrict required meetings on political matters.
    review: [Legal, HR]
---

## What this protocol is

The shared checks for every event in the External family: geopolitical events; natural disasters and extreme weather; public health emergencies; and social or political issues where the organization is deciding whether to speak. Only the geopolitical event has its own protocol.

For a geopolitical event, the Geopolitical protocol's own checks are used instead of this family's checks on why the organization is speaking, what it means here, and presenting a required step as a moral choice. Where people are in danger, the People harmed overlay covers the danger and the protective steps.

## Source

**Research:** Vredenburg, Kapitan, Spry & Kemper (2020), *Journal of Public Policy & Marketing* 39(4); Braga, Tardin, Grinstein & Perin (2026), *Journal of Business Research* 210; Bamiatzi et al. (2024), *Journal of Business Ethics* 198.

**Guidance:** World Health Organization (2017), *Communicating risk in public health emergencies*, recommendation C4.2, applied by analogy.

**Declared professional judgement:** *What it means here*; applying each source beyond its setting; the wording of all four triggers.

Full source review: `sources/reviews/external-family-source-review.md`. The Geopolitical protocol's own review: `sources/reviews/geopolitical-event-source-review.md`.

## What this protocol does not cover

- Whether the organization should take a position. The tool checks whether the draft gives its reasons and backs them with action, not whether the position is right.
- Sanctions, disaster and public-health law. Counsel decides what the law requires.
- Legal duties to workers in danger, to employees facing job losses, and to markets: carried by the People harmed, Workforce impact and Listed company overlays.
