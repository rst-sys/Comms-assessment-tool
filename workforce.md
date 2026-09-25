---
id: workforce
name: Workforce and organization change
layer: family
version: 0.2.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  EU working-conditions and consultation directives, the US National Labor Relations Act and EEOC disability guidance, applied to workforce messages; where they don't reach, professional judgement.
changelog:
  - "0.2.0 (2026-09-25): refined after a dry run on two return-to-office memos. Exempt-groups check no longer penalizes silence about leadership (moved to a question); new trigger for a generic talk-to-your-manager route."
  - "0.1.0 (2026-09-25): first draft from the Workforce family source review."

elements:
  - id: workforce.what-changes-and-when
    name: What changes, and from when
    means: The draft says what exactly changes in employees' terms or working conditions, compared with today, and the date it takes effect.
    weight: core
    dimension: stakeholder_respect_impact
    basis: law
    sources: [eu-directive-2019-1152]
    basis_note: EU law requires each worker to be told in writing of such a change by the day it takes effect; applying that to a group message, and outside the EU, is professional judgement.
  - id: workforce.who-it-applies-to
    name: Who it applies to, and who is exempt
    means: The draft says which employees the change applies to, names any group that is exempt, and says why.
    weight: core
    dimension: fairness_independence_conflicts
    basis: judgement
    sources: []
  - id: workforce.route-for-individual-circumstances
    name: A route for individual circumstances
    means: The draft says how an employee whose circumstances the change affects differently (for example health, disability or caregiving) can raise them, and who decides.
    weight: supporting
    dimension: listening_employee_voice
    basis: guidance
    sources: [eeoc-reasonable-accommodation-2002]
    basis_note: US disability guidance treats changing a workplace policy as a possible accommodation, requested in plain words; extending it to other circumstances is professional judgement.
  - id: workforce.bargaining-and-consultation
    name: Bargaining and consultation status
    means: Where employees have a union or other representatives, the draft says whether the change has been or will be bargained over or consulted on, and what can still change.
    weight: core
    dimension: listening_employee_voice
    basis: law
    sources: [nlra-29-usc-158, nlrb-bargaining-good-faith, eu-directive-2002-14]
    basis_note: Binding where a union represents employees (US) or where EU consultation duties apply; the tool checks what the draft says, not whether the duty was met.

triggers:
  - check: The draft links a consequence (closing a site, losing benefits, harsher conditions) or a benefit to employees' support for a union, a strike or a bargaining position.
    dimension: fairness_independence_conflicts
    review: [Labor, Legal]
  - check: The draft announces a change to where or when people work, or to their pay or benefits, with no effective date, or as already in effect.
    dimension: stakeholder_respect_impact
    review: [HR, Labor]
  - check: The only route the draft offers for individual circumstances is a general "talk to your manager or HR", with nothing on what can be adjusted or who decides.
    dimension: listening_employee_voice
    review: [HR]

questions:
  - ask: Does this change apply to leadership too? If not, does the draft say so?
    review: [Executive, HR]
  - ask: Does this change reverse or alter anything employees were told before, and does the draft say so?
    review: [HR, Executive]
  - ask: If employees are represented by a union or works council, has the change been bargained or consulted on as required, and can the draft be read as announcing a done deal? Counsel must confirm which duties apply.
    review: [Labor, Legal]
---

## What this protocol is

The shared checks for every event in the Workforce family: layoffs, restructuring, site closures, major policy changes (such as return to office or benefits) and strikes or labor disputes. It matters most for policy changes and labor disputes, which have no event protocol.

Where the Workforce impact overlay also applies (layoffs, restructuring, site closures), its more specific elements replace this family's equivalents, so the same gap isn't checked twice:

- Workforce impact's *Individual notice, timing and terms* replaces *What changes, and from when*.
- Workforce impact's *Scope of impact* replaces *Who it applies to, and who is exempt*.
- Workforce impact's *Voice and what can still change* replaces *Bargaining and consultation status*.

*A route for individual circumstances* applies to every event in the family.

## Source

**Binding law, read in the parts cited:**

- Directive (EU) 2019/1152 on transparent and predictable working conditions, Articles 4(2) and 6. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32019L1152
- National Labor Relations Act, 29 U.S.C. § 158(c) and (d). https://www.law.cornell.edu/uscode/text/29/158
- Directive 2002/14/EC, Article 4(2)(c) (reviewed in the geopolitical source review).

**Regulator guidance, read:**

- NLRB, "Bargaining in good faith with employees' union representative (Section 8(d) & 8(a)(5))." https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/bargaining-in-good-faith-with-employees-union-representative
- NLRB, "Interfering with employee rights (Section 7 & 8(a)(1))." https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/interfering-with-employee-rights-section-7-8a1
- US EEOC, *Enforcement Guidance on Reasonable Accommodation and Undue Hardship under the ADA* (2002). https://www.eeoc.gov/laws/guidance/enforcement-guidance-reasonable-accommodation-and-undue-hardship-under-ada

**Research:** Topa et al. (2022) on psychological-contract breach, behind the question on earlier commitments.

**Declared professional judgement:** *Who it applies to, and who is exempt*; the wording of all three triggers; applying individual-notice and accommodation rules to group messages.

Full source review: `sources/reviews/workforce-family-source-review.md`.

## What this protocol does not cover

- Whether a duty to bargain or consult applies, or was met. Counsel decides.
- US state law and EU national rules, including works-council co-determination.
- The rules on strikers and replacements. A Strike or labor dispute event protocol would need its own review.
- Whether the policy itself is wise. The tool checks the message, not the decision.
