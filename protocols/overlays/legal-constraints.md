---
id: legal-constraints
name: Legal constraints
layer: overlay
trigger: legal-constraints
version: 0.1.1
status: active
last_reviewed: 2026-09-29
review_by: 2027-03-29
rests_on: >-
  US evidence rules on remedial measures and offers to pay, state apology laws, and research on apologies and settlement; the rest is declared professional judgement.
instruction: >-
  Legal constraints apply. Where a fix would need an admission the stated limit rules out, offer instead a plain declaration of the limit, an expression of sympathy or regret, or what is being done, and refer the question to counsel. Never say a statement is legally safe.
changelog:
  - "0.1.1 (2026-09-29): Constraint declared, not hidden gives way to the CEO departure protocol's \"Reason, or declared withholding of it\" when both apply; wording unchanged."
  - "0.1.0 (2026-09-29): first draft from the Legal constraints source review; owner's six design decisions of 29 September 2026."

elements:
  - id: legal-constraints.declared
    name: Constraint declared, not hidden
    means: The draft says plainly, without legal jargon, that there is something it can't discuss yet, and when it may say more (a date, or an event such as the end of an inspection). It doesn't fill the gap with a stock phrase or imply there is nothing more to say.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: judgement
    sources: []
    superseded_by: ceo-departure.reason-or-declared-withholding-of-it
  - id: legal-constraints.limit-scope
    name: The limit covers only what it has to
    means: The draft accepts responsibility as far as the stated limit allows. Where the limit rules that out, it still expresses sympathy or regret for what happened, says what is being done, and offers practical help. It doesn't use the limit to withhold more than it covers.
    weight: core
    dimension: accountability_agency
    basis: research
    sources: [robbennolt-2003-apologies, fre-407, fre-409]
    basis_note: "One experiment found full apologies helped settlement and sympathy alone raised uncertainty. US federal rules keep remedial steps and offers to pay medical costs out as proof of liability. Applied to a message as judgement."

triggers:
  - check: A stock legal phrase ("we cannot comment on pending litigation", "on the advice of counsel") is the whole response, with no sympathy, action or help beside it.
    dimension: accountability_agency
    review: [Legal]

questions:
  - ask: "Counsel: which of these can the message include — sympathy or regret, the steps being taken, offers of help — and does any state apology law or evidence rule apply here?"
    review: [Legal]
  - ask: Does the limit described in the context match what counsel actually advised, and until when does it apply?
    review: [Legal, Executive]
---

## What this overlay is

Switched on when the writer ticks "Counsel has limited what this message can say", on any event. It treats a limit counsel has declared as a constraint, not as evasion, while still asking the draft to say everything it can. The writer describes the limit in "Anything else we should know?".

With the box ticked, the Apology overlay's "Acknowledged responsibility" and the Crisis in progress overlay's "A response that fits responsibility" give way to this overlay's second check, which asks for responsibility as far as the stated limit allows. Apology's other checks (direct regret, repair offered) still apply. Ticking the box doesn't lower any other check.

The instruction line applies to fixes from every layer: where a fix would need an admission the limit rules out, the review offers an alternative and refers the point to counsel.

It doesn't repeat what others check: facts known and not yet known (core protocol), remedies (Incident family), support for those harmed (People harmed overlay), apology wording (Apology overlay), or declared withholding of a departure's reason (CEO departure protocol).

## Source

**Law (US):** Federal Rule of Evidence 407 (subsequent remedial measures) and 409 (offers to pay medical and similar expenses), with Advisory Committee notes; California Evidence Code § 1160(a), as one example of a general apology law.

**Research:** Robbennolt (2003), *Michigan Law Review* 102(3) (abstract); Ho & Liu (2011), *Journal of Risk and Uncertainty* 43(2) (abstract).

**Declared professional judgement:** the first check; applying evidence rules and settlement research to the content of a public or internal message; the wording of the trigger.

Full source review: `sources/reviews/legal-constraints-source-review.md`.

## What this overlay does not cover

- Whether anything in the draft is legally safe. The tool never says so; counsel decides.
- Whether the limit counsel set is right or broader than the law requires. The counsel question raises it; it isn't judged.
- State evidence rules, apology laws beyond California's, or EU and member-state rules. Not reviewed.
- How regulators, as opposed to courts, treat apologies and remedial statements.
