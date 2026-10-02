---
id: merger-acquisition
name: Merger or acquisition
layer: event
family: commercial
version: 0.2.1
status: active
last_reviewed: 2026-09-28
review_by: 2027-03-28
rests_on: >-
  US and EU merger law requiring the companies to stay separate until a deal is cleared and closed, recent record enforcement, and SEC filing rules for deal communications.
changelog:
  - "0.2.1 (2026-10-02): opening description reworded in plain English; no check changed."
  - "0.2.0 (2026-09-28): after the duplicate check, Where the deal stands replaces the Workforce impact overlay's Decision status on merger drafts; the combined-company trigger narrows the core's Estimates marked as estimates; the coordination trigger moves to accountability and agency."
  - "0.1.0 (2026-09-28): first draft from the Merger or acquisition source review (gun jumping)."

elements:
  - id: merger-acquisition.still-separate
    name: Still two companies until closing
    means: Until the deal closes, the draft treats the companies as separate. It doesn't describe them as already combined, announce joint decisions, or tell employees, customers or suppliers to act as if they were. Describing plans for after closing, in the future tense, is fine.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [ftc-hsr-waiting-period, ftc-2025-gun-jumping, eu-merger-reg-139-2004-art7]
    basis_note: "US and EU merger law forbid implementing a deal before clearance, with record fines in 2018 and 2025. Applying this to message wording is professional judgement."
  - id: merger-acquisition.deal-status
    name: Where the deal stands
    means: The draft says whether the deal is signed or completed, which approvals it still needs (regulators, shareholders), when it is expected to close, and that it may not.
    weight: supporting
    dimension: truthfulness_factual_discipline
    basis: judgement
    sources: []
    replaces: [workforce-impact.decision-status]

triggers:
  - check: Before closing, the draft describes the companies as already one ("our combined company is", "we are now one team", "as a single company") or presents post-closing leaders, prices or product decisions as already in effect.
    dimension: truthfulness_factual_discipline
    narrows: core.estimates_as_estimates
    review: [Legal]
  - check: Before closing, the draft tells employees, customers or suppliers of either company to take instructions from, report to, or coordinate prices, customers or plans with the other.
    dimension: accountability_agency
    review: [Legal]

questions:
  - ask: Has antitrust counsel reviewed this draft for anything that could be read as combining, or acting together, before the deal closes?
    review: [Legal]
  - ask: If either company is SEC-registered, must this communication be filed on or before the date it is first used, and is that arranged?
    review: [Legal, Investor relations]
  - ask: Is every integration detail in this draft one that counsel has cleared for sharing before closing?
    review: [Legal]
---

## What this protocol is

Checks for announcements and memos about a merger, acquisition or sale, between signing and closing. It adds one thing the Commercial family doesn't cover: **gun jumping**, acting or communicating as if a deal has closed before the law allows. It adds to the Commercial family's checks (customers and suppliers, forecasts, employees in a deal) and doesn't replace any of them. On merger messages to employees, its check on where the deal stands is used instead of the Workforce impact overlay's 'Decision status': for a deal, the decision is only as final as the deal.

## Source

**Binding law, as stated by the regulators:** the Hart-Scott-Rodino Act waiting period (US Federal Trade Commission); the EU Merger Regulation, Article 7(1) (European Commission); SEC Rule 425.

**Enforcement:** FTC, January 2025 ($5.6 million, a record US gun-jumping penalty); European Commission, Altice/PT Portugal (€124.5 million, 2018), upheld by the Court of Justice in Case C-746/21 P (2023), read through a law firm's report.

**Practitioner analysis:** Liebeskind (2003), American Bar Association presentation.

**Declared professional judgement:** applying the law to message wording; *Where the deal stands*; the wording of both triggers.

Full source review: `sources/reviews/merger-acquisition-source-review.md`.

## Basis

The law is clear, binding and recently enforced at record levels on both sides of the Atlantic. What the law governs is *conduct*: implementing a deal early. Messages are relevant as evidence of that conduct and as instructions that are themselves conduct. No source sets rules for what a deal announcement must say; applying the law to message content is professional judgement, informed by a practitioner analysis and the facts of enforced cases.

## What this protocol does not cover

- Whether a deal needs approval, and what integration planning is allowed: counsel decides.
- Information exchange between the companies: conduct, not message content.
- Messages after closing: once the deal has closed, the companies can speak as one.
