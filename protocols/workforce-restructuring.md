---
id: workforce-restructuring
name: Workforce reduction and restructuring
layer: event
events:
  - Layoffs or job cuts
  - Restructuring or reorganization
  - Site, office or store closure
version: 1
status: active
rests_on: >-
  EEOC and US Labor Department guidance, Fair Work Australia and CIPD, plus three studies, none of them about wording.

elements:
  - name: Decision status
    means: Whether the decision is final, proposed, or in consultation.
    weight: core
    dimension: accountability_agency

  - name: Scope of impact
    means: How many are affected, in which functions, sites and countries, or that the group is still being set.
    weight: core
    dimension: stakeholder_respect_impact

  - name: Selection basis and alternatives
    means: How roles or people were chosen, the group chosen from, and what was tried first — voluntary exit, redeployment, a hiring freeze.
    weight: core
    dimension: fairness_independence_conflicts

  - name: Individual notice, timing and terms
    means: How and when each affected person is told, with notice dates, last day and pay terms, or where those will be found and by when.
    weight: core
    dimension: stakeholder_respect_impact

  - name: Support for those leaving
    means: Named support for people whose roles end, with a provider, owner and date.
    weight: core
    dimension: corrective_action_proof

  - name: The remaining workforce
    means: What work stops, moves or changes owner for the people who stay, and who decides.
    weight: supporting
    dimension: corrective_action_proof

  - name: Voice and what can still change
    means: What employees or their representatives can still influence, kept separate from what leadership has already decided.
    weight: core
    dimension: listening_employee_voice

  - name: Leadership exposure
    means: Whether leadership roles, pay or incentives are affected by the same decision.
    weight: supporting
    dimension: fairness_independence_conflicts

triggers:
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

  - check: >-
      The draft never says in plain terms that roles or employment end, reaching
      instead for rightsizing, workforce optimization, simplification, efficiency,
      synergies, realignment, organizational health, agile or leaner organization,
      fewer layers, streamlining, cost discipline, transition, impacted or exit.
    dimension: stakeholder_respect_impact

  - check: >-
      Employee feedback, an engagement survey or consultation is cited as a reason
      for the reduction without an explicit statement that leadership, not
      employees, made the decision.
    dimension: listening_employee_voice
    review: [HR]

questions:
  - ask: Which entities, countries, states or agreements may require notice, consultation or a filing?
    review: [Legal, Labor, Local market]
  - ask: Has anyone reviewed whether the affected group is uneven across protected groups, and who?
    review: [HR, Legal]
  - ask: What leadership decisions, incentives or governance conditions produced the structure being removed?
  - ask: Can you support any statement about future reductions or job security, and who approved it?
    review: [Executive]
  - ask: What can managers confirm today, what can they not, and where do their questions go?
    review: [HR]
  - ask: Were affected employees assessed for internal mobility or redeployment before selection?
    review: [HR]
---

## 3. Source

No single standard governs communication about workforce restructuring. This protocol rests on three tiers of source.

**Regulator and professional-body guidance, read by the author of this protocol:**

- U.S. Equal Employment Opportunity Commission, *Q&A: Understanding Waivers of Discrimination Claims in Employee Severance Agreements*, OLC Control Number EEOC-NVTA2009-2, issued 15 July 2009. This is a technical assistance document. Its own header says it does not have the force of law. Whether it has been revised or superseded since 2009 is not confirmed here, and counsel must check.
- U.S. Equal Employment Opportunity Commission, *Avoiding Discrimination in Layoffs or Reductions in Force (RIF)*, https://www.eeoc.gov/employers/small-business/avoiding-discrimination-layoffs-or-reductions-force-rif (undated page, read 21 September 2026).
- U.S. Department of Labor, Employment and Training Administration, *Plant Closings and Layoffs (WARN Act)*, https://www.dol.gov/general/topic/termination/plantclosings (undated page, read 21 September 2026).
- Fair Work Ombudsman (Australia), *Redundancy*, https://www.fairwork.gov.au/ending-employment/redundancy (undated page, read 21 September 2026).
- Chartered Institute of Personnel and Development, *Redundancy factsheet*, https://www.cipd.org/uk/knowledge/factsheets/redundancy-factsheet/. Page metadata shows both 6 April 2026 and 24 January 2023. Only the public part was read. The members' guide is behind a paywall.
- Arthur W. Page Society, *The Page Principles*, https://page.org/who-we-are/page-principles/ (undated page, read 21 September 2026).

