---
id: apology
name: Public apology
layer: overlay
trigger: apology
version: 1.0.1
status: active
last_reviewed: 2026-09-25
review_by: null
changelog:
  - "1.0.1 — Evidence labels added; no check changed."
  - "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
rests_on: >-
  One 2016 study of 755 people, known here through a press account, plus the tool author's own standard.

elements:
  - id: apology.acknowledged-responsibility
    name: Acknowledged responsibility
    means: The organization or a named leader says it is responsible for the conduct, decision or failure — not merely that the outcome is regrettable.
    weight: core
    dimension: accountability_agency
    basis: research
    sources: [lewicki-2016-effective-apologies, sciencedaily-2016-six-elements]
    basis_note: "The most important of six apology elements in one 2016 study of 755 people, known here through a press account."

  - id: apology.repair-offered
    name: Repair offered
    means: A remedy for the people affected — restitution, correction, recall, support or access — proportionate to the harm.
    weight: core
    dimension: corrective_action_proof
    basis: research
    sources: [lewicki-2016-effective-apologies, sciencedaily-2016-six-elements]
    basis_note: "The second most important element in the same study, known through a press account."

  - id: apology.direct-regret
    name: Direct regret
    means: An unconditional apology for the organization's own conduct, not conditional on how anyone reacted.
    weight: core
    dimension: stakeholder_respect_impact
    basis: judgement
    sources: []
    basis_note: "Regret is one of six apology elements in a 2016 study, but requiring it to be unconditional is the tool's own standard."

  - id: apology.conduct-rejected
    name: Conduct rejected
    means: The draft says the conduct was wrong, not only that the reaction was unfortunate.
    weight: supporting
    dimension: accountability_agency
    basis: judgement
    sources: []
    basis_note: "Close to the study's \u201cdeclaration of repentance\u201d, but not the same thing."

  - id: apology.restraint-in-the-ask
    name: Restraint in the ask
    means: The draft does not demand forgiveness, understanding or moving on, and does not ask before repair is stated.
    weight: supporting
    dimension: fairness_independence_conflicts
    basis: judgement
    sources: []
    basis_note: "A 2016 study found asking for forgiveness added least to an apology; treating a demand for it as a fault is the tool's own standard."

triggers:
  - check: No sentence says the organization or a named leader is responsible. The draft offers only regret, sympathy or concern.
    dimension: accountability_agency
    review: [Legal]

  - check: The only apology sentence is conditional on the audience's reaction — "if", "to anyone who felt", "that concerns were raised".
    dimension: stakeholder_respect_impact
    review: [Legal]

  - check: The cause is placed on an individual employee, a vendor, a miscommunication or the audience's reaction, and the draft does not state the organization's own supervisory or control role.
    dimension: fairness_independence_conflicts
    review: [Legal, HR]

  - check: The draft describes harm to identifiable people and offers neither a repair nor any corrective action.
    dimension: corrective_action_proof
    review: [Executive]

  - check: The draft, or the context supplied with it, describes knowledge, intent, concealment or deliberate choice, and the draft calls it a mistake, error, oversight or miscommunication.
    dimension: truthfulness_factual_discipline
    review: [Legal]

questions:
  - ask: Who approved the decision or conduct being apologized for, and does the draft say so?
  - ask: Is the repair proportionate to the harm, and does the named owner have authority to commit to it?
    review: [Executive]
  - ask: Does the draft blame a person or vendor who has not been told or given a chance to respond?
    review: [HR, Legal]
  - ask: Does any statement of responsibility carry legal consequences counsel should review before publication?
    review: [Legal]

---

## 3. Source

- **Published research (Acknowledged responsibility and Repair offered only):** Lewicki, R. J., Polin, B., & Lount, R. B. (2016). "An Exploration of the Structure of Effective Apologies." *Negotiation and Conflict Management Research*, 9(2), 177–196. doi:10.1111/ncmr.12073. https://onlinelibrary.wiley.com/doi/abs/10.1111/ncmr.12073
- **Secondary account, read in full:** Ohio State University (written by Jeff Grabmeier), "Six elements of an effective apology, according to science," ScienceDaily, 12 April 2016. https://www.sciencedaily.com/releases/2016/04/160412091111.htm
- **Not read:** the article itself, which is paywalled. Study details in this protocol come from the press account, which quotes the lead author.
- **Professional judgment (everything else):** the 12-standard audit key supplied by the tool's author. It has no published source.

