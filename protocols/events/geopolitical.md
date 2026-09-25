---
id: geopolitical
name: Geopolitical event affecting operations or employee welfare
layer: event
family: external
version: 1.0.0
status: active
last_reviewed: 2026-09-25
review_by: null
changelog:
  - "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
rests_on: >-
  EU worker-information directives and US WARN, official guidance with no force of law, and three studies.

elements:
  - id: geopolitical.basis-for-speaking
    name: Basis for speaking
    means: The draft says what connects this organization to this event — its people, its sites, its supply, its obligations — rather than speaking because others are speaking.
    weight: core
    dimension: fairness_independence_conflicts
    basis: unclassified
    sources: []

  - id: geopolitical.discretion-inside-compliance
    name: Discretion inside compliance
    means: Where the organization was compelled by law, sanctions or government direction, and where it chose — whether to exit, when, on what terms, and what happens to local staff.
    weight: core
    dimension: accountability_agency
    basis: unclassified
    sources: []

  - id: geopolitical.exposure-separated-from-event
    name: Exposure separated from event
    means: What follows from the event itself and what follows from the organization's own prior positioning — where it sited operations, how concentrated its suppliers or staff are.
    weight: core
    dimension: causation_explanation
    basis: unclassified
    sources: []

  - id: geopolitical.danger-and-protective-steps
    name: Danger and protective steps
    means: For people in or near the affected area, the risk as currently assessed, the protective steps taken or planned, and who is responsible for them.
    weight: core
    dimension: corrective_action_proof
    basis: unclassified
    sources: []

  - id: geopolitical.status-of-open-decisions
    name: Status of open decisions
    means: What has been decided, what is under consideration, and what would cause the next decision to be made.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: unclassified
    sources: []

  - id: geopolitical.divided-workforce
    name: Divided workforce
    means: The draft is written for a workforce holding different relationships to the conflict, and is clear about what applies to everyone regardless of where they sit.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: unclassified
    sources: []

  - id: geopolitical.route-for-personal-circumstances
    name: Route for personal circumstances
    means: A way for affected staff to tell the organization facts about their own situation — location, family, travel, immigration status — that would change its response, and what happens to what they report.
    weight: supporting
    dimension: listening_employee_voice
    basis: unclassified
    sources: []

  - id: geopolitical.conditions-for-revisiting
    name: Conditions for revisiting
    means: What would cause this position or operational decision to change, and when it will next be reviewed.
    weight: supporting
    dimension: verification_follow_through
    basis: unclassified
    sources: []

triggers:
  - check: An operational change is attributed to the event itself — the conflict, the sanctions, the border closure — with no decision by the organization named alongside it.
    dimension: causation_explanation

  - check: The draft states that the organization is complying with sanctions, export controls or government direction and offers that as the whole account, naming no discretionary choice made around it.
    dimension: accountability_agency
    review: [Legal]

  - check: The decision is placed with a parent, headquarters or another jurisdiction and no accountable person or entity is named on the reader's side of the organization.
    dimension: accountability_agency
    review: [Legal, Labor]

  - check: The draft withholds information on grounds of confidentiality, legal advice or security without saying why it is withheld or for how long.
    dimension: truthfulness_factual_discipline
    review: [Legal]

  - check: The draft requires employees to attend a session, acknowledge receipt, or affirm the organization's position on the political matter.
    dimension: fairness_independence_conflicts
    review: [Legal, HR]

  - check: People are in or near a danger zone and the draft offers support resources — counselling, assistance lines, flexibility — but names no protective step, no owner for it, and nothing for those people to do.
    dimension: corrective_action_proof
    review: [HR, Legal]

questions:
  - ask: What gives this organization standing to address this event, and is that the reason being given to readers?
    review: [Executive]

  - ask: Has a decision already been taken — an exit, suspension, relocation or withdrawal — that this draft does not disclose?
    review: [Legal, Executive]

  - ask: Does what this says about the effect on employees match what the organization has told, or will tell, investors and regulators?
    review: [Investor relations, Legal]

  - ask: Is the reason given here the reason the decision was actually made?
    review: [Executive]

  - ask: Which statements here are true only as of today, and who corrects them when the situation moves?
    review: [Executive]

  - ask: Can this message lawfully and safely be read by staff inside the affected jurisdiction, and does anything in it expose them?
    review: [Legal, Local market, Information security]

narrows:
  - plain-naming
---

## Source

**Binding law, read in full or in the parts cited.**