**Research, read by the author of this protocol:**

- Lee, S., Hong, S., Shin, W.-Y., & Lee, B. G. (2023). The Experiences of Layoff Survivors: Navigating Organizational Justice in Times of Crisis. *Sustainability*, 15(24), 16717. https://doi.org/10.3390/su152416717
- Topa, G., Aranda-Carmena, M., & De-Maria, B. (2022). Psychological Contract Breach and Outcomes: A Systematic Review of Reviews. *International Journal of Environmental Research and Public Health*, 19(23), 15527. https://www.mdpi.com/1660-4601/19/23/15527
- Khaw, K. W., Alnoor, A., AL-Abrrow, H., Tiberius, V., Ganesan, Y., & Atshan, N. A. (2022). Reactions towards organizational change: a systematic literature review. *Current Psychology*, published online 13 April 2022. https://doi.org/10.1007/s12144-022-03070-6. Pages 1–6 of 24 were read, so only what appears there is cited.

**Professional judgment.** These parts rest on no published source:

- Which gaps count as High and which as Moderate.
- The wording of each trigger.
- The mapping of each element to the ten dimensions.

**Opened, not relied on.** NIST AI 600-1, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile* (July 2024), and OECD, *Recommendation of the Council on Artificial Intelligence*, OECD/LEGAL/0449. Only the front matter of each was read (NIST pp. 1–4, OECD pp. 1–6). Both govern how an AI tool is built and run, not what a draft says. They belong in the tool's own governance notes, not in this protocol.

**Not opened, so not cited:** the IABC Global Standard and Code of Ethics, the Page "trusted content" post, Van Vuuren 2008, the Taylor & Francis job-insecurity article, the SAGE identity-threat article, and the EEOC disparate-impact Q&A. It is not confirmed that the Khaw paper is the same paper as PMC9006211, which could not be opened, and the rest of the Khaw paper has not been read.

## 4. Basis

- **Lee et al.** A qualitative case study of interviews with 15 Airbnb employees who survived the 2020 layoffs.
- **Topa et al.** A systematic review of eight earlier reviews, seven of them meta-analyzes. The authors call their own conclusions about the effects of psychological-contract breach "tentative".
- **Khaw et al.** A PRISMA literature review of 79 studies, drawn from four databases with the search term "reactions to change". About 90% of the 79 studies relied on self-reports. It is not about layoffs. Its statement that communication is critical to success cites another author, Gillet et al. (2013), as its source, so it reports that claim and did not test it.
- **EEOC waiver Q&A.** A government agency's plain-language explanation of existing law, with worked examples and a sample waiver. It does not bind courts or the public.
- **EEOC, DOL, Fair Work, CIPD, Page.** Two US agencies, one Australian agency, the UK HR professional body, and a US communications society. The first three say what employers must or should do in their own jurisdictions. CIPD and Page are practitioner standards. The Page Society's own page says Page did not write the principles.

## 5. Elements

Importance uses Core, Important and Supporting, so it is not confused with the Low, Moderate and High severity scale. "Bears on" gives the scored dimension.

