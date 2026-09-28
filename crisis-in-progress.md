---
id: crisis-in-progress
name: Crisis in progress
layer: overlay
trigger: crisis-in-progress
version: 0.2.0
status: draft
last_reviewed: 2026-09-28
review_by: 2027-03-28
rests_on: >-
  Communicators' codes on correcting errors, research on repairing trust after evidence emerges, and the field's main crisis theory on matching the response to responsibility.
changelog:
  - "0.2.0 (2026-09-28): the responsibility check accepts, where the context shows counsel has limited admissions, a plain account of what the organization is doing to put things right without admitting fault; the denial-and-apology trigger no longer treats a declared legal constraint as denial."
  - "0.1.0 (2026-09-28): first draft from the Crisis in progress source review; replaces the unbuilt Stage overlay."

elements:
  - id: crisis-in-progress.what-has-changed
    name: What has changed since the last statement
    means: Where the supplied context shows an earlier statement, the draft says what is new since then and plainly corrects anything said earlier that is now known to be wrong or incomplete.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: code
    sources: [iabc-code-of-ethics, kim-2004, who-erc-2017]
    basis_note: "Communicators' codes require prompt correction of errors; one set of experiments found apology repairs trust better than denial once evidence of fault emerges. No study tests correcting a crisis statement."
  - id: crisis-in-progress.response-fits-responsibility
    name: A response that fits responsibility
    means: The response fits the organization's share of responsibility as the supplied context shows it. Where its own actions or failures caused the harm, the draft takes responsibility and says what it will do to put things right; where the context shows counsel has limited admissions, it says plainly what it is doing to put things right, without admitting fault. Either way, not only information or sympathy.
    weight: core
    dimension: accountability_agency
    basis: research
    sources: [coombs-2007, ma-zhan-2016]
    basis_note: "The field's main crisis theory recommends taking responsibility for preventable crises; its meta-analysis (known through a summary) found responsibility matters more than wording. A theory, not a measured effect."

triggers:
  - check: The draft both denies or minimizes the organization's responsibility and apologizes or offers compensation, so that each undercuts the other. Saying plainly that the organization can't comment on fault while legal matters are open is not a denial.
    dimension: accountability_agency
    review: [Legal]
  - check: The draft presents the organization mainly as a victim of the crisis ("we too have been let down", "an attack on our business") where the supplied context shows its own actions contributed.
    dimension: accountability_agency
  - check: The draft repeats a claim from an earlier statement that the supplied context shows is no longer accurate, or changes a figure from an earlier statement without saying it has changed.
    dimension: truthfulness_factual_discipline
    review: [Legal]

questions:
  - ask: Has anything said in earlier statements turned out to be wrong or incomplete, and is this draft the place to correct it?
    review: [Legal, Executive]
  - ask: Who saw the earlier statements (employees, customers, regulators, media), and will this update reach all of them?
    review: [Executive]
  - ask: If the organization's own actions caused this, has leadership agreed what it will do to put things right, and can the draft say so?
    review: [Executive, Legal]
---

## What this overlay is

Checks for any message sent while a crisis is still unfolding, whatever the event. It adds what single-message checks can't see: whether an update corrects what went before, and whether the response fits the organization's share of responsibility.

It doesn't repeat what others check: what is known and not yet known (core protocol), harm and support (People harmed overlay), remedies (Incident family), apology wording (Apology overlay), or what is alleged versus established (Allegations family).

Both checks depend on the "Anything else we should know?" box: the earlier statement, and the facts about what caused the crisis.

## Source

**Research:** Coombs (2007), *Corporate Reputation Review* 10(3); Ma & Zhan (2016), *Journal of Public Relations Research* 28(2), known through Chon, Kim & Tam (2022); Kim, Ferrin, Cooper & Dirks (2004).

**Professional codes:** IABC Code of Ethics ("I communicate accurate information and promptly correct any errors"); PRSA Code of Ethics.

**Guidance:** WHO (2017), recommendation A.2.

**Declared professional judgement:** applying these sources to a sequence of statements; the wording of all three triggers.

Full source review: `sources/reviews/crisis-in-progress-source-review.md`.

## What this overlay does not cover

- Whether the organization spoke quickly enough. That can't be judged from a draft.
- Whether a correction creates legal exposure. A reviewer question asks; counsel decides.
- The organization's share of responsibility, where the context doesn't show it.
- Whether an admission is legally safe. Where counsel has limited admissions, the overlay asks for a plain account of what is being done instead; it doesn't ask the draft to admit fault.