- Council Directive 89/391/EEC on safety and health of workers at work, Articles 8, 10 and 11. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A31989L0391 — the employer must inform workers as soon as possible of serious and imminent danger *and of the steps taken or to be taken as regards protection*, must give all necessary information on risks and protective measures, and must consult in advance and in good time. This is the anchor for the danger-and-protective-steps element and for the trigger on support offered without protection.
- Council Directive 98/59/EC on collective redundancies, Article 2. Read from the UK retained copy at https://www.legislation.gov.uk/eudr/1998/59/article/2 because EUR-Lex repeatedly served a different document. Article 2(3) requires the reasons, numbers, period and *selection criteria* in writing. Article 2(4) provides that the obligation applies whether the decision was taken by the employer or by a controlling undertaking, and that ignorance of the parent's decision is no defense — the documentary basis for the trigger on attributing a decision upward. Articles 3 and 4 were not read.
- Directive 2002/14/EC establishing a general framework for informing and consulting employees, Articles 4 and 6. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32002L0014 — information and consultation on the undertaking's economic situation, on threats to employment, and on decisions likely to change work organization. Article 6 permits withholding where disclosure would seriously harm the undertaking, as an exception the employer must justify.
- Directive (EU) 2025/2450 amending the European Works Councils Directive, read as the Official Journal PDF at https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502450. It adds a duty to state the reasons for a confidentiality claim and its duration. **It does not apply until 2029**, and the article numbering returned by extraction was not independently confirmed. It is cited here as evidence that bare confidentiality claims were common enough to legislate against, not as a current obligation.
- 20 CFR 639.7 and 639.9 (WARN). https://www.ecfr.gov/current/title-20/chapter-V/part-639/section-639.7 and https://www.ecfr.gov/current/title-20/chapter-V/part-639/section-639.9 — a literal content specification for a notice, including a *named company official with a telephone number*, and, where notice is shortened under unforeseeable business circumstances, a brief statement of the reason for the reduction.
- California Labor Code § 1137, read via https://codes.findlaw.com/ca/labor-code/lab-sect-1137/ because the official bill page disallows automated fetching. It prohibits retaliation against an employee who declines to attend a meeting or receive communications about the employer's opinion on political matters. **Its current enforceability is unknown** — it was reported preliminarily enjoined in late 2025 by secondary sources only, which were not relied on. Comparable laws in other US states were not surveyed. The trigger on compelled attendance is framed as a drafting check, not as a statement of what the law requires.

**Official guidance, no force of law.**

- SEC Division of Corporation Finance, sample letter on disclosures pertaining to Russia's invasion of Ukraine, 3 May 2022. https://www.sec.gov/corpfin/sample-letter-companies-pertaining-to-ukraine. The letter carries an emphatic staff disclaimer — it "has no legal force or effect". It is used here only as the most detailed official articulation of what an organization should be able to account for after a geopolitical event, including the board's role in overseeing the risks *expressly including employees*. That is the basis for the question about consistency between the message and the filings.
- CISA, Shields Up guidance for corporate leaders and CEOs. https://www.cisa.gov/shields-guidance-corporate-leaders-and-ceos. Advisory; the page carried no visible date. It establishes facts that should exist, not message content, and says nothing about communicating with employees.

**Research.**

- Bamiatzi, Brieger, Karakulak, Kinderman and Manning (2024), "The rise of partisan CSR — corporate responses to the Russia–Ukraine war", *Journal of Business Ethics* 198, 263–291. https://link.springer.com/article/10.1007/s10551-024-05795-9. Read in abstract, method and findings. It documents peer imitation as a driver of corporate response, and an "opportunistically neutral" response type. This supports the basis-for-speaking element.
- Braga, Tardin, Grinstein and Perin (2026), "Corporate sociopolitical activism as a signal — a meta-analysis", *Journal of Business Research* 210, 116147. https://www.sciencedirect.com/science/article/pii/S0148296326001815. Employees respond least favorably of all stakeholder groups. Treated as a caution toward restraint and specificity, not as a specification.
- Hamelberg, de Ruyter, van Dolen and Konuş (2024), "Finding the right voice", *Journal of Public Policy and Marketing* 44(1). https://journals.sagepub.com/doi/10.1177/07439156241230910. Measures Twitter engagement, not credibility, and points the opposite way from the meta-analysis on CEO versus brand voice. **Nothing in this protocol rests on it.**