| Element | What it means | Importance | Bears on |
|---|---|---|---|
| Decision status | The draft says whether the decision is final, proposed, or in consultation. | Core | accountability_agency, truthfulness_factual_discipline |
| Named decision owner | A role, body or officer is named as having decided. | Core | accountability_agency |
| Scope of impact | The draft says who is affected by count or range, function, site or country, and whether the group is still being set. | Core | stakeholder_respect_impact |
| Plain statement of job loss | The draft says in ordinary words that jobs or roles end. | Core | stakeholder_respect_impact, clarity_plain_language |
| Individual notice | The draft says how and when each affected person will learn they are affected. | Core | stakeholder_respect_impact |
| Timing and terms | The draft gives dates (notice, last day) and pay and benefit terms, or says where they will be found and by when. | Core | clarity_plain_language, corrective_action_proof |
| Selection basis and alternatives | The draft says how roles or people were chosen, the group they were chosen from, and what was tried first (voluntary exit, redeployment, hiring freeze). | Core | accountability_agency, fairness_independence_conflicts, causation_explanation |
| Stated reason | The draft gives the reason for the reduction in plain terms, and it is the same reason leadership would give if asked later. | Important | causation_explanation, truthfulness_factual_discipline |
| Limited promises | Statements about the future are tied to a condition, date or basis. | Important | truthfulness_factual_discipline |
| Support for those leaving | Named support, with an owner and a date, for people whose roles end. | Important | corrective_action_proof |
| Remaining workforce | The draft says what work stops, moves or changes owner, and who decides. | Important | corrective_action_proof, stakeholder_respect_impact |
| Voice and what can change | The draft says what employees or their representatives can still influence, and separates that from what leadership has already decided. | Important | listening_employee_voice |
| Follow-up channel | A named route for questions, a next-update date, and a way to correct the record. | Important | verification_follow_through |
| Manager readiness | Where the draft equips managers, it says what they can confirm and where questions go. | Supporting | corrective_action_proof, clarity_plain_language |
| Leadership exposure | The draft says whether leadership roles, pay or incentives are affected by the same decision. | Supporting | fairness_independence_conflicts |
| Change to practice | The draft says what will change in planning, governance or incentives to reduce recurrence. | Supporting | future_readiness_learning |

Support for the Stated reason element is Example 8 in the EEOC waiver Q&A. An employee was told the cut was a "reorganization", later heard a performance reason, and the court found fraud. That is an illustration in the guidance, not a rule the tool applies. The group people were chosen from is what the guidance calls the "decisional unit" and CIPD calls the selection pool.

## 6. High-severity triggers

Raise a High-severity finding when any of these is true. If the layoff protocol has already raised the same gap, merge the findings instead of duplicating them.

1. The draft announces role eliminations or a headcount reduction and never says whether the decision is final, proposed, or subject to consultation.
2. The draft calls the decision final and also invites employee input, feedback or consultation, without saying what is still open to change. Set specialist_review_needed to true, type HR or Labor.
3. The decision is written in the passive voice, or credited to "the business", "market conditions" or a process, and no role, body or officer is named as the one who decided.
4. The draft does not say who is affected: no number or range, no function, site or country, and no statement of whether the group is still being decided.
5. The draft goes to a wider audience than the affected group and does not say how or when affected people will be told individually.
6. The draft gives no dates (notice, last working day, or a date by which dates will be given) and no pay or benefit terms, and does not say where either will be found.
7. The draft never says in plain terms that roles or employment end. It uses only words such as "transition", "impacted", "realign" or "exit". The layoff protocol's watchlist supplies the terms.
8. The draft gives an absolute promise about the future, or guarantees an outcome for affected employees, with no condition, date or stated basis. Examples of the kind of claim: no further reductions, roles are secure, everyone will be redeployed.
9. The draft states as fact that the process is lawful, compliant, fair, objective or free of bias, and does not describe the process. Set specialist_review_needed to true, type Legal.

**Specialist review.** Set specialist_review_needed to true on triggers 1, 3, 4, 5 and 6, with type HR or Labor. Add Local market when the draft names more than one country or state. On any finding that touches notice, consultation, filing or separation terms, say that an obligation may apply and that counsel must confirm. Never say whether one does.

**Raise Moderate, not High, when:**

