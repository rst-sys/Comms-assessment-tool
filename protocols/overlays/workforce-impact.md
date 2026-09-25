---
id: workforce-impact
name: Workforce impact
layer: overlay
# rule: event in [layoffs, restructuring, site-closure] OR (event in [financial-difficulty, strategy-market-exit, merger-acquisition] AND audiences include an Employees option)
trigger: workforce-impact
version: 0.3.1
status: active
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  EU collective-redundancy and consultation directives and US WARN rules, which govern formal notices; applying their content to employee messages is professional judgement.
changelog:
  - "0.3.1 — basis notes moved into the file"
  - "0.3.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed."
  - "0.2.0 (2026-09-25): reconciled with workforce-reduction 1.0.0. Takes over its five law-related elements word for word (adding only \"where roles end\" / \"no roles are affected\" so they fit events where job loss isn't certain), four of its triggers and three of its questions. Adds EU and US law as sources, and four new triggers. Trigger narrowed: policy-change and labor-dispute no longer fire it."
  - "0.1.0 (2026-09-25): first draft from the geopolitical source review."

elements:
  - id: workforce-impact.decision-status
    name: Decision status
    means: Whether the decision is final, proposed, or in consultation.
    weight: core
    dimension: accountability_agency
    basis: law
    sources: [eu-directive-2002-14, eu-directive-98-59]
    basis_note: "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."

  - id: workforce-impact.scope-of-impact
    name: Scope of impact
    means: How many are affected, in which functions, sites and countries, or that the group is still being set, or plainly that no roles are affected.
    weight: core
    dimension: stakeholder_respect_impact
    basis: law
    sources: [eu-directive-98-59, us-warn-20-cfr-639]
    basis_note: "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."

  - id: workforce-impact.selection-basis-and-alternatives
    name: Selection basis and alternatives
    means: Where roles end, how roles or people were chosen, the group chosen from, and what was tried first — voluntary exit, redeployment, a hiring freeze.
    weight: core
    dimension: fairness_independence_conflicts
    basis: law
    sources: [eu-directive-98-59]
    basis_note: "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."

  - id: workforce-impact.individual-notice-timing-and-terms
    name: Individual notice, timing and terms
    means: Where roles end, how and when each affected person is told, with notice dates, last day and pay terms, or where those will be found and by when.
    weight: core
    dimension: stakeholder_respect_impact
    basis: law
    sources: [us-warn-20-cfr-639, eu-directive-98-59]
    basis_note: "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."

  - id: workforce-impact.voice-and-what-can-still-change
    name: Voice and what can still change
    means: What employees or their representatives can still influence, kept separate from what leadership has already decided.
    weight: core
    dimension: listening_employee_voice
    basis: law
    sources: [eu-directive-2002-14, eu-directive-98-59]
    basis_note: "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."

triggers:
  # Moved unchanged from workforce-reduction 1.0.0
  - check: The draft announces role eliminations or a headcount reduction and never says whether the decision is final, proposed, or subject to consultation.
    dimension: accountability_agency
    review: [HR, Labor]
  - check: The draft calls the decision final and also invites employee input, feedback or consultation, without saying what remains open to change.
    dimension: listening_employee_voice
    review: [HR, Labor]
  - check: The draft reaches a wider audience than the affected group without saying how or when affected people are told individually.
    dimension: stakeholder_respect_impact
    review: [HR]
  - check: The draft gives no notice date, last working day or date by which dates will come, no pay terms, and no place to find either.
    dimension: clarity_plain_language
    review: [HR, Labor]
  # New
  - check: The decision is attributed to a parent company, head office or group ("the group has decided", "as directed by our parent") and the draft doesn't say what the local organization decided or owns.
    dimension: accountability_agency
    review: [Legal, HR]
  - check: The draft gives less notice than planned or says the change takes effect immediately, and gives no reason for the shortened notice.
    dimension: causation_explanation
    review: [Legal, HR]
  - check: The draft withholds information on grounds of confidentiality without saying why or for how long.
    dimension: truthfulness_factual_discipline
    review: [Legal]
  - check: The draft says employees or representatives have been consulted, or that consultation is complete, while the supplied context shows it hasn't started or finished.
    dimension: truthfulness_factual_discipline
    review: [Legal, HR]

questions:
  # Moved unchanged from workforce-reduction 1.0.0
  - ask: Which entities, countries, states or agreements may require notice, consultation or a filing?
    review: [Legal, Labor, Local market]
  - ask: Has anyone reviewed whether the affected group is uneven across protected groups, and who?
    review: [HR, Legal]
  - ask: Were affected employees assessed for internal mobility or redeployment before selection?
    review: [HR]
  # New
  - ask: Does this draft match the formal notice given to employee representatives or authorities, and what they were told in writing?
    review: [HR, Legal]

---

## What this overlay does

It carries the checks every job-affecting decision needs, whatever the event: whether the decision is final, who is affected, how people were chosen, how and when each person hears, and what can still change. They were written for the workforce-reduction protocol and are moved here word for word, so they also apply to site closures, and to cost-cutting, market exits and mergers when employees are an audience.

## Source

The five elements were written as professional judgement and practitioner guidance in the workforce-reduction protocol (EEOC, US Department of Labor, Fair Work Ombudsman, CIPD). That protocol states that **nothing in it rests on EU collective-redundancy rules.** This overlay adds that basis:

- **Decision status; Voice and what can still change:** Directive 2002/14/EC, Article 4 (information and consultation "in particular where there is a threat to employment"); Directive 98/59/EC (consultation on collective redundancies). Geopolitical review 1.1, 1.2.
- **Scope of impact:** Directive 98/59/EC, Article 2(3): number and categories affected and the period. 20 CFR 639.7: job titles, numbers per classification, dates and schedule. Geopolitical review 1.2, 1.5.
- **Selection basis:** Directive 98/59/EC, Article 2(3): "the criteria proposed for the selection of the workers to be made redundant."
- **Individual notice, timing and terms:** 20 CFR 639.7 (dates and schedule); Directive 98/59/EC, Article 2(3) (method for calculating payments).
- **New triggers:** Directive 98/59/EC Art. 2(4) (parent-company decisions); 20 CFR 639.9 (reason for shortened notice); Directive 2002/14/EC Art. 6 and Directive (EU) 2025/2450 (reasons for confidentiality; applicable from 2029, article number unverified).

**These laws govern formal notices to representatives and authorities, not employee messages.** Applying their content to a message is professional judgement: an employee message that says less than the formal notice is a checkable gap. Label it that way in the Library.

The workforce-reduction protocol's guidance sources (EEOC, DOL, Fair Work, CIPD) were not re-read for this overlay and are not attached to individual elements here; they stay listed on that protocol.

## Limits

- Directive 98/59/EC read from the UK retained copy, Article 2 only.
- EU national transposition, US state mini-WARN laws and Directive 2009/38/EC (European Works Councils) were not reviewed.
- Labor-relations law during strikes and bargaining was not reviewed; the overlay does not fire for "Strike or labor dispute" or "Major policy change".
