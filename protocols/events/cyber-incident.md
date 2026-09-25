---
id: cyber-incident
name: Cyber incident and data breach
layer: event
family: incident
version: 1.1.1
status: active
last_reviewed: 2026-09-25
review_by: null
changelog:
  - "1.1.1 — Evidence labels added; no check changed."
  - "1.1.0 — the categorical-outcome trigger now narrows core.estimates_as_estimates, and support matched to harm replaces the people-harmed overlay's general support element. No check reworded."
  - "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
rests_on: >-
  US regulator guidance — NIST, the SEC, HHS and the FTC — plus professional judgment. None of it measures which notices work better.

elements:
  - id: cyber-incident.what-and-when
    name: What and when
    means: The draft gives the discovery date, the incident period if known, and time zones.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

  - id: cyber-incident.nature-of-exposure
    name: Nature of exposure
    means: The draft says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined, and names the data categories involved.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

  - id: cyber-incident.present-response
    name: Present response
    means: The draft describes what is being done now, specific enough to check, including containment and who is investigating.
    weight: core
    dimension: corrective_action_proof
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

  - id: cyber-incident.support-matched-to-harm
    name: Support matched to harm
    means: Any support offered fits the data involved, with its terms, its duration and how to claim it.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    replaces: [people-harmed.support]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

  - id: cyber-incident.authenticity
    name: Authenticity
    means: The draft tells recipients how to confirm the notice is genuine, and how the organization will and will not contact them.
    weight: supporting
    dimension: verification_follow_through
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

  - id: cyber-incident.attribution-discipline
    name: Attribution discipline
    means: Any claim about who was responsible, or that a vendor was at fault, carries a stated basis and does not displace the organization's own role.
    weight: core
    dimension: fairness_independence_conflicts
    basis: judgement
    sources: [nist-sp-800-61r3, sec-cyber-small-entity-guide, hhs-breach-notification-rule, ftc-data-breach-response]
    basis_note: "Informed by US regulator guidance; none of it measures which notices work better."

triggers:
  - check: The draft states a categorical outcome — no data was compromised, the incident is contained, systems are secure — while also saying the investigation is ongoing, or with no basis given.
    dimension: truthfulness_factual_discipline
    review: [Information security, Legal]
    narrows: core.estimates_as_estimates

  - check: The draft says data was involved but does not name the categories, and does not say the categories are not yet known.
    dimension: truthfulness_factual_discipline
    review: [Privacy, Legal]

  - check: The draft attributes the incident to a named attacker, a nation-state, a sophisticated actor, or a vendor, with no stated basis; or attributes it to a vendor without stating the organization's own selection, oversight or data-sharing role.
    dimension: fairness_independence_conflicts
    review: [Information security]

  - check: The draft states that notification is or is not legally required, or that the organization is compliant with applicable laws.
    dimension: truthfulness_factual_discipline
    review: [Legal, Privacy]

  - check: The draft gives affected people no way to confirm the notice is genuine, in a message that asks them to act, click or call.
    dimension: verification_follow_through

  - check: An investor communication states that the incident is or is not material, or gives an impact figure, without saying who determined it and when.
    dimension: truthfulness_factual_discipline
    review: [Investor relations, Legal]

questions:
  - ask: Which state, national, sector, contract and cross-border notification duties may apply, and what is the earliest deadline?
    review: [Legal, Privacy]
  - ask: Has law enforcement asked for a delay, and does the law allow one here?
    review: [Legal]
  - ask: Does publishing this change containment, evidence preservation or the investigation?
    review: [Information security]
  - ask: Does the support offered match the data actually involved?
  - ask: Do the website, customer letter, call-center script, employee talking points and regulator notice agree on facts, dates and scope?
  - ask: If employees are affected, have they been told before external release?
    review: [HR]

---

## 3. Source
Professional judgment, informed by the following. Each was read as a fetched summary, not full text.

- Nelson, A., Rekhi, S., Souppaya, M., Scarfone, K. *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile* (NIST SP 800-61r3). NIST, April 2025. https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf
- U.S. Securities and Exchange Commission. *Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure: Small Entity Compliance Guide* (Form 8-K Item 1.05). August 2023. https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/cybersecurity-risk-management-strategy-governance-incident-disclosure
- U.S. Department of Health and Human Services. *Breach Notification Rule*, 45 CFR §§ 164.400–414. https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html
- Federal Trade Commission. *Data Breach Response: A Guide for Business*. August 2023, updated June 2025. https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business

The distinction between confirmed fact, current assessment, unknown and commitment, and the list of over-assurance phrases, come from a research brief supplied by the tool's owner. They are professional judgment, not a published standard.