- The draft says nothing about the remaining workforce: what work stops, moves or changes owner.
- The draft promises support but names no provider, owner or date.
- The draft has no channel for questions and no next-update date.
- An external or investor message mentions the reduction and does not say whether employees were told first. Type Investor relations.
- A Manager toolkit or Talking points document does not say what managers must not confirm or where to send questions. Type HR.
- The draft says employees were heard or consulted without saying how their input was used.
- The draft does not say whether leadership roles, pay or incentives are affected by the same decision.
- The draft says how many roles are affected but does not say which group they were chosen from. Examples of the kind of group: one department, all staff at a site, the whole company. Type HR.

**Raise Low when** the draft says nothing about what will change in practice to reduce recurrence.

## 7. Questions before publication

Always include these:

1. Is the decision final, proposed, or in consultation, and who confirmed that? *(HR or Labor; Legal)*
2. Which entities, countries, states or agreements may require notice, consultation or a filing? Counsel must confirm which apply. *(Legal; Labor; Local market)*
3. Has anyone reviewed whether the affected group is uneven across protected groups, and who? *(HR; Legal)*
4. Who will tell each affected person, when, and in what order compared with this message?
5. Can you support any statement about future reductions or job security? What is it based on, and who has approved it? *(Executive)*
6. What work stops, moves or changes owner for the people who stay, and who decides?
7. What can managers confirm today, what can they not, and where do their questions go? *(HR)*
8. Does the draft carry personal data, such as names, leave, health or immigration details, and who can see it before publication? *(Privacy)*
9. If the company is listed, or the reduction may be material, has timing been reviewed against external disclosure? *(Investor relations)*
10. Do any separation terms or agreements mentioned in the draft, including waiting, review or revocation periods, need review before anyone reads the draft? Counsel must confirm which requirements apply. *(Legal)*
11. Who owns the next update, on what date, and who corrects the record if something here proves wrong?
12. Is the reason given in this draft the same as the reason recorded for the decision and used in any separation paperwork? *(HR; Legal)*

## 8. What this protocol does not cover

- **What the draft says, not what is true.** The tool reads the draft. It cannot tell whether a process was fair, a selection was unbiased, or a fact is correct. It treats the draft's claims as claims.
- **Legal conclusions.** It flags where an obligation may apply and never says a draft is compliant or non-compliant. The legal sources here are US federal, UK and Australian. Nothing in this protocol rests on EU collective-redundancy rules, Canadian rules, or the law of any other country, and a draft naming one should get a Local market review. The EEOC guidance also notes that state law governs waiver validity and that restructurings often engage other regimes, such as WARN, the NLRA, ERISA and benefit plans. The tool notes that they may apply and does not analyze them.
- **Separation agreements.** The EEOC guidance says group waivers for employees aged 40 and over may require a written statement of the group chosen from, the eligibility factors, time limits, and job titles and ages. They may also require 45 days to consider (21 for individual offers) and 7 days to revoke. Those items belong in the agreement, not in an announcement. So the tool must not flag their absence from an all-staff message, and it must not say whether they apply. A draft that is itself a separation agreement needs a different protocol.
- **Unsettled points inside the guidance.** The same document says courts differ on whether "eligibility factors" means the criteria used to pick people. So the tool must not treat selection criteria as a legal requirement. The existing layoff trigger on criteria rests on process fairness, which is professional judgment here.
- **Selection.** It does not advise on who should be affected or on selection criteria. It only checks whether the draft describes them.
- **Evidence limits.** The research shows that fairness, explanation and follow-through matter to how employees judge restructuring. It does not show that any particular draft wording changes outcomes. The Lee study covers 15 people at one company. The Topa authors call their conclusions tentative. The Khaw review is not about layoffs. The thresholds for High and Moderate are judgment, not measured cut-offs.
- **Things that do not land on the ten dimensions.** These have no home among the ten, so the tool does not score them:
  - legal and contractual sequencing;
  - IT, payroll and property logistics;
  - retention and survivor-wellbeing outcomes;
  - AI-governance duties (NIST, OECD), which concern how the tool itself is run, not what a draft says.
- **Tone.** The protocol does not score empathy or warmth. It checks whether specific information is present, because the tool cannot verify feeling.
- **Where a human decides.** A person must decide whether the decision is final, what is said to whom and in what order, and whether the message goes out at all.
