---
id: incident
name: Incident and disruption
layer: family
version: 0.2.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  EU and US product-recall rules and EU rules on service incidents, which are specific but narrow; applied to other incidents as professional judgement.
changelog:
  - "0.2.0 (2026-09-25): after a dry run on two recall notices, the risk-lessening trigger was split. Shrinking words (precautionary, abundance of caution, discretionary, rare situations) fire when a hazard is known; \"voluntary\" fires only where EU law applies or a regulator ordered the recall, since in the US it is a legal status."
  - "0.1.0 (2026-09-25): first draft from the Incident family source review."

elements:
  - id: incident.what-happened-and-when
    name: What happened, and when
    means: The draft says what happened, when it started, when the organization found out, and whether it is still happening.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: judgement
    sources: [eu-gpsr-2023-988, cpsc-16-cfr-1115-27, cdc-cerc-intro-2018]
    basis_note: Recall-notice rules (US, EU) require the hazard and relevant dates; extending this to every incident, including when the organization found out, is professional judgement.
  - id: incident.risk-stated-plainly
    name: The risk stated plainly
    means: The draft describes the risk or hazard plainly, without wording that makes it sound smaller than the supplied context shows.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [eu-gpsr-2023-988, cpsc-16-cfr-1115-27]
    basis_note: EU law bans risk-lessening terms such as "precautionary" and "voluntary" in recall notices; applying the rule to other incidents is professional judgement.
  - id: incident.service-status
    name: What still works, and when service returns
    means: Where a service, product or supply is disrupted, the draft says what still works, what doesn't, and when normal service is expected, or that this isn't known yet.
    weight: core
    dimension: stakeholder_respect_impact
    basis: law
    sources: [eu-nis2-2022-2555]
    basis_note: Binding for essential and important entities in the EU, which must tell service users about significant incidents; applied by analogy elsewhere.
  - id: incident.remedy
    name: What people are owed, and how to claim it
    means: Where people are owed a remedy (repair, replacement, refund, credit or compensation), the draft says what it is, whether they can choose, and how to claim it, or when that will be decided.
    weight: supporting
    dimension: corrective_action_proof
    basis: law
    sources: [eu-gpsr-2023-988, cpsc-16-cfr-1115-27]
    basis_note: Required for product recalls (EU: a choice of at least two of repair, replacement or refund); applied to other incidents as professional judgement.

triggers:
  - check: The draft calls a recall or corrective action "precautionary", "out of an abundance of caution", "discretionary" or relevant only "in rare situations" while the draft itself or the supplied context reports a known hazard, failures or injuries.
    dimension: truthfulness_factual_discipline
    review: [Legal]
  - check: The draft calls a recall "voluntary" where the product is sold in the EU, or where the supplied context shows a regulator ordered the recall. (In the US, a voluntary recall is a legal status, not spin, and is not a finding on its own.)
    dimension: truthfulness_factual_discipline
    review: [Legal, Local market]
  - check: People are told to "contact customer support" or "reach out" about a remedy, and the draft never says what the remedy is.
    dimension: corrective_action_proof

questions:
  - ask: Which regulators or authorities must be notified, and does the timing of this message fit those notifications? Counsel must confirm which duties apply.
    review: [Legal]
  - ask: Who is investigating the cause, is any part of the investigation independent, and will the findings be published?
    review: [Executive]
---

## What this protocol is

The shared checks for every event in the Incident family: cyber incidents, system outages, product recalls, environmental incidents, workplace accidents and supply-chain disruptions. It matters most for the five events without their own protocol.

The cyber protocol's *What and when* replaces this family's *What happened, and when* on cyber drafts. Where people are harmed, the People harmed overlay adds harm, danger and support checks.

## Source

**Binding law, read in the parts cited:**

- Regulation (EU) 2023/988 on general product safety, Articles 36 and 37(1). https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32023R0988
- 16 CFR 1115.27, recall notice content requirements (US CPSC). https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115/subpart-C/section-1115.27
- Directive (EU) 2022/2555 (NIS2), Article 23, read from a secondary host. https://www.springlex.eu/en/packages/nis2/nis2-directive/article-23/

**Guidance:** CDC CERC, "Be Right" (reviewed for the core protocol).

**Declared professional judgement:** extending recall and service-incident rules to environmental incidents, workplace accidents and supply-chain disruption; the wording of all three triggers; the investigation question.

Full source review: `sources/reviews/incident-family-source-review.md`.

## What this protocol does not cover

- Sector recall regimes (food, drugs, vehicles, medical devices).
- Environmental and workplace-safety reporting duties to authorities.
- Whether any notification duty applies or was met. Counsel decides.
- Whether the facts are true. The tool checks the draft against the supplied context.