Not cited because not read: the CISA/FBI "Communicating Under Pressure" guidance (retrieval returned a 403; by the owner's description it covers IT/OT service outages, not data breaches), ISO/IEC 27035, and NIST CSF 2.0.

## 4. Basis
NIST SP 800-61r3 is a federal technical guidance document. It sets recommendations, not binding rules. The SEC rule and the HIPAA rule are binding regulation, applying only to SEC registrants and HIPAA covered entities or business associates respectively. The FTC guide is regulator business guidance and is not binding. None of these was produced from an empirical study of which notices work better. Those judgments are consensus, not measured effect.

## Drafting notes: elements considered (not applied)

The checks the tool applies are the ones listed on this card.
| Element | What it means | Importance | Dimensions |
|---|---|---|---|
| Claim status | Each material claim is marked, by wording or structure, as confirmed, assessed, unknown, or a commitment. | Essential | truthfulness_factual_discipline |
| What and when | It gives the discovery date, the incident period if known, and time zones. | Essential | truthfulness_factual_discipline, clarity_plain_language |
| Who and what is affected | It names the affected groups, systems, services and specific data categories, or says these are not yet known. | Essential | stakeholder_respect_impact |
| Nature of exposure | It says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined. | High | truthfulness_factual_discipline |
| Reader action | It gives a concrete action for the reader, or says none is needed now. | Essential | stakeholder_respect_impact, clarity_plain_language |
| Decision and owner | It names who decided what, such as the notification, the timing, and public statements, and who owns the response and questions. | High | accountability_agency |
| Cause and own exposure | It separates the attacker's actions from the organization's own control gaps, without claiming a cause it cannot support. | High | causation_explanation, fairness_independence_conflicts |
| Present response | It describes what is being done now, specific enough to check. | High | corrective_action_proof |
| Support matched to harm | Any support offered fits the data involved, with terms, duration and how to claim it. | Medium | stakeholder_respect_impact, corrective_action_proof |
| Update commitment | It gives a next update time or cadence and one place where updates appear. | High | verification_follow_through |
| Authenticity | It tells recipients how to confirm the notice is real and how the organization will and won't contact them. | Medium | verification_follow_through, clarity_plain_language |
| Reporting channel | It gives a way for affected people to report problems or ask questions, with hours. | Medium | listening_employee_voice |
| Post-incident account | It commits to a review of what failed, names who owns it and when it will be reported, and says whether it is independent. | Medium | future_readiness_learning, verification_follow_through |
| Cross-audience consistency | Facts, dates and scope agree with any other communications supplied for the same incident. | High | truthfulness_factual_discipline, accountability_agency |

## Drafting notes: triggers considered (not applied)

The checks the tool applies are the ones listed on this card.
Raise a High-severity finding when any of these is true:

- The draft states a categorical outcome ("no data was compromised", "the incident is contained", "systems are secure", or similar) while also saying the investigation is ongoing, or gives no basis for the claim.
- The draft uses "no evidence of misuse", "out of an abundance of caution" or "we take security seriously" in place of stating what was exposed and what is being done.
- The draft says data was involved but does not name the categories, and does not say they are not yet known.
- The draft is addressed to affected individuals and gives neither an action nor a statement that no action is currently needed.
- The draft does not say who is affected (customers, employees, partners, patients or another group).
- The draft gives no discovery date, or gives dates that conflict with each other or with supplied related communications.
- A holding statement or ongoing-incident update gives no next update time or cadence and names no place where updates will appear.
- The draft attributes the incident to a named attacker, a nation-state, or a "sophisticated" actor, or to a vendor or third party, and gives no stated basis.
- The draft attributes the incident to a vendor and does not state the organization's own role, such as its selection, oversight or data-sharing decisions.
- The draft states that notification is or is not legally required, or that it is "compliant with all applicable laws", with no acknowledgement that counsel has confirmed it. Never accept such a statement as a finding of compliance.
- The draft names no owner for the response, no decision-maker, and no contact for questions.
- The draft gives affected people no way to confirm the notice is genuine (a verified site, the organization's stated contact method, or how the organization will and will not contact them).
- An Investor communication states that the incident is or is not material, or gives an impact figure, and says nothing about who made the determination or when.
- The draft describes support as protecting people ("monitoring will keep you safe") without saying what it covers and for how long.

Set specialist_review_needed to true on the following findings:

- **Legal and Privacy:** the legal-conclusion finding, any finding about notification content or timing, and any finding about data categories.
- **Investor relations and Legal:** the materiality finding.
- **Information security:** any finding about attribution, containment claims, or the nature of exposure.
- **HR or Labor:** any finding where the affected group is employees.
- **Local market:** any finding where affected people are in more than one country.

## Drafting notes: questions considered (not applied)

The checks the tool applies are the ones listed on this card.
Always include these:

- What is confirmed, and who owns each confirmed fact? (Information security)
- Which statements in the draft are assessments or unknowns rather than confirmed facts?
- Which state, national, sector, contract and cross-border notification duties may apply, and what is the earliest deadline? Counsel must confirm; the review does not state whether any obligation applies. (Legal, Privacy)
- Has law enforcement asked for a delay, and does the law allow one in this case? (Legal)
- For a public company: who made the materiality determination, when, and how does the draft agree with the filing? (Investor relations, Legal)
- Do the website, customer letter, call-center script, employee talking points, regulator notice and executive statement agree on facts, dates and scope?
- Does publishing this change containment, evidence preservation or an investigation? (Information security)
- Who owns the next update, and can the organization meet the time it names?
- What did the organization's own decisions or controls contribute, separate from the attacker's actions?
- Does the support offered match the data involved?
- Have language, accessibility and technology needs been considered for the affected people?
- Who owns the post-incident account, and will any part of it be independent?
- If employees are affected: have they been told before external release? (HR, Labor)

## 8. What this protocol does not cover

- **Speed of notice.** The draft shows whether dates are stated, not whether the organization was fast. Timeliness has no dimension among the ten, so the protocol cannot score it. A human must judge it against the earliest applicable deadline.
- **Operational preparedness.** Out-of-band channels, tabletop exercises, and named incident roles before an incident are outside what a draft reveals.
- **Legal conclusions.** It cannot say whether a notice is required, adequate or compliant. State and country laws, GDPR, sector rules and contracts are not covered here, and the sources are U.S.-centered. Counsel decides.
- **Whether a claim is true.** It checks whether claims are supported in the text, not against the facts. Information security must verify them.
- **Materiality.** It flags a materiality claim without a stated determination. It cannot judge the determination.
- **Cross-audience consistency.** It can compare only what it is given.
- **Sources.** The evidence is guidance and consensus, not effectiveness studies. It assumes the four sources were correctly summarized and are current.
