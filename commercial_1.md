---
id: commercial
name: Commercial and financial decisions
layer: family
version: 0.2.0
status: draft
last_reviewed: 2026-09-26
review_by: 2027-03-26
rests_on: >-
  US rules on forecasts by listed companies, EU telecoms rules on contract changes and EU takeover rules on informing employees; each narrow, applied more widely as professional judgement.
changelog:
  - "0.2.0 (2026-09-26): after a dry run on two merger memos, the business-as-usual trigger no longer fires on statements limited to the period before closing (which are accurate), only when unlimited or used in place of saying what isn't known about jobs or service afterwards."
  - "0.1.0 (2026-09-26): first draft from the Commercial family source review."

narrows:
  - core.estimates_as_estimates

elements:
  - id: commercial.what-changes-for-customers
    name: What changes for customers and suppliers
    means: Where customers or suppliers are affected, the draft says what changes for them (price, terms, service, availability or contracts), from when, and what they can do, including cancelling or switching where they have that right.
    weight: core
    dimension: stakeholder_respect_impact
    basis: law
    sources: [eu-eecc-2018-1972]
    basis_note: "Binding for EU telecoms providers, which must give a month's notice and state the right to terminate; applied to other sectors as professional judgement."
  - id: commercial.forecasts-with-assumptions
    name: Forecasts with their assumptions
    means: Statements about future results, savings or synergies are presented as expectations and name the main assumptions or risks behind them.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [us-pslra-15-usc-78u-5]
    basis_note: "For US listed companies, cautionary statements are a condition of legal protection, not a duty; applied to all forecasts as professional judgement."
  - id: commercial.employees-in-a-deal
    name: What a deal means for employees
    means: For a merger, acquisition or sale, the draft says what the deal means for employees now, and what hasn't been decided.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: law
    sources: [eu-takeover-directive-2004-25]
    basis_note: "Binding for EU takeover bids, where boards must inform employees and give a view on employment; applied to other deals as professional judgement."

triggers:
  - check: The draft cites cost savings or synergies but doesn't say whether they involve job losses, where the supplied context shows they do.
    dimension: truthfulness_factual_discipline
    review: [HR, Investor relations]
  - check: The draft says "business as usual" or "nothing changes" for employees, customers or partners without limiting it to the period before the deal closes, or uses it in place of saying what isn't yet known about jobs or service after that.
    dimension: truthfulness_factual_discipline
    review: [Legal]

questions:
  - ask: Are the forecasts in this draft covered by a cautionary statement, and do they match what has been filed or told to investors?
    review: [Investor relations, Legal]
  - ask: Do customer contracts or local law require advance notice of this change, or give customers the right to cancel?
    review: [Legal]
---

## What this protocol is

The shared checks for every event in the Commercial family: mergers, acquisitions and sales; profit warnings; price increases or changes to terms; financial difficulty or cost-cutting; and changes of strategy or market exits. None of these events has its own protocol.

*Forecasts with their assumptions* is a sharper form of the core protocol's *Estimates marked as estimates*: where both fire, the tool raises one finding. Where the Workforce impact overlay also applies (a merger, cost-cutting or exit addressed to employees), its *Scope of impact* replaces *What a deal means for employees*.

## Source

**Binding law, read in the parts cited:**

- Private Securities Litigation Reform Act safe harbor, 15 U.S.C. § 78u-5. https://www.law.cornell.edu/uscode/text/15/78u-5
- Directive (EU) 2018/1972 (European Electronic Communications Code), Article 105(4), read from the UK retained copy. https://www.legislation.gov.uk/eudr/2018/1972/article/105
- Directive 2004/25/EC on takeover bids, Articles 6 and 9(5). https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=CELEX:32004L0025:EN:HTML

**Declared professional judgement:** applying each rule beyond its sector, deal type or jurisdiction; the wording of both triggers.

Full source review: `sources/reviews/commercial-family-source-review.md`.

## What this protocol does not cover

- Whether a filing or notice is required. The Listed company overlay asks; counsel decides.
- US consumer and subscription law, EU consumer law beyond telecoms, US merger communications rules, insolvency law.
- Whether the business decision is sound. The tool checks the message.