**Professional codes**, used only as background on character rather than content — the Page Principles (https://page.org/who-we-are/page-principles/), the PRSA Code of Ethics (undated in its own PDF, https://www.prsa.org/docs/default-source/about/ethics/prsa_code_of_ethics.pdf?sfvrsn=c9b66a6b_2) and the IABC Code of Ethics (undated, https://www.iabc.com/about/what-we-do/standards/code-of-ethics). SHRM's "Navigating International Crises" hub (https://www.shrm.org/topics-tools/topics/international-crisis) is the closest professional guidance to this event class and is the reason the protocol tests for support offered in place of an account — all five of its recommendations concern support and none asks the employer to state a decision.

**Not read, and therefore not relied on.** ISO 22361 clause 8, ISO 31030 and ISO 22301 are paywalled; only catalogue pages and a table of contents were seen, so no claim here rests on what those standards say. Coombs, *Ongoing Crisis Communication* (6th ed., 2021), was identified from the publisher page only. The Equinor In Amenas investigation report itself could not be opened — only the announcement page — so nothing is claimed about what it says regarding communication with employees or next of kin.

**Resting on professional judgment rather than a published source.** Four of the drafting checks come from the structure of the obligations above rather than from any document that catalogues them — the agentless-causation trigger, the compliance-framing trigger, the support-without-protection trigger, and the question about commercial reason versus stated reason. No source was found that catalogues evasions specific to this event class. That absence is itself part of the picture.

## Basis

The legal instruments bind Member States and covered US employers and are enforceable, but they are triggered by *consequences* — redundancy, physical danger, material effect on an issuer — not by the geopolitical event itself. An organization can communicate at length about a war, a coup, a sanctions regime or a border closure and touch none of them. For many drafts this protocol sees, none of the binding sources will apply, and the checks are then drafting discipline drawn from them by analogy rather than compliance tests.

The EU directives take effect through national transposition, which varies materially between Member States and was not examined. German, French, Dutch and Nordic works-council law in particular goes well beyond the directive floor.

The regulator guidance is explicitly not law, says so in its own text, and in the SEC's case is specific to one event in 2022 and has not been reissued or generalized.

The research is about the wrong outcome. The meta-analysis covers 88 studies and 501 effect sizes but reports an overall effect of r = 0.084 with heterogeneity of I² = 98.9%, across a construct — sociopolitical activism — much broader than geopolitical events. The Journal of Business Ethics paper is a qualitative coding of 140 firms with no outcome measurement and no counterfactual; it is a taxonomy, not evidence that anything works. The third study measures engagement on one platform among 608 experimental participants in one country. **No study was found that measures the effect of message content on employee trust after a geopolitical event.** The strongest research-derived claim available is negative — that employees are the least receptive audience for corporate stances — which argues for specificity and restraint rather than for any particular content.

So: the elements, triggers and questions here are assembled from adjacent legal obligations and from professional judgment. They are not validated against measured outcomes, and no source claims they are.

## What this protocol does not cover

It cannot tell you whether the organization should take a position on this event at all. No source distinguishes an event on which an employer has standing to speak from one on which it does not. The protocol can ask what the basis is; a human has to judge whether that basis holds.

It cannot judge a message it cannot compare to anything. The single strongest test available for this event class — whether the employee message says less about the impact on employees than the securities filing does — requires the filing, which the tool does not have. It is raised as a question for the author to settle, not scored.

It cannot judge the interval between decision and announcement, which is where most of the deception in this event class sits. No source establishes when an organization deliberating an exit, suspension or relocation must say so. The protocol asks; it cannot detect concealment from the draft alone.

It cannot judge accuracy that has decayed. Statements that were true when written go false as a geopolitical situation moves, and the professional codes address correction of *errors*, not of superseded truth.

It cannot decide which entity is accountable when the decision was made by a parent in another jurisdiction. Directive 98/59/EC forecloses upward attribution for redundancies only. For suspending operations, moving staff or changing a market position, no source establishes whether the local entity, the parent or a named executive is the party a message must identify. The protocol flags an unnamed accountable owner on the reader's side as a finding, and leaves the resolution to counsel and leadership.

It cannot resolve a message read simultaneously by staff on opposing sides of a conflict. Every source examined assumes a workforce with a single relationship to the event.

Two narrows apply. **On naming who decided**, the core check asks for a named decision-maker. In a cross-border group the deciding entity and the person a reader can hold to it may not be the same, and naming only the parent is itself the evasion Directive 98/59/EC Article 2(4) exists to close. This protocol therefore asks for both — the entity where the decision sat and an accountable owner reachable on the reader's side — and does not treat a named parent alone as satisfying the check. **On stating the central fact in ordinary words**, vagueness about a specific site, route, convoy or named individual may be a security decision taken to protect people, not evasion. Where the draft is specific about the decision and its owner but general about locations or individuals in a danger zone, that should not be read as euphemism. Generality about *what was decided* is not covered by this narrowing and remains a finding.

Nothing here is legal advice. Where an obligation may apply — collective redundancy information, health and safety information and consultation, works-council consultation, WARN notice content, sanctions and export control, employee data protection, or any restriction on compelling employees to receive political communications — counsel must confirm whether it applies and what it requires. Jurisdictions outside the EU and the US were not examined at all, including the jurisdiction where the event is actually happening, which is where staff are most exposed.