## 4. Basis

Two experiments with 755 participants: 333 online adults and 422 undergraduates. Each read a scenario in which a job candidate apologizes for an incorrect tax return. They then rated the apology on effectiveness, credibility and adequacy, from 1 to 5. Apologies contained between one and six components. Study 1 told participants which components were present, and Study 2 showed them actual statements. The evidence covers written apologies by an individual to an individual, judged by hypothetical readers. It did not test organizations, public audiences or real trust outcomes.

## Drafting notes: elements considered (not applied)

The checks the tool applies are the ones listed on this card.
Importance labels: Core, Supporting, Minor. "Research" means Lewicki et al. supports the ranking. "Judgment" means it rests on the audit key.

| Element | What it means | Importance | Dimensions |
|---|---|---|---|
| Acknowledged responsibility | The organization or a named leader says it is responsible for the conduct, decision or failure. | Core (research) | accountability_agency, fairness_independence_conflicts |
| Repair offered | A remedy for the people affected, such as restitution, correction, recall, support or access. | Core (research) | corrective_action_proof, stakeholder_respect_impact |
| Offense named | The conduct, decision, product or omission is identified in ordinary words a reader new to the story can follow. | Core (judgment) | accountability_agency, clarity_plain_language |
| Organizational agency | The organization's own role in making, approving, enabling or failing to prevent the conduct is stated, not left in passive or abstract wording. | Core (judgment) | accountability_agency |
| Impact recognized | The affected groups and the concrete harm to them are named before the organization's own discomfort. | Core (judgment) | stakeholder_respect_impact |
| System change | Operational, policy, governance, staffing or oversight changes that address why the failure could happen. | Core (judgment) | future_readiness_learning, corrective_action_proof |
| Owner and follow-up | A named role or body owns the work, with a date or an external standard by which progress can be checked. | Core (judgment) | verification_follow_through, accountability_agency |
| Explanation | A brief, fact-grounded account of how the failure happened. It separates confirmed facts from what is still under investigation, and it explains rather than excuses. | Supporting (research: tied third) | causation_explanation, truthfulness_factual_discipline |
| Direct regret | An unconditional statement of apology for the organization's own conduct. | Supporting (research: tied third) | stakeholder_respect_impact, clarity_plain_language |
| Conduct rejected | The draft says the conduct was wrong, not only that the reaction was unfortunate. | Supporting (research: tied third) | accountability_agency, future_readiness_learning |
| Timely care information | If people are still at risk, the draft tells them what to do and whom to contact, and says what is confirmed now. | Supporting (judgment) | stakeholder_respect_impact, clarity_plain_language |
| Restraint in the ask | The draft does not demand forgiveness, understanding or moving on. | Minor (research: forgiveness ranked lowest) | fairness_independence_conflicts, stakeholder_respect_impact |

The rankings marked "research" rest on the Lewicki study, but the study did not test corporate apologies. Treat "Core (research)" as the best available evidence, not as proof for this setting. The tie between regret, explanation and repentance means the protocol should not raise a finding because one of the three is stronger than another.

## Drafting notes: triggers considered (not applied)

The checks the tool applies are the ones listed on this card.
**Watchlist.** Treat these as prompts in addition to the vague-action list: "mistakes were made", "we regret that this happened", "sorry if", "any inconvenience", "the situation", "recent events", "the incident", "the content was posted", "not who we are", "never our intention", "we hear your concerns", "we are conducting a review", "we take this seriously", "we ask for your understanding", "committed to doing better". A watchlist term alone is not a finding. Raise one only when the term stands in place of an element from Section 5.

Raise a High-severity finding when any of these is true:

- No sentence says the organization or a named leader is responsible for the conduct, decision or failure. The draft offers only regret, sympathy or concern. *(accountability_agency; Legal)*
- The draft never says what the conduct or failure was. The only references are "the situation", "the incident", "mistakes" or similar. *(accountability_agency, clarity_plain_language)*
- The cause is placed only on an individual employee, a vendor, a miscommunication, circumstances or the audience's reaction, and the draft does not state the organization's own supervisory or control role. *(accountability_agency, fairness_independence_conflicts; Legal, plus HR if an employee is named)*
- The only apology sentence is conditional on the audience's reaction, for example "if", "to anyone who felt", or "that concerns were raised". *(stakeholder_respect_impact; Legal)*
- The draft names no affected group and no concrete harm. Alternatively, it states that no one was harmed with no stated basis. *(stakeholder_respect_impact; add Privacy or Information security where data is involved, and HR or Labor where employees are affected)*
- The draft describes harm to identifiable people and offers neither a repair nor any corrective action. *(corrective_action_proof; Executive)*
- The only forward commitment is a review, an investigation, training or "doing better", and it has no named owner and no date. *(corrective_action_proof, verification_follow_through; Executive)*
- The draft, or context the author supplied, describes knowledge, intent, concealment or deliberate choice, and the draft calls it a mistake, error, oversight or miscommunication. *(truthfulness_factual_discipline, accountability_agency; Legal.)* This trigger rests on professional judgment, not on the study. The study found the components worked the same for competence and integrity failures, so do not cite research for it.
- The draft describes an ongoing risk to people (safety, money, data, access) and gives them no action to take or contact to use. *(stakeholder_respect_impact, clarity_plain_language; Privacy or Information security where data is involved)*

**Raise Moderate when:**

- Explanation comes before the first statement of responsibility.
- The explanation names external context, third parties or audience misreading and names no internal decision or control.
- The only apology is conditional but responsibility is stated elsewhere.
- Values language stands in for a statement that the conduct was wrong.
- The draft asks for understanding or patience before any repair is stated.
- The impact passage leads with reputation, criticism or intent before the affected group.
- An owner is named by department only, or a follow-up has no date.
- Facts are still developing and the draft does not separate confirmed from unconfirmed or give an update date.

**Raise Low when** the draft requests forgiveness after repair has been stated.

## Drafting notes: questions considered (not applied)

The checks the tool applies are the ones listed on this card.
Always include these:

- Who approved the decision or conduct being apologized for, and does the draft say so?
- Who is affected, and have they been told directly before or at the same time as the public release?
- Is the repair proportionate to the harm, and does the named owner have authority to commit to it? *(Executive)*
- Which statements in the draft are confirmed today, and which are still under investigation? When is the next update?
- Does the draft blame a person or vendor who has not been told or given a chance to respond? *(HR, Legal)*
- Does any statement of responsibility carry legal consequences that counsel should review before publication? *(Legal)*
- Do notification, disclosure or consultation obligations apply in the markets where people are affected? These may apply, and counsel must confirm. *(Legal, Privacy, Information security, Investor relations, Local market, or HR and Labor, depending on the case)*

## 8. What this protocol does not cover

- **It cannot judge sincerity or whether the apology will land.** It reads for the presence of information, not for feeling.
- **It cannot verify facts.** It can see whether the draft separates confirmed from unconfirmed, not whether the confirmed statements are true.
- **It cannot see timing.** Timeliness can only be checked against dates and care information the draft itself states.
- **It makes no legal call.** It never says a draft is compliant or non-compliant. Whether an admission of responsibility creates liability is for counsel. The protocol never advises softening responsibility to manage that risk.
- **Its evidence base is thin.** Only the responsibility, repair and forgiveness rankings rest on a published study, known here through a press account. It used written hypothetical scenarios, student and online participants, and perceived effectiveness as the outcome. Everything else is one author's professional standard.
- **It does not adjust for the kind of failure.** The study found apologies were less accepted when the failure involved integrity, and component value did not change. The protocol applies the same checks either way. Whether a deliberate breach needs consequences or independent review is for a human to decide, because the draft cannot show it.
- **Two dimensions get little coverage.** listening_employee_voice has no element here, because nothing in the supplied material supports one. fairness_independence_conflicts is checked only through blame-shifting and the ask.
