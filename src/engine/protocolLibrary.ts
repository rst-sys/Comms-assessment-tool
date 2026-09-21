/**
 * GENERATED FILE — do not edit.
 *
 * Built from protocols/*.md by scripts/compile-protocols.ts. Change a protocol
 * by editing its Markdown file and running `npm run protocols`. A test fails
 * if this file and the folder disagree, so a forgotten rebuild is caught here
 * rather than by a tester.
 */
import type { ProtocolFile } from "./protocolFormat.js";

export const PROTOCOL_LIBRARY: ProtocolFile[] = [
    {
      "id": "event-core",
      "name": "High-stakes event core",
      "layer": "core",
      "version": 1,
      "status": "active",
      "elements": [
        {
          "name": "Decision and response owner",
          "means": "The draft names who made the decisions it describes, and who owns the response and the questions.",
          "weight": "core",
          "dimension": "accountability_agency"
        },
        {
          "name": "Who is affected, and how",
          "means": "The draft names the affected groups and the concrete impact on them, or says the group is not yet known.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "name": "Claim status",
          "means": "The draft distinguishes what is confirmed, what is a current assessment, what is unknown, and what is a promise.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline"
        },
        {
          "name": "Reader action",
          "means": "The draft tells the reader what to do now, or says that nothing is needed from them yet.",
          "weight": "core",
          "dimension": "clarity_plain_language"
        },
        {
          "name": "Next update and route for questions",
          "means": "The draft gives a next update time or cadence, a place where updates appear, and a named way to ask.",
          "weight": "core",
          "dimension": "verification_follow_through"
        },
        {
          "name": "Own role separated from outside causes",
          "means": "The draft distinguishes what happened to the organization from what it decided, enabled or failed to prevent.",
          "weight": "core",
          "dimension": "causation_explanation"
        },
        {
          "name": "Plain naming",
          "means": "The draft states the central fact in ordinary words rather than in euphemism or abstraction.",
          "weight": "core",
          "dimension": "clarity_plain_language"
        },
        {
          "name": "What changes",
          "means": "The draft names what will change in practice, governance or incentives so the failure is less likely to recur, with an owner.",
          "weight": "core",
          "dimension": "future_readiness_learning",
          "only_when": "failure"
        }
      ],
      "triggers": [
        {
          "check": "The draft describes a decision and names no role, body or person who made it, and names no owner for the response or for questions.",
          "dimension": "accountability_agency"
        },
        {
          "check": "The draft does not say who is affected, and does not say that the affected group is not yet known.",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "check": "The draft states an outcome as settled while also saying the matter is unresolved or under investigation, or states it with no basis given.",
          "dimension": "truthfulness_factual_discipline"
        },
        {
          "check": "The draft describes something still unfolding and gives neither a next update time nor a place where updates will appear.",
          "dimension": "verification_follow_through"
        },
        {
          "check": "The central fact is never stated in ordinary words. The draft refers to it only as \"the situation\", \"recent events\", \"the incident\" or similar.",
          "dimension": "clarity_plain_language",
          "may_be_narrowed_by": "event"
        }
      ],
      "questions": [
        {
          "ask": "Which statements here are confirmed today, and who owns each one?"
        },
        {
          "ask": "Who decided, and does the draft say so?"
        },
        {
          "ask": "Who owns the next update, and can you meet the time you have named?"
        },
        {
          "ask": "Have the people most affected been told directly, before or at the same time as this?"
        }
      ],
      "prose": "## What this is\n\nThe checks that apply to every high-stakes communication event, whatever the\nevent is. Each event protocol adds only what is distinctive to that event and\ndoes not repeat anything here.\n\nPart A (the first seven elements and all five triggers) fires on any event.\nPart B (the eighth element, \"What changes\") fires only on events marked as a\nfailure, because recurrence has no meaning for an acquisition or a planned\nretirement.\n\n## Source\n\nNo published standard governs high-stakes event communication as a whole, and\nthis protocol does not claim one. It is an extraction, not a discovery: the\nchecks below are the ones three separately written protocols in this folder —\ncyber incident, workforce restructuring and public apology — each arrived at\nindependently, from their own sources.\n\nThose three name their own sources, and the evidence behind any one check is\nthe evidence in the protocol it came from. Which check came from where is set\nout in the table under \"Where it came from\".\n\nThe decision about what is common to all thirteen events, and the demotion of\n\"what changes\" to failure events only, is professional judgement. It rests on\nno published source.\n\n## Basis\n\nThe three source protocols rest on regulator guidance (NIST, the SEC, HHS, the\nFTC, the EEOC, the US Department of Labor, the Fair Work Ombudsman), two\nprofessional bodies (CIPD, the Arthur W. Page Society) and four studies of\nvarying weight, the strongest of which is a systematic review of eight earlier\nreviews whose own authors call its conclusions tentative. None of that evidence\nwas produced by testing which communications work better; it is consensus about\ngood practice, not measured effect.\n\nAn extraction from three protocols is no stronger than the three, and this one\nis weaker in one way worth stating plainly: all three describe failures, so what\nthey share over-represents what failures need. That is exactly the fault the\ntest against all thirteen events was designed to catch, and it caught one.\n\n## Where it came from\n\nDerived from the three protocols in this folder, then tested against all\nthirteen events rather than kept on the strength of appearing in all three.\n\n| Core element | Breach | Restructuring | Apology |\n|---|---|---|---|\n| Decision and response owner | Decision and owner | Named decision owner | Organizational agency; Owner and follow-up |\n| Who is affected, and how | Who and what is affected | Scope of impact | Impact recognized |\n| Claim status | Claim status | Limited promises | Explanation |\n| Reader action | Reader action | Individual notice; Timing and terms | Timely care information |\n| Next update and route for questions | Update commitment; Reporting channel | Follow-up channel | Owner and follow-up |\n| Own role separated from outside causes | Cause and own exposure | Stated reason | Organizational agency |\n| Plain naming | (implicit) | Plain statement of job loss | Offense named |\n| What changes (Part B) | Post-incident account | Change to practice | System change |\n\n## What was considered and left out\n\n**What changes — demoted to Part B, not dropped.** It appears in all three\nsource protocols, but all three describe failures. Tested against the full\nthirteen it fails: an acquisition is not a failure, and a planned retirement\nhas nothing to recur. Keeping it in Part A would have produced a finding on\nevery merger announcement telling the author to explain how they will prevent\nanother merger.\n\nThis is the clearest evidence that \"common to the three files we happen to have\"\nis not the same test as \"true of all thirteen events\".\n\n**Cross-audience consistency — left out for now.** True of every event, but the\ntool can only compare documents it is given, and the feature that supplies them\nis switched off. It would be a check that almost never fires. Revisit when\naudience documents are switched back on.\n\n**Support offered, authenticity of the notice, individual notice before public\nrelease.** Each is real but belongs to a subset of events, not all thirteen.\nThey stay with the events that need them.\n\n## Narrowing\n\nAn event protocol may narrow a core trigger, and must say so explicitly. One\ncase is already known: the plain-naming trigger. In a geopolitical event,\nvagueness about a country, a conflict or the location of staff may be a\ndeliberate safety decision rather than evasion, and the draft cannot show which.\nThat protocol will turn the trigger into a question instead of a finding.\n\nNo event protocol may weaken a core element, add a core check of its own, or\nintroduce an output section. It adds what is distinctive and nothing else.\n\n## Budget\n\nThis block fires on every event review, so it stays short: eight elements, five\ntriggers, four questions. The four questions leave room for an event protocol's\nown within the eight-question cap."
    },
    {
      "id": "cyber-incident",
      "name": "Cyber incident and data breach",
      "layer": "event",
      "event": "Cyberattack or data incident",
      "version": 1,
      "status": "active",
      "elements": [
        {
          "name": "What and when",
          "means": "The draft gives the discovery date, the incident period if known, and time zones.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline"
        },
        {
          "name": "Nature of exposure",
          "means": "The draft says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined, and names the data categories involved.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline"
        },
        {
          "name": "Present response",
          "means": "The draft describes what is being done now, specific enough to check, including containment and who is investigating.",
          "weight": "core",
          "dimension": "corrective_action_proof"
        },
        {
          "name": "Support matched to harm",
          "means": "Any support offered fits the data involved, with its terms, its duration and how to claim it.",
          "weight": "supporting",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "name": "Authenticity",
          "means": "The draft tells recipients how to confirm the notice is genuine, and how the organization will and will not contact them.",
          "weight": "supporting",
          "dimension": "verification_follow_through"
        },
        {
          "name": "Attribution discipline",
          "means": "Any claim about who was responsible, or that a vendor was at fault, carries a stated basis and does not displace the organization's own role.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts"
        }
      ],
      "triggers": [
        {
          "check": "The draft states a categorical outcome — no data was compromised, the incident is contained, systems are secure — while also saying the investigation is ongoing, or with no basis given.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Information security",
            "Legal"
          ]
        },
        {
          "check": "The draft says data was involved but does not name the categories, and does not say the categories are not yet known.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Privacy",
            "Legal"
          ]
        },
        {
          "check": "The draft attributes the incident to a named attacker, a nation-state, a sophisticated actor, or a vendor, with no stated basis; or attributes it to a vendor without stating the organization's own selection, oversight or data-sharing role.",
          "dimension": "fairness_independence_conflicts",
          "review": [
            "Information security"
          ]
        },
        {
          "check": "The draft states that notification is or is not legally required, or that the organization is compliant with applicable laws.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
            "Privacy"
          ]
        },
        {
          "check": "The draft gives affected people no way to confirm the notice is genuine, in a message that asks them to act, click or call.",
          "dimension": "verification_follow_through"
        },
        {
          "check": "An investor communication states that the incident is or is not material, or gives an impact figure, without saying who determined it and when.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Investor relations",
            "Legal"
          ]
        }
      ],
      "questions": [
        {
          "ask": "Which state, national, sector, contract and cross-border notification duties may apply, and what is the earliest deadline?",
          "review": [
            "Legal",
            "Privacy"
          ]
        },
        {
          "ask": "Has law enforcement asked for a delay, and does the law allow one here?",
          "review": [
            "Legal"
          ]
        },
        {
          "ask": "Does publishing this change containment, evidence preservation or the investigation?",
          "review": [
            "Information security"
          ]
        },
        {
          "ask": "Does the support offered match the data actually involved?"
        },
        {
          "ask": "Do the website, customer letter, call-centre script, employee talking points and regulator notice agree on facts, dates and scope?"
        },
        {
          "ask": "If employees are affected, have they been told before external release?",
          "review": [
            "HR"
          ]
        }
      ],
      "prose": "## 3. Source\nProfessional judgement, informed by the following. Each was read as a fetched summary, not full text.\n\n- Nelson, A., Rekhi, S., Souppaya, M., Scarfone, K. *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile* (NIST SP 800-61r3). NIST, April 2025. https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf\n- U.S. Securities and Exchange Commission. *Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure: Small Entity Compliance Guide* (Form 8-K Item 1.05). August 2023. https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/cybersecurity-risk-management-strategy-governance-incident-disclosure\n- U.S. Department of Health and Human Services. *Breach Notification Rule*, 45 CFR §§ 164.400–414. https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html\n- Federal Trade Commission. *Data Breach Response: A Guide for Business*. August 2023, updated June 2025. https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business\n\nThe distinction between confirmed fact, current assessment, unknown and commitment, and the list of over-assurance phrases, come from a research brief supplied by the tool's owner. They are professional judgement, not a published standard.\n\nNot cited because not read: the CISA/FBI \"Communicating Under Pressure\" guidance (retrieval returned a 403; by the owner's description it covers IT/OT service outages, not data breaches), ISO/IEC 27035, and NIST CSF 2.0.\n\n## 4. Basis\nNIST SP 800-61r3 is a federal technical guidance document. It sets recommendations, not binding rules. The SEC rule and the HIPAA rule are binding regulation, applying only to SEC registrants and HIPAA covered entities or business associates respectively. The FTC guide is regulator business guidance and is not binding. None of these was produced from an empirical study of which notices work better. Those judgements are consensus, not measured effect.\n\n## 5. Elements\n\n| Element | What it means | Importance | Dimensions |\n|---|---|---|---|\n| Claim status | Each material claim is marked, by wording or structure, as confirmed, assessed, unknown, or a commitment. | Essential | truthfulness_factual_discipline |\n| What and when | It gives the discovery date, the incident period if known, and time zones. | Essential | truthfulness_factual_discipline, clarity_plain_language |\n| Who and what is affected | It names the affected groups, systems, services and specific data categories, or says these are not yet known. | Essential | stakeholder_respect_impact |\n| Nature of exposure | It says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined. | High | truthfulness_factual_discipline |\n| Reader action | It gives a concrete action for the reader, or says none is needed now. | Essential | stakeholder_respect_impact, clarity_plain_language |\n| Decision and owner | It names who decided what, such as the notification, the timing, and public statements, and who owns the response and questions. | High | accountability_agency |\n| Cause and own exposure | It separates the attacker's actions from the organization's own control gaps, without claiming a cause it cannot support. | High | causation_explanation, fairness_independence_conflicts |\n| Present response | It describes what is being done now, specific enough to check. | High | corrective_action_proof |\n| Support matched to harm | Any support offered fits the data involved, with terms, duration and how to claim it. | Medium | stakeholder_respect_impact, corrective_action_proof |\n| Update commitment | It gives a next update time or cadence and one place where updates appear. | High | verification_follow_through |\n| Authenticity | It tells recipients how to confirm the notice is real and how the organization will and won't contact them. | Medium | verification_follow_through, clarity_plain_language |\n| Reporting channel | It gives a way for affected people to report problems or ask questions, with hours. | Medium | listening_employee_voice |\n| Post-incident account | It commits to a review of what failed, names who owns it and when it will be reported, and says whether it is independent. | Medium | future_readiness_learning, verification_follow_through |\n| Cross-audience consistency | Facts, dates and scope agree with any other communications supplied for the same incident. | High | truthfulness_factual_discipline, accountability_agency |\n\n## 6. High-severity triggers\nRaise a High-severity finding when any of these is true:\n\n- The draft states a categorical outcome (\"no data was compromised\", \"the incident is contained\", \"systems are secure\", or similar) while also saying the investigation is ongoing, or gives no basis for the claim.\n- The draft uses \"no evidence of misuse\", \"out of an abundance of caution\" or \"we take security seriously\" in place of stating what was exposed and what is being done.\n- The draft says data was involved but does not name the categories, and does not say they are not yet known.\n- The draft is addressed to affected individuals and gives neither an action nor a statement that no action is currently needed.\n- The draft does not say who is affected (customers, employees, partners, patients or another group).\n- The draft gives no discovery date, or gives dates that conflict with each other or with supplied related communications.\n- A holding statement or ongoing-incident update gives no next update time or cadence and names no place where updates will appear.\n- The draft attributes the incident to a named attacker, a nation-state, or a \"sophisticated\" actor, or to a vendor or third party, and gives no stated basis.\n- The draft attributes the incident to a vendor and does not state the organization's own role, such as its selection, oversight or data-sharing decisions.\n- The draft states that notification is or is not legally required, or that it is \"compliant with all applicable laws\", with no acknowledgement that counsel has confirmed it. Never accept such a statement as a finding of compliance.\n- The draft names no owner for the response, no decision-maker, and no contact for questions.\n- The draft gives affected people no way to confirm the notice is genuine (a verified site, the organization's stated contact method, or how the organization will and will not contact them).\n- An Investor communication states that the incident is or is not material, or gives an impact figure, and says nothing about who made the determination or when.\n- The draft describes support as protecting people (\"monitoring will keep you safe\") without saying what it covers and for how long.\n\nSet specialist_review_needed to true on the following findings:\n\n- **Legal and Privacy:** the legal-conclusion finding, any finding about notification content or timing, and any finding about data categories.\n- **Investor relations and Legal:** the materiality finding.\n- **Information security:** any finding about attribution, containment claims, or the nature of exposure.\n- **HR or Labor:** any finding where the affected group is employees.\n- **Local market:** any finding where affected people are in more than one country.\n\n## 7. Questions before publication\nAlways include these:\n\n- What is confirmed, and who owns each confirmed fact? (Information security)\n- Which statements in the draft are assessments or unknowns rather than confirmed facts?\n- Which state, national, sector, contract and cross-border notification duties may apply, and what is the earliest deadline? Counsel must confirm; the review does not state whether any obligation applies. (Legal, Privacy)\n- Has law enforcement asked for a delay, and does the law allow one in this case? (Legal)\n- For a public company: who made the materiality determination, when, and how does the draft agree with the filing? (Investor relations, Legal)\n- Do the website, customer letter, call-centre script, employee talking points, regulator notice and executive statement agree on facts, dates and scope?\n- Does publishing this change containment, evidence preservation or an investigation? (Information security)\n- Who owns the next update, and can the organization meet the time it names?\n- What did the organization's own decisions or controls contribute, separate from the attacker's actions?\n- Does the support offered match the data involved?\n- Have language, accessibility and technology needs been considered for the affected people?\n- Who owns the post-incident account, and will any part of it be independent?\n- If employees are affected: have they been told before external release? (HR, Labor)\n\n## 8. What this protocol does not cover\n\n- **Speed of notice.** The draft shows whether dates are stated, not whether the organization was fast. Timeliness has no dimension among the ten, so the protocol cannot score it. A human must judge it against the earliest applicable deadline.\n- **Operational preparedness.** Out-of-band channels, tabletop exercises, and named incident roles before an incident are outside what a draft reveals.\n- **Legal conclusions.** It cannot say whether a notice is required, adequate or compliant. State and country laws, GDPR, sector rules and contracts are not covered here, and the sources are U.S.-centred. Counsel decides.\n- **Whether a claim is true.** It checks whether claims are supported in the text, not against the facts. Information security must verify them.\n- **Materiality.** It flags a materiality claim without a stated determination. It cannot judge the determination.\n- **Cross-audience consistency.** It can compare only what it is given.\n- **Sources.** The evidence is guidance and consensus, not effectiveness studies. It assumes the four sources were correctly summarized and are current."
    },
    {
      "id": "public-apology",
      "name": "Public apology",
      "layer": "posture",
      "goals": [
        "Apologize or repair trust"
      ],
      "version": 1,
      "status": "active",
      "elements": [
        {
          "name": "Acknowledged responsibility",
          "means": "The organization or a named leader says it is responsible for the conduct, decision or failure — not merely that the outcome is regrettable.",
          "weight": "core",
          "dimension": "accountability_agency"
        },
        {
          "name": "Repair offered",
          "means": "A remedy for the people affected — restitution, correction, recall, support or access — proportionate to the harm.",
          "weight": "core",
          "dimension": "corrective_action_proof"
        },
        {
          "name": "Direct regret",
          "means": "An unconditional apology for the organization's own conduct, not conditional on how anyone reacted.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "name": "Conduct rejected",
          "means": "The draft says the conduct was wrong, not only that the reaction was unfortunate.",
          "weight": "supporting",
          "dimension": "accountability_agency"
        },
        {
          "name": "Restraint in the ask",
          "means": "The draft does not demand forgiveness, understanding or moving on, and does not ask before repair is stated.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts"
        }
      ],
      "triggers": [
        {
          "check": "No sentence says the organization or a named leader is responsible. The draft offers only regret, sympathy or concern.",
          "dimension": "accountability_agency",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The only apology sentence is conditional on the audience's reaction — \"if\", \"to anyone who felt\", \"that concerns were raised\".",
          "dimension": "stakeholder_respect_impact",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The cause is placed on an individual employee, a vendor, a miscommunication or the audience's reaction, and the draft does not state the organization's own supervisory or control role.",
          "dimension": "fairness_independence_conflicts",
          "review": [
            "Legal",
            "HR"
          ]
        },
        {
          "check": "The draft describes harm to identifiable people and offers neither a repair nor any corrective action.",
          "dimension": "corrective_action_proof",
          "review": [
            "Executive"
          ]
        },
        {
          "check": "The draft, or the context supplied with it, describes knowledge, intent, concealment or deliberate choice, and the draft calls it a mistake, error, oversight or miscommunication.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal"
          ]
        }
      ],
      "questions": [
        {
          "ask": "Who approved the decision or conduct being apologized for, and does the draft say so?"
        },
        {
          "ask": "Is the repair proportionate to the harm, and does the named owner have authority to commit to it?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "Does the draft blame a person or vendor who has not been told or given a chance to respond?",
          "review": [
            "HR",
            "Legal"
          ]
        },
        {
          "ask": "Does any statement of responsibility carry legal consequences counsel should review before publication?",
          "review": [
            "Legal"
          ]
        }
      ],
      "prose": "## 3. Source\n\n- **Published research (Elements 1, 2 and 12 only):** Lewicki, R. J., Polin, B., & Lount, R. B. (2016). \"An Exploration of the Structure of Effective Apologies.\" *Negotiation and Conflict Management Research*, 9(2), 177–196. doi:10.1111/ncmr.12073. https://onlinelibrary.wiley.com/doi/abs/10.1111/ncmr.12073\n- **Secondary account, read in full:** Ohio State University (written by Jeff Grabmeier), \"Six elements of an effective apology, according to science,\" ScienceDaily, 12 April 2016. https://www.sciencedaily.com/releases/2016/04/160412091111.htm\n- **Not read:** the article itself, which is paywalled. Study details in this protocol come from the press account, which quotes the lead author.\n- **Professional judgement (everything else):** the 12-standard audit key supplied by the tool's author. It has no published source.\n\n## 4. Basis\n\nTwo experiments with 755 participants: 333 online adults and 422 undergraduates. Each read a scenario in which a job candidate apologizes for an incorrect tax return. They then rated the apology on effectiveness, credibility and adequacy, from 1 to 5. Apologies contained between one and six components. Study 1 told participants which components were present, and Study 2 showed them actual statements. The evidence covers written apologies by an individual to an individual, judged by hypothetical readers. It did not test organizations, public audiences or real trust outcomes.\n\n## 5. Elements\n\nImportance labels: Core, Supporting, Minor. \"Research\" means Lewicki et al. supports the ranking. \"Judgement\" means it rests on the audit key.\n\n| Element | What it means | Importance | Dimensions |\n|---|---|---|---|\n| Acknowledged responsibility | The organization or a named leader says it is responsible for the conduct, decision or failure. | Core (research) | accountability_agency, fairness_independence_conflicts |\n| Repair offered | A remedy for the people affected, such as restitution, correction, recall, support or access. | Core (research) | corrective_action_proof, stakeholder_respect_impact |\n| Offense named | The conduct, decision, product or omission is identified in ordinary words a reader new to the story can follow. | Core (judgement) | accountability_agency, clarity_plain_language |\n| Organizational agency | The organization's own role in making, approving, enabling or failing to prevent the conduct is stated, not left in passive or abstract wording. | Core (judgement) | accountability_agency |\n| Impact recognized | The affected groups and the concrete harm to them are named before the organization's own discomfort. | Core (judgement) | stakeholder_respect_impact |\n| System change | Operational, policy, governance, staffing or oversight changes that address why the failure could happen. | Core (judgement) | future_readiness_learning, corrective_action_proof |\n| Owner and follow-up | A named role or body owns the work, with a date or an external standard by which progress can be checked. | Core (judgement) | verification_follow_through, accountability_agency |\n| Explanation | A brief, fact-grounded account of how the failure happened. It separates confirmed facts from what is still under investigation, and it explains rather than excuses. | Supporting (research: tied third) | causation_explanation, truthfulness_factual_discipline |\n| Direct regret | An unconditional statement of apology for the organization's own conduct. | Supporting (research: tied third) | stakeholder_respect_impact, clarity_plain_language |\n| Conduct rejected | The draft says the conduct was wrong, not only that the reaction was unfortunate. | Supporting (research: tied third) | accountability_agency, future_readiness_learning |\n| Timely care information | If people are still at risk, the draft tells them what to do and whom to contact, and says what is confirmed now. | Supporting (judgement) | stakeholder_respect_impact, clarity_plain_language |\n| Restraint in the ask | The draft does not demand forgiveness, understanding or moving on. | Minor (research: forgiveness ranked lowest) | fairness_independence_conflicts, stakeholder_respect_impact |\n\nThe rankings marked \"research\" rest on the Lewicki study, but the study did not test corporate apologies. Treat \"Core (research)\" as the best available evidence, not as proof for this setting. The tie between regret, explanation and repentance means the protocol should not raise a finding because one of the three is stronger than another.\n\n## 6. High-severity triggers\n\n**Watchlist.** Treat these as prompts in addition to the vague-action list: \"mistakes were made\", \"we regret that this happened\", \"sorry if\", \"any inconvenience\", \"the situation\", \"recent events\", \"the incident\", \"the content was posted\", \"not who we are\", \"never our intention\", \"we hear your concerns\", \"we are conducting a review\", \"we take this seriously\", \"we ask for your understanding\", \"committed to doing better\". A watchlist term alone is not a finding. Raise one only when the term stands in place of an element from Section 5.\n\nRaise a High-severity finding when any of these is true:\n\n- No sentence says the organization or a named leader is responsible for the conduct, decision or failure. The draft offers only regret, sympathy or concern. *(accountability_agency; Legal)*\n- The draft never says what the conduct or failure was. The only references are \"the situation\", \"the incident\", \"mistakes\" or similar. *(accountability_agency, clarity_plain_language)*\n- The cause is placed only on an individual employee, a vendor, a miscommunication, circumstances or the audience's reaction, and the draft does not state the organization's own supervisory or control role. *(accountability_agency, fairness_independence_conflicts; Legal, plus HR if an employee is named)*\n- The only apology sentence is conditional on the audience's reaction, for example \"if\", \"to anyone who felt\", or \"that concerns were raised\". *(stakeholder_respect_impact; Legal)*\n- The draft names no affected group and no concrete harm. Alternatively, it states that no one was harmed with no stated basis. *(stakeholder_respect_impact; add Privacy or Information security where data is involved, and HR or Labor where employees are affected)*\n- The draft describes harm to identifiable people and offers neither a repair nor any corrective action. *(corrective_action_proof; Executive)*\n- The only forward commitment is a review, an investigation, training or \"doing better\", and it has no named owner and no date. *(corrective_action_proof, verification_follow_through; Executive)*\n- The draft, or context the author supplied, describes knowledge, intent, concealment or deliberate choice, and the draft calls it a mistake, error, oversight or miscommunication. *(truthfulness_factual_discipline, accountability_agency; Legal.)* This trigger rests on professional judgement, not on the study. The study found the components worked the same for competence and integrity failures, so do not cite research for it.\n- The draft describes an ongoing risk to people (safety, money, data, access) and gives them no action to take or contact to use. *(stakeholder_respect_impact, clarity_plain_language; Privacy or Information security where data is involved)*\n\n**Raise Moderate when:**\n\n- Explanation comes before the first statement of responsibility.\n- The explanation names external context, third parties or audience misreading and names no internal decision or control.\n- The only apology is conditional but responsibility is stated elsewhere.\n- Values language stands in for a statement that the conduct was wrong.\n- The draft asks for understanding or patience before any repair is stated.\n- The impact passage leads with reputation, criticism or intent before the affected group.\n- An owner is named by department only, or a follow-up has no date.\n- Facts are still developing and the draft does not separate confirmed from unconfirmed or give an update date.\n\n**Raise Low when** the draft requests forgiveness after repair has been stated.\n\n## 7. Questions before publication\n\nAlways include these:\n\n- Who approved the decision or conduct being apologized for, and does the draft say so?\n- Who is affected, and have they been told directly before or at the same time as the public release?\n- Is the repair proportionate to the harm, and does the named owner have authority to commit to it? *(Executive)*\n- Which statements in the draft are confirmed today, and which are still under investigation? When is the next update?\n- Does the draft blame a person or vendor who has not been told or given a chance to respond? *(HR, Legal)*\n- Does any statement of responsibility carry legal consequences that counsel should review before publication? *(Legal)*\n- Do notification, disclosure or consultation obligations apply in the markets where people are affected? These may apply, and counsel must confirm. *(Legal, Privacy, Information security, Investor relations, Local market, or HR and Labor, depending on the case)*\n\n## 8. What this protocol does not cover\n\n- **It cannot judge sincerity or whether the apology will land.** It reads for the presence of information, not for feeling.\n- **It cannot verify facts.** It can see whether the draft separates confirmed from unconfirmed, not whether the confirmed statements are true.\n- **It cannot see timing.** Timeliness can only be checked against dates and care information the draft itself states.\n- **It makes no legal call.** It never says a draft is compliant or non-compliant. Whether an admission of responsibility creates liability is for counsel. The protocol never advises softening responsibility to manage that risk.\n- **Its evidence base is thin.** Only the responsibility, repair and forgiveness rankings rest on a published study, known here through a press account. It used written hypothetical scenarios, student and online participants, and perceived effectiveness as the outcome. Everything else is one author's professional standard.\n- **It does not adjust for the kind of failure.** The study found apologies were less accepted when the failure involved integrity, and component value did not change. The protocol applies the same checks either way. Whether a deliberate breach needs consequences or independent review is for a human to decide, because the draft cannot show it.\n- **Two dimensions get little coverage.** listening_employee_voice has no element here, because nothing in the supplied material supports one. fairness_independence_conflicts is checked only through blame-shifting and the ask."
    },
    {
      "id": "workforce-restructuring",
      "name": "Workforce reduction and restructuring",
      "layer": "event",
      "event": "Workforce reduction or major reorganization",
      "version": 1,
      "status": "active",
      "elements": [
        {
          "name": "Decision status",
          "means": "Whether the decision is final, proposed, or in consultation.",
          "weight": "core",
          "dimension": "accountability_agency"
        },
        {
          "name": "Scope of impact",
          "means": "How many are affected, in which functions, sites and countries, or that the group is still being set.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "name": "Selection basis and alternatives",
          "means": "How roles or people were chosen, the group chosen from, and what was tried first — voluntary exit, redeployment, a hiring freeze.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts"
        },
        {
          "name": "Individual notice, timing and terms",
          "means": "How and when each affected person is told, with notice dates, last day and pay terms, or where those will be found and by when.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "name": "Support for those leaving",
          "means": "Named support for people whose roles end, with a provider, owner and date.",
          "weight": "core",
          "dimension": "corrective_action_proof"
        },
        {
          "name": "The remaining workforce",
          "means": "What work stops, moves or changes owner for the people who stay, and who decides.",
          "weight": "supporting",
          "dimension": "corrective_action_proof"
        },
        {
          "name": "Voice and what can still change",
          "means": "What employees or their representatives can still influence, kept separate from what leadership has already decided.",
          "weight": "core",
          "dimension": "listening_employee_voice"
        },
        {
          "name": "Leadership exposure",
          "means": "Whether leadership roles, pay or incentives are affected by the same decision.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts"
        }
      ],
      "triggers": [
        {
          "check": "The draft announces role eliminations or a headcount reduction and never says whether the decision is final, proposed, or subject to consultation.",
          "dimension": "accountability_agency",
          "review": [
            "HR",
            "Labor"
          ]
        },
        {
          "check": "The draft calls the decision final and also invites employee input, feedback or consultation, without saying what remains open to change.",
          "dimension": "listening_employee_voice",
          "review": [
            "HR",
            "Labor"
          ]
        },
        {
          "check": "The draft reaches a wider audience than the affected group without saying how or when affected people are told individually.",
          "dimension": "stakeholder_respect_impact",
          "review": [
            "HR"
          ]
        },
        {
          "check": "The draft gives no notice date, last working day or date by which dates will come, no pay terms, and no place to find either.",
          "dimension": "clarity_plain_language",
          "review": [
            "HR",
            "Labor"
          ]
        },
        {
          "check": "The draft never says in plain terms that roles or employment end, reaching instead for rightsizing, workforce optimization, simplification, efficiency, synergies, realignment, organizational health, agile or leaner organization, fewer layers, streamlining, cost discipline, transition, impacted or exit.",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "check": "Employee feedback, an engagement survey or consultation is cited as a reason for the reduction without an explicit statement that leadership, not employees, made the decision.",
          "dimension": "listening_employee_voice",
          "review": [
            "HR"
          ]
        }
      ],
      "questions": [
        {
          "ask": "Which entities, countries, states or agreements may require notice, consultation or a filing?",
          "review": [
            "Legal",
            "Labor",
            "Local market"
          ]
        },
        {
          "ask": "Has anyone reviewed whether the affected group is uneven across protected groups, and who?",
          "review": [
            "HR",
            "Legal"
          ]
        },
        {
          "ask": "What leadership decisions, incentives or governance conditions produced the structure being removed?"
        },
        {
          "ask": "Can you support any statement about future reductions or job security, and who approved it?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "What can managers confirm today, what can they not, and where do their questions go?",
          "review": [
            "HR"
          ]
        },
        {
          "ask": "Were affected employees assessed for internal mobility or redeployment before selection?",
          "review": [
            "HR"
          ]
        }
      ],
      "prose": "## 3. Source\n\nNo single standard governs communication about workforce restructuring. This protocol rests on three tiers of source.\n\n**Regulator and professional-body guidance, read by the author of this protocol:**\n\n- U.S. Equal Employment Opportunity Commission, *Q&A: Understanding Waivers of Discrimination Claims in Employee Severance Agreements*, OLC Control Number EEOC-NVTA2009-2, issued 15 July 2009. This is a technical assistance document. Its own header says it does not have the force of law. Whether it has been revised or superseded since 2009 is not confirmed here, and counsel must check.\n- U.S. Equal Employment Opportunity Commission, *Avoiding Discrimination in Layoffs or Reductions in Force (RIF)*, https://www.eeoc.gov/employers/small-business/avoiding-discrimination-layoffs-or-reductions-force-rif (undated page, read 21 September 2026).\n- U.S. Department of Labor, Employment and Training Administration, *Plant Closings and Layoffs (WARN Act)*, https://www.dol.gov/general/topic/termination/plantclosings (undated page, read 21 September 2026).\n- Fair Work Ombudsman (Australia), *Redundancy*, https://www.fairwork.gov.au/ending-employment/redundancy (undated page, read 21 September 2026).\n- Chartered Institute of Personnel and Development, *Redundancy factsheet*, https://www.cipd.org/uk/knowledge/factsheets/redundancy-factsheet/. Page metadata shows both 6 April 2026 and 24 January 2023. Only the public part was read. The members' guide is behind a paywall.\n- Arthur W. Page Society, *The Page Principles*, https://page.org/who-we-are/page-principles/ (undated page, read 21 September 2026).\n\n**Research, read by the author of this protocol:**\n\n- Lee, S., Hong, S., Shin, W.-Y., & Lee, B. G. (2023). The Experiences of Layoff Survivors: Navigating Organizational Justice in Times of Crisis. *Sustainability*, 15(24), 16717. https://doi.org/10.3390/su152416717\n- Topa, G., Aranda-Carmena, M., & De-Maria, B. (2022). Psychological Contract Breach and Outcomes: A Systematic Review of Reviews. *International Journal of Environmental Research and Public Health*, 19(23), 15527. https://www.mdpi.com/1660-4601/19/23/15527\n- Khaw, K. W., Alnoor, A., AL-Abrrow, H., Tiberius, V., Ganesan, Y., & Atshan, N. A. (2022). Reactions towards organizational change: a systematic literature review. *Current Psychology*, published online 13 April 2022. https://doi.org/10.1007/s12144-022-03070-6. Pages 1–6 of 24 were read, so only what appears there is cited.\n\n**Professional judgement.** These parts rest on no published source:\n\n- Which gaps count as High and which as Moderate.\n- The wording of each trigger.\n- The mapping of each element to the ten dimensions.\n\n**Opened, not relied on.** NIST AI 600-1, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile* (July 2024), and OECD, *Recommendation of the Council on Artificial Intelligence*, OECD/LEGAL/0449. Only the front matter of each was read (NIST pp. 1–4, OECD pp. 1–6). Both govern how an AI tool is built and run, not what a draft says. They belong in the tool's own governance notes, not in this protocol.\n\n**Not opened, so not cited:** the IABC Global Standard and Code of Ethics, the Page \"trusted content\" post, Van Vuuren 2008, the Taylor & Francis job-insecurity article, the SAGE identity-threat article, and the EEOC disparate-impact Q&A. It is not confirmed that the Khaw paper is the same paper as PMC9006211, which could not be opened, and the rest of the Khaw paper has not been read.\n\n## 4. Basis\n\n- **Lee et al.** A qualitative case study of interviews with 15 Airbnb employees who survived the 2020 layoffs.\n- **Topa et al.** A systematic review of eight earlier reviews, seven of them meta-analyses. The authors call their own conclusions about the effects of psychological-contract breach \"tentative\".\n- **Khaw et al.** A PRISMA literature review of 79 studies, drawn from four databases with the search term \"reactions to change\". About 90% of the 79 studies relied on self-reports. It is not about layoffs. Its statement that communication is critical to success cites another author, Gillet et al. (2013), as its source, so it reports that claim and did not test it.\n- **EEOC waiver Q&A.** A government agency's plain-language explanation of existing law, with worked examples and a sample waiver. It does not bind courts or the public.\n- **EEOC, DOL, Fair Work, CIPD, Page.** Two US agencies, one Australian agency, the UK HR professional body, and a US communications society. The first three say what employers must or should do in their own jurisdictions. CIPD and Page are practitioner standards. The Page Society's own page says Page did not write the principles.\n\n## 5. Elements\n\nImportance uses Core, Important and Supporting, so it is not confused with the Low, Moderate and High severity scale. \"Bears on\" gives the scored dimension.\n\n| Element | What it means | Importance | Bears on |\n|---|---|---|---|\n| Decision status | The draft says whether the decision is final, proposed, or in consultation. | Core | accountability_agency, truthfulness_factual_discipline |\n| Named decision owner | A role, body or officer is named as having decided. | Core | accountability_agency |\n| Scope of impact | The draft says who is affected by count or range, function, site or country, and whether the group is still being set. | Core | stakeholder_respect_impact |\n| Plain statement of job loss | The draft says in ordinary words that jobs or roles end. | Core | stakeholder_respect_impact, clarity_plain_language |\n| Individual notice | The draft says how and when each affected person will learn they are affected. | Core | stakeholder_respect_impact |\n| Timing and terms | The draft gives dates (notice, last day) and pay and benefit terms, or says where they will be found and by when. | Core | clarity_plain_language, corrective_action_proof |\n| Selection basis and alternatives | The draft says how roles or people were chosen, the group they were chosen from, and what was tried first (voluntary exit, redeployment, hiring freeze). | Core | accountability_agency, fairness_independence_conflicts, causation_explanation |\n| Stated reason | The draft gives the reason for the reduction in plain terms, and it is the same reason leadership would give if asked later. | Important | causation_explanation, truthfulness_factual_discipline |\n| Limited promises | Statements about the future are tied to a condition, date or basis. | Important | truthfulness_factual_discipline |\n| Support for those leaving | Named support, with an owner and a date, for people whose roles end. | Important | corrective_action_proof |\n| Remaining workforce | The draft says what work stops, moves or changes owner, and who decides. | Important | corrective_action_proof, stakeholder_respect_impact |\n| Voice and what can change | The draft says what employees or their representatives can still influence, and separates that from what leadership has already decided. | Important | listening_employee_voice |\n| Follow-up channel | A named route for questions, a next-update date, and a way to correct the record. | Important | verification_follow_through |\n| Manager readiness | Where the draft equips managers, it says what they can confirm and where questions go. | Supporting | corrective_action_proof, clarity_plain_language |\n| Leadership exposure | The draft says whether leadership roles, pay or incentives are affected by the same decision. | Supporting | fairness_independence_conflicts |\n| Change to practice | The draft says what will change in planning, governance or incentives to reduce recurrence. | Supporting | future_readiness_learning |\n\nSupport for the Stated reason element is Example 8 in the EEOC waiver Q&A. An employee was told the cut was a \"reorganization\", later heard a performance reason, and the court found fraud. That is an illustration in the guidance, not a rule the tool applies. The group people were chosen from is what the guidance calls the \"decisional unit\" and CIPD calls the selection pool.\n\n## 6. High-severity triggers\n\nRaise a High-severity finding when any of these is true. If the layoff protocol has already raised the same gap, merge the findings instead of duplicating them.\n\n1. The draft announces role eliminations or a headcount reduction and never says whether the decision is final, proposed, or subject to consultation.\n2. The draft calls the decision final and also invites employee input, feedback or consultation, without saying what is still open to change. Set specialist_review_needed to true, type HR or Labor.\n3. The decision is written in the passive voice, or credited to \"the business\", \"market conditions\" or a process, and no role, body or officer is named as the one who decided.\n4. The draft does not say who is affected: no number or range, no function, site or country, and no statement of whether the group is still being decided.\n5. The draft goes to a wider audience than the affected group and does not say how or when affected people will be told individually.\n6. The draft gives no dates (notice, last working day, or a date by which dates will be given) and no pay or benefit terms, and does not say where either will be found.\n7. The draft never says in plain terms that roles or employment end. It uses only words such as \"transition\", \"impacted\", \"realign\" or \"exit\". The layoff protocol's watchlist supplies the terms.\n8. The draft gives an absolute promise about the future, or guarantees an outcome for affected employees, with no condition, date or stated basis. Examples of the kind of claim: no further reductions, roles are secure, everyone will be redeployed.\n9. The draft states as fact that the process is lawful, compliant, fair, objective or free of bias, and does not describe the process. Set specialist_review_needed to true, type Legal.\n\n**Specialist review.** Set specialist_review_needed to true on triggers 1, 3, 4, 5 and 6, with type HR or Labor. Add Local market when the draft names more than one country or state. On any finding that touches notice, consultation, filing or separation terms, say that an obligation may apply and that counsel must confirm. Never say whether one does.\n\n**Raise Moderate, not High, when:**\n\n- The draft says nothing about the remaining workforce: what work stops, moves or changes owner.\n- The draft promises support but names no provider, owner or date.\n- The draft has no channel for questions and no next-update date.\n- An external or investor message mentions the reduction and does not say whether employees were told first. Type Investor relations.\n- A Manager toolkit or Talking points document does not say what managers must not confirm or where to send questions. Type HR.\n- The draft says employees were heard or consulted without saying how their input was used.\n- The draft does not say whether leadership roles, pay or incentives are affected by the same decision.\n- The draft says how many roles are affected but does not say which group they were chosen from. Examples of the kind of group: one department, all staff at a site, the whole company. Type HR.\n\n**Raise Low when** the draft says nothing about what will change in practice to reduce recurrence.\n\n## 7. Questions before publication\n\nAlways include these:\n\n1. Is the decision final, proposed, or in consultation, and who confirmed that? *(HR or Labor; Legal)*\n2. Which entities, countries, states or agreements may require notice, consultation or a filing? Counsel must confirm which apply. *(Legal; Labor; Local market)*\n3. Has anyone reviewed whether the affected group is uneven across protected groups, and who? *(HR; Legal)*\n4. Who will tell each affected person, when, and in what order compared with this message?\n5. Can you support any statement about future reductions or job security? What is it based on, and who has approved it? *(Executive)*\n6. What work stops, moves or changes owner for the people who stay, and who decides?\n7. What can managers confirm today, what can they not, and where do their questions go? *(HR)*\n8. Does the draft carry personal data, such as names, leave, health or immigration details, and who can see it before publication? *(Privacy)*\n9. If the company is listed, or the reduction may be material, has timing been reviewed against external disclosure? *(Investor relations)*\n10. Do any separation terms or agreements mentioned in the draft, including waiting, review or revocation periods, need review before anyone reads the draft? Counsel must confirm which requirements apply. *(Legal)*\n11. Who owns the next update, on what date, and who corrects the record if something here proves wrong?\n12. Is the reason given in this draft the same as the reason recorded for the decision and used in any separation paperwork? *(HR; Legal)*\n\n## 8. What this protocol does not cover\n\n- **What the draft says, not what is true.** The tool reads the draft. It cannot tell whether a process was fair, a selection was unbiased, or a fact is correct. It treats the draft's claims as claims.\n- **Legal conclusions.** It flags where an obligation may apply and never says a draft is compliant or non-compliant. The legal sources here are US federal, UK and Australian. Nothing in this protocol rests on EU collective-redundancy rules, Canadian rules, or the law of any other country, and a draft naming one should get a Local market review. The EEOC guidance also notes that state law governs waiver validity and that restructurings often engage other regimes, such as WARN, the NLRA, ERISA and benefit plans. The tool notes that they may apply and does not analyse them.\n- **Separation agreements.** The EEOC guidance says group waivers for employees aged 40 and over may require a written statement of the group chosen from, the eligibility factors, time limits, and job titles and ages. They may also require 45 days to consider (21 for individual offers) and 7 days to revoke. Those items belong in the agreement, not in an announcement. So the tool must not flag their absence from an all-staff message, and it must not say whether they apply. A draft that is itself a separation agreement needs a different protocol.\n- **Unsettled points inside the guidance.** The same document says courts differ on whether \"eligibility factors\" means the criteria used to pick people. So the tool must not treat selection criteria as a legal requirement. The existing layoff trigger on criteria rests on process fairness, which is professional judgement here.\n- **Selection.** It does not advise on who should be affected or on selection criteria. It only checks whether the draft describes them.\n- **Evidence limits.** The research shows that fairness, explanation and follow-through matter to how employees judge restructuring. It does not show that any particular draft wording changes outcomes. The Lee study covers 15 people at one company. The Topa authors call their conclusions tentative. The Khaw review is not about layoffs. The thresholds for High and Moderate are judgement, not measured cut-offs.\n- **Things that do not land on the ten dimensions.** These have no home among the ten, so the tool does not score them:\n  - legal and contractual sequencing;\n  - IT, payroll and property logistics;\n  - retention and survivor-wellbeing outcomes;\n  - AI-governance duties (NIST, OECD), which concern how the tool itself is run, not what a draft says.\n- **Tone.** The protocol does not score empathy or warmth. It checks whether specific information is present, because the tool cannot verify feeling.\n- **Where a human decides.** A person must decide whether the decision is final, what is said to whom and in what order, and whether the message goes out at all."
    }
  ];
