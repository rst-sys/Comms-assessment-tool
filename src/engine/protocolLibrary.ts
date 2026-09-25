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
      "id": "core",
      "name": "Core protocol",
      "layer": "core",
      "version": "0.5.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": "2027-03-25",
      "rests_on": "Emergency risk-communication guidance (WHO, US CDC) applied to organizations by analogy, a plain-language standard, and three studies, none of them testing whether these checks build trust.",
      "changelog": [
        "0.5.1 — basis notes moved into the file",
        "0.5.0 (2026-09-25): made to pass the build checker. Added rests_on; removed the frontmatter narrows (the core sits directly under the framework and can't narrow it; the relationship is described in the body); added a Source section. No element, trigger or question changed.",
        "0.4.0 (2026-09-25): cleared to activate without Seeger (2006) and Ma & Zhan (2016) in the original; limitation recorded.",
        "0.3.0 (2026-09-25): wording refined after testing on two versions of a workforce-reduction memo. Central fact must come in the first two or three sentences, in ordinary words; a one-line signpost is allowed; euphemism now fires the trigger. Reputation-first trigger broadened to strategy and ambitions.",
        "0.2.0 (2026-09-25): cut to what the framework prompt (SYSTEM_PROMPT) does not already check. Removed who decided, who is affected, what readers should do, what is being done and next update, which the framework's account and agency calibration already cover. Kept two narrowing elements and three triggers.",
        "0.1.0 (2026-09-25): first draft from the core protocol source review."
      ],
      "elements": [
        {
          "id": "core.central_fact_first",
          "name": "The central fact first, in ordinary words",
          "means": "The draft states the central fact, what happened or what was decided, in its first two or three sentences and in ordinary words (for example, that jobs are ending, not that a workforce is \"impacted\"), before background, values, achievements or context. A one-line signpost before it is fine.",
          "weight": "core",
          "dimension": "clarity_plain_language",
          "basis": "standard",
          "sources": [
            "iso-24495-1-2023",
            "who-erc-2017",
            "li-2008"
          ],
          "basis_note": "A plain-language standard and WHO guidance applied to organizations by analogy, supported by one large study showing bad news is written less plainly. The “first two or three sentences” threshold is the tool's own."
        },
        {
          "id": "core.estimates_as_estimates",
          "name": "Estimates marked as estimates",
          "means": "Whatever stage the situation is at, the draft marks what is estimated, expected or still being established as such, and does not state as settled anything the supplied context shows is not.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "guidance",
          "sources": [
            "who-erc-2017",
            "cdc-cerc-intro-2018",
            "seeger-2006"
          ],
          "basis_note": "Emergency risk-communication guidance (WHO, CDC) written for public authorities, applied to organizations by analogy; Seeger (2006) read only through a secondary source."
        }
      ],
      "triggers": [
        {
          "check": "The central fact first appears after the first two or three sentences, following background, values, achievements or context; or it is stated only in euphemism (\"transformation\", \"impacted\", \"realignment\") so that a reader skimming the opening would not know what happened.",
          "dimension": "clarity_plain_language"
        },
        {
          "check": "The draft states certainty (\"fully contained\", \"no impact\", \"all affected have been contacted\", \"no further changes are planned\") that the supplied context shows is not yet established.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The draft opens with the organization's strategy, ambitions, record or values before it says who is affected and how.",
          "dimension": "stakeholder_respect_impact"
        }
      ],
      "questions": [
        {
          "ask": "Which facts in this draft are confirmed, and by whom? Which are estimates or assumptions, and would the draft still stand if they changed?",
          "review": [
            "Legal",
            "Executive"
          ]
        },
        {
          "ask": "If a reader read only the first two sentences, would they know what happened or what was decided?"
        }
      ],
      "prose": "## What this protocol is\n\nThe framework prompt already asks every draft to make the account visible: the decision, who had authority, who is affected, what readers should do, what will change, who owns it, and when the next update comes. The core protocol does not repeat any of that. It **narrows** two framework elements for every named event:\n\n- **The decision** must come in the first two or three sentences and in ordinary words, not after context or behind euphemism.\n- **What is known and not yet known.** The framework applies this only when the situation is still unfolding. The core applies it at every stage, because planned announcements also contain forecasts and estimates.\n\nIt adds one trigger with its own basis: leading with the organization's strategy, ambitions, record or values before the people affected (Coombs 2007).\n\n## Source\n\n**Regulator and agency guidance (official, not binding), read:**\n\n- World Health Organization, *Communicating risk in public health emergencies: a WHO guideline for emergency risk communication (ERC) policy and practice* (2017). https://www.who.int/publications/i/item/9789241550208 — recommendations A.1, A.2, C4.1 and C4.3.\n- US Centers for Disease Control and Prevention, *Crisis and Emergency Risk Communication (CERC) Manual: Introduction* (2018 update). https://www.cdc.gov/cerc/media/pdfs/CERC_Introduction.pdf — the six CERC principles.\n\n**Standards body, read in part:**\n\n- ISO 24495-1:2023, *Plain language — Part 1: Governing principles and guidelines*. https://www.iso.org/standard/78907.html — catalogue page and abstract only.\n\n**Research:**\n\n- Coombs, W. T. (2007). \"Protecting organization reputations during a crisis.\" *Corporate Reputation Review*, 10(3), 163–176. https://link.springer.com/article/10.1057/palgrave.crr.1550049 — read in the relevant sections.\n- Li, F. (2008). \"Annual report readability, current earnings, and earnings persistence.\" *Journal of Accounting and Economics*, 45(2–3), 221–247. https://www.sciencedirect.com/science/article/abs/pii/S0165410108000141 — abstract read.\n- Seeger, M. W. (2006). \"Best practices in crisis communication: An expert panel process.\" *Journal of Applied Communication Research*, 34(3), 232–244. https://www.tandfonline.com/doi/abs/10.1080/00909880600769944 — **not opened**; quoted from Veil et al. (2020).\n\n**Declared professional judgement:** the wording of each trigger, the \"first two or three sentences\" threshold, and the choice of these two checks from the wider guidance.\n\nFull source review, including what could not be read: `sources/reviews/core-protocol-source-review.md`.\n\n## Basis\n\n*The central fact first* rests on a plain-language standard (ISO 24495-1), WHO's recommendation against technical explanation, and research showing organizations write less plainly when the news is bad (Li 2008).\n\n*Estimates marked as estimates* rests on WHO's strong recommendation to \"indicate what is known and not known at a given time\", CDC CERC's \"Be Right\" and Seeger's (2006) \"Accept uncertainty and ambiguity\". This guidance was written for public authorities in health emergencies; **the tool applies it to organizational communication by analogy.**\n\nThe reputation-first trigger rests on Coombs (2007): \"The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation.\"\n\n\n## What this protocol does not cover\n\n- Everything the framework prompt already checks (see the source review's addendum, which maps its sources onto those framework elements).\n- **Timing** (whether the organization spoke first): Stage overlay.\n- **Acknowledging harm in words:** People harmed overlay.\n- **Apology:** apology overlay and the Allegations family.\n- **Legal obligations:** overlays.\n\n## How other protocols relate to these checks\n\n- The geopolitical protocol narrows *The central fact first*: general wording about locations or people in a danger zone may be a security decision, not euphemism.\n- The workforce-reduction protocol's list of euphemisms (rightsizing, realignment, impacted…) is a sharper, event-specific form of *The central fact first*.\n- The cyber-incident protocol's check on categorical claims (\"no data was compromised\", \"contained\") during an investigation is a sharper, event-specific form of *Estimates marked as estimates*.\n\nWhere both fire, the tool raises one finding, not two.\n\n## Sources not read in the original\n\n- **Seeger (2006)** was not available. Its best practices are cited as quoted in a peer-reviewed secondary source, Veil et al. (2020). Only `core.estimates_as_estimates` relies on it, alongside WHO (2017) and CDC CERC, which were read.\n- **Ma & Zhan (2016)**, the main meta-analysis of crisis-response research, could not be opened. No element relies on it. It would have tested whether the crisis-response literature supports or contradicts these checks; that remains unchecked.\n\nDecision (25 September 2026): activate without them, with this note. Revisit if either becomes available."
    },
    {
      "id": "ceo-departure",
      "name": "CEO or senior-leader departure",
      "layer": "event",
      "family": "leadership",
      "version": "1.1.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": null,
      "changelog": [
        "1.1.1 — Evidence labels added; no check changed.",
        "1.1.0 — two listed-company disclosure questions removed; the listed-company overlay now asks them.",
        "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
      ],
      "rests_on": "US securities law for listed companies — Form 8-K, Regulation FD, Rule 10b-5 — plus professional judgment for everything else.",
      "elements": [
        {
          "id": "ceo-departure.character-of-the-departure",
          "name": "Character of the departure",
          "means": "The draft says whether the leader chose to go, was asked to go, left by negotiated agreement or was removed, or says plainly that this is not being disclosed.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "judgement",
          "sources": [],
          "basis_note": "No law, standard or code requires it. PRSA and IABC are consistent with it but don't address departures."
        },
        {
          "id": "ceo-departure.reason-or-declared-withholding-of-it",
          "name": "Reason, or declared withholding of it",
          "means": "The draft either gives the reason for the departure or states that the reason is not being given, rather than leaving the gap unacknowledged or filling it with a stock phrase.",
          "weight": "core",
          "dimension": "causation_explanation",
          "basis": "judgement",
          "sources": [],
          "basis_note": "The SEC considered requiring reasons for officer departures in 2004 and decided against it."
        },
        {
          "id": "ceo-departure.decision-date-and-effective-date",
          "name": "Decision date and effective date",
          "means": "The draft distinguishes when the decision was taken or notice given from when the departure takes effect.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "law",
          "sources": [
            "sec-form-8k",
            "sec-cdi-form-8k",
            "eu-delegated-reg-2026-789"
          ],
          "basis_note": "Binding only for listed companies in the US and EU; applied by analogy elsewhere."
        },
        {
          "id": "ceo-departure.who-holds-the-authority-now",
          "name": "Who holds the authority now",
          "means": "The draft names who holds the departing leader's authority from the departure date, whether that arrangement is interim, and how and roughly when a permanent appointment will be made.",
          "weight": "core",
          "dimension": "accountability_agency",
          "basis": "judgement",
          "sources": []
        },
        {
          "id": "ceo-departure.the-organizations-own-voice",
          "name": "The organization's own voice",
          "means": "The account of the departure comes from the body that made or accepted the decision, not only from a quotation attributed to the departing leader.",
          "weight": "supporting",
          "dimension": "accountability_agency",
          "basis": "judgement",
          "sources": []
        },
        {
          "id": "ceo-departure.separation-terms-acknowledged",
          "name": "Separation terms acknowledged",
          "means": "Where there is a separation agreement, payment, consultancy or continuing role, the draft says it exists and where its terms are or will be disclosed.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts",
          "basis": "law",
          "sources": [
            "sec-reg-sk-402j",
            "eu-directive-2007-36-art-9b"
          ],
          "basis_note": "Binding only for listed companies in the US and EU, and in later filings rather than the announcement; applied by analogy."
        },
        {
          "id": "ceo-departure.continuity-of-the-leaders-commitments",
          "name": "Continuity of the leader's commitments",
          "means": "The draft says whether strategies, commitments or relationships closely tied to the departing leader continue, are under review, or end.",
          "weight": "supporting",
          "dimension": "stakeholder_respect_impact",
          "basis": "judgement",
          "sources": []
        },
        {
          "id": "ceo-departure.a-clean-channel",
          "name": "A clean channel",
          "means": "The departure is not announced in the same document as unrelated significant news that would draw attention away from it.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts",
          "basis": "research",
          "sources": [
            "graffin-2011-strategic-noise"
          ],
          "basis_note": "Documents a pattern (unrelated news released alongside 20% of CEO successions); justifies suspicion, not a standard."
        }
      ],
      "triggers": [
        {
          "check": "The departure is described as a retirement, a personal choice or a mutual decision, yet the same draft says it takes effect immediately, names an interim leader with no transition period, or refers to an investigation, review or board inquiry — and does not reconcile the two.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
            "Executive"
          ]
        },
        {
          "check": "The departure shares the draft with unrelated significant news — results, an acquisition, a restructuring, a major product launch — and the draft does not explain any connection between them.",
          "dimension": "fairness_independence_conflicts",
          "review": [
            "Investor relations"
          ]
        },
        {
          "check": "No one is named as holding the departing leader's authority from the departure date, or an interim leader is named with no indication of how or when a permanent appointment will be made.",
          "dimension": "accountability_agency",
          "review": [
            "Executive"
          ]
        },
        {
          "check": "The only explanation of why the leader is leaving appears in a quotation attributed to the departing leader, and the organization says nothing in its own voice about the decision.",
          "dimension": "accountability_agency"
        },
        {
          "check": "The draft gives an effective date on or before the publication date but no date for when the decision was taken or notice given.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
            "Investor relations"
          ]
        },
        {
          "check": "A departing board member is said to be leaving over differences, a disagreement or a divergence of views on direction, and the draft does not say what the disagreement was about.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal"
          ]
        }
      ],
      "questions": [
        {
          "ask": "Was this departure the leader's decision, the board's, or negotiated between them — and would the draft's description still stand if the separation terms were published?",
          "review": [
            "Legal",
            "Executive"
          ]
        },
        {
          "ask": "Is there a separation agreement with non-disparagement, confidentiality or agreed-statement terms, and has the draft been checked against it and against what later remuneration or proxy disclosures will show?",
          "review": [
            "Legal",
            "Investor relations"
          ]
        },
        {
          "ask": "Which strategies, commitments or relationships depended most on the departing leader, and what does the organization intend for each?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "If this account is later contradicted — by an investigation, litigation, a filing or the departing leader — what will the organization do and how quickly?",
          "review": [
            "Legal",
            "Executive"
          ]
        }
      ],
      "narrows": [
        "plain-naming"
      ],
      "prose": "## What this protocol narrows\n\nThe core asks for the central fact in ordinary words rather than euphemism. For a\ndeparture, the central fact is *that* the leader is leaving and *how* — not\nnecessarily *why*. There are legitimate reasons not to give a reason: the\nleader's health or family circumstances, an agreement both sides signed, legal\nexposure, or an investigation still running. In US securities law, the regulator\nconsidered requiring reasons for officer departures in 2004 and decided against\nit, partly to spare departing officers embarrassment and partly because of the\nrisk of defamation claims.\n\nSo this protocol treats **saying plainly that the reason is not being given** as\nan acceptable account. What it still flags is a stock phrase — \"to spend more\ntime with family\", \"to pursue other opportunities\", \"has decided to retire\" —\nused where other facts in the draft suggest it is not the whole story. Silence\nthat is declared is honest. A reassuring phrase standing in for the reason is\nthe thing to catch.\n\n## Source\n\nThis protocol rests on three different kinds of basis. The tool should not\nblend them, and each is labelled here.\n\n**1. Binding law — applies only to listed companies in the US and EU.**\n\n- US Securities and Exchange Commission, *Form 8-K*, Item 5.02 and General\n  Instruction B.1 (form revision SEC 873, February 2025).\n  https://www.sec.gov/files/form8-k.pdf\n- US SEC, Release 33-8400 / 34-49424, *Additional Form 8-K Disclosure\n  Requirements and Acceleration of Filing Date* (2004).\n  https://www.sec.gov/rules/2004/03/additional-form-8-k-disclosure-requirements-and-acceleration-filing-date\n  — the Commission's reasons for not requiring officers' reasons, and for\n  requiring a description of a director's disagreement.\n- US SEC, Division of Corporation Finance, *Compliance & Disclosure\n  Interpretations, Exchange Act Form 8-K*, Q117.01 (last updated 24 June 2024)\n  — the four-business-day clock runs from notice of the decision, not the\n  effective date. Staff guidance, not a Commission rule.\n  https://www.sec.gov/rules-regulations/staff-guidance/compliance-disclosure-interpretations/exchange-act-form-8-k\n- US SEC, Regulation FD, 17 CFR Part 243.\n  https://www.ecfr.gov/current/title-17/chapter-II/part-243\n- US SEC, Rule 10b-5(b), 17 CFR 240.10b-5 — no material omission that makes\n  what is said misleading.\n  https://www.ecfr.gov/current/title-17/chapter-II/part-240/subject-group-ECFR7dcc9448077bb0f/section-240.10b-5\n- US SEC, Regulation S-K Item 402(j), 17 CFR 229.402(j) — severance and its\n  conditions, including non-disparagement, disclosed in the proxy.\n  https://www.ecfr.gov/current/title-17/chapter-II/part-229/subject-group-ECFR6a1ef9c5c8e3e8a/section-229.402\n- Commission Delegated Regulation (EU) 2026/789 of 8 April 2026, Annex I row 13\n  — the governing body's decision on appointment or removal is the final event\n  that triggers disclosure. https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202600789\n- Commission Implementing Regulation (EU) 2016/1055, Articles 2 and 3 — named\n  sender, date and time, permanent chronological web record.\n  https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1055\n- Directive 2007/36/EC as amended by Directive (EU) 2017/828, Article 9b —\n  remuneration reporting covering former directors and termination payments.\n  https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02007L0036-20170609\n- NYSE Regulation, *2026 Annual Listed Company Compliance Guidance Letter*\n  (27 January 2026). https://www.nyse.com/publicdocs/nyse/markets/nyse/NYSE_2026_Annual_Guidance_Letter.pdf\n\n**2. Documented behavior — justifies suspicion, not a standard.**\n\n- Graffin, S. D., Carpenter, M. A., & Boivie, S. (2011). \"What's all that\n  (strategic) noise? Anticipatory impression management in CEO succession.\"\n  *Strategic Management Journal*, 32(7), 748–770.\n  https://terry.uga.edu/sites/default/files/inline-files/Graffin_Carpenter__Boivie_2011.pdf\n  — basis for the clean-channel element and the second trigger.\n- Tayan, B., with Gow, I. D., & Larcker, D. F. (2017). \"Retired or Fired: How\n  Can Investors Tell If the CEO Left Voluntarily?\" Harvard Law School Forum on\n  Corporate Governance, 8 June 2017.\n  https://corpgov.law.harvard.edu/2017/06/08/retired-or-fired-how-can-investors-tell-if-the-ceo-left-voluntarily\n  — a summary of Stanford GSB Working Paper No. 3547; basis for the stock\n  phrases and the first trigger.\n- Independent Directors of the Board of Wells Fargo & Company, *Sales Practices\n  Investigation Report* (10 April 2017).\n  https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm\n  — a documented gap between a board's own finding and its public statement;\n  basis for the last question.\n\n**3. Declared professional judgment — no published source.**\n\nThe elements *character of the departure*, *reason or declared withholding*,\n*who holds the authority now*, *the organization's own voice* and *continuity of\nthe leader's commitments* are the protocol author's position. No law, standard\nor professional code requires them. The PRSA Code of Ethics (which names \"lying\nby omission\" as improper) and the IABC Code of Ethics are consistent with them\nbut do not address departures and should not be cited as their authority.\n\n## Basis\n\n**The law** is binding and unambiguous, but narrow. It governs the fact, timing,\nmoney and channel of a departure for listed companies. It does not require a\nreason for an officer's departure, does not require naming who decided, and\ncreates no duty to tell employees anything. It was written to protect\nsecurities markets, not to secure an account for the people affected. Several\npoints were read only in part or through secondary instruments — in particular,\nthe operative text of Article 17 of the EU Market Abuse Regulation was not\nopened, and the Nasdaq listing rules and the full Form 8-K Item 5.02 text were\nnot verified.\n\n**The research** is thin. Graffin et al. is the strongest source: 601 Fortune\n1000 CEO successions from 1999 to 2004, finding unrelated self-controlled news\nannounced within a day of 20% of successions against an 11.4% baseline. The\nauthors say they infer intent from that gap rather than observe it. The\nvoluntary-versus-forced finding — published estimates of forced departures\nranging from 3% to 40% — comes from a summary of a working paper that has not\nbeen peer-reviewed, and the paper itself was not read. The Wells Fargo report\nwas read in part.\n\n**What no one has measured** is whether a more candid departure announcement\nproduces more trust, less rumor, better retention or any other outcome. This\nprotocol's central position — that an account should give a reason or say it is\nwithholding one — is judgment, not evidence.\n\n## What this protocol does not cover\n\n- **It cannot tell from the draft whether a departure was forced.** It flags\n  contradictions inside the draft, not suspicions about the facts behind it.\n- **It cannot check against documents it has not seen** — the separation\n  agreement, the board minutes, the regulatory filing, or the next proxy. The\n  questions ask the author to make those checks.\n- **It does not judge legal compliance.** Where it mentions disclosure\n  clocks or selective disclosure, an obligation *may* apply; counsel must\n  confirm.\n- **Its legal grounding covers only listed companies in the US and EU**, and in\n  the EU only the instruments named above; national codes and regulator\n  practice in most member states were not reviewed. For private companies,\n  nonprofits, arts organizations, public bodies, and US-listed foreign\n  issuers, the protocol applies reasoning borrowed from securities law by\n  analogy, with no authority behind the transfer. The UK is not covered.\n- **Sector rules are not covered** — banking, insurance, broker-dealer and\n  similar regimes may impose different requirements, including on reasons.\n- **It does not decide what should be said when an agreement limits what can be\n  said.** It asks whether the draft is consistent with that agreement; it does\n  not resolve the tension between confidentiality and candour. A human must.\n- **A departure caused by death** is not what this protocol was written for and\n  should be reviewed with care."
    },
    {
      "id": "cyber-incident",
      "name": "Cyber incident and data breach",
      "layer": "event",
      "family": "incident",
      "version": "1.1.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": null,
      "changelog": [
        "1.1.1 — Evidence labels added; no check changed.",
        "1.1.0 — the categorical-outcome trigger now narrows core.estimates_as_estimates, and support matched to harm replaces the people-harmed overlay's general support element. No check reworded.",
        "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
      ],
      "rests_on": "US regulator guidance — NIST, the SEC, HHS and the FTC — plus professional judgment. None of it measures which notices work better.",
      "elements": [
        {
          "id": "cyber-incident.what-and-when",
          "name": "What and when",
          "means": "The draft gives the discovery date, the incident period if known, and time zones.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        },
        {
          "id": "cyber-incident.nature-of-exposure",
          "name": "Nature of exposure",
          "means": "The draft says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined, and names the data categories involved.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        },
        {
          "id": "cyber-incident.present-response",
          "name": "Present response",
          "means": "The draft describes what is being done now, specific enough to check, including containment and who is investigating.",
          "weight": "core",
          "dimension": "corrective_action_proof",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        },
        {
          "id": "cyber-incident.support-matched-to-harm",
          "name": "Support matched to harm",
          "means": "Any support offered fits the data involved, with its terms, its duration and how to claim it.",
          "weight": "supporting",
          "dimension": "stakeholder_respect_impact",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "replaces": [
            "people-harmed.support"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        },
        {
          "id": "cyber-incident.authenticity",
          "name": "Authenticity",
          "means": "The draft tells recipients how to confirm the notice is genuine, and how the organization will and will not contact them.",
          "weight": "supporting",
          "dimension": "verification_follow_through",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        },
        {
          "id": "cyber-incident.attribution-discipline",
          "name": "Attribution discipline",
          "means": "Any claim about who was responsible, or that a vendor was at fault, carries a stated basis and does not displace the organization's own role.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts",
          "basis": "judgement",
          "sources": [
            "nist-sp-800-61r3",
            "sec-cyber-small-entity-guide",
            "hhs-breach-notification-rule",
            "ftc-data-breach-response"
          ],
          "basis_note": "Informed by US regulator guidance; none of it measures which notices work better."
        }
      ],
      "triggers": [
        {
          "check": "The draft states a categorical outcome — no data was compromised, the incident is contained, systems are secure — while also saying the investigation is ongoing, or with no basis given.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Information security",
            "Legal"
          ],
          "narrows": "core.estimates_as_estimates"
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
          "ask": "Do the website, customer letter, call-center script, employee talking points and regulator notice agree on facts, dates and scope?"
        },
        {
          "ask": "If employees are affected, have they been told before external release?",
          "review": [
            "HR"
          ]
        }
      ],
      "prose": "## 3. Source\nProfessional judgment, informed by the following. Each was read as a fetched summary, not full text.\n\n- Nelson, A., Rekhi, S., Souppaya, M., Scarfone, K. *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile* (NIST SP 800-61r3). NIST, April 2025. https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf\n- U.S. Securities and Exchange Commission. *Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure: Small Entity Compliance Guide* (Form 8-K Item 1.05). August 2023. https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/cybersecurity-risk-management-strategy-governance-incident-disclosure\n- U.S. Department of Health and Human Services. *Breach Notification Rule*, 45 CFR §§ 164.400–414. https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html\n- Federal Trade Commission. *Data Breach Response: A Guide for Business*. August 2023, updated June 2025. https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business\n\nThe distinction between confirmed fact, current assessment, unknown and commitment, and the list of over-assurance phrases, come from a research brief supplied by the tool's owner. They are professional judgment, not a published standard.\n\nNot cited because not read: the CISA/FBI \"Communicating Under Pressure\" guidance (retrieval returned a 403; by the owner's description it covers IT/OT service outages, not data breaches), ISO/IEC 27035, and NIST CSF 2.0.\n\n## 4. Basis\nNIST SP 800-61r3 is a federal technical guidance document. It sets recommendations, not binding rules. The SEC rule and the HIPAA rule are binding regulation, applying only to SEC registrants and HIPAA covered entities or business associates respectively. The FTC guide is regulator business guidance and is not binding. None of these was produced from an empirical study of which notices work better. Those judgments are consensus, not measured effect.\n\n## Drafting notes: elements considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\n| Element | What it means | Importance | Dimensions |\n|---|---|---|---|\n| Claim status | Each material claim is marked, by wording or structure, as confirmed, assessed, unknown, or a commitment. | Essential | truthfulness_factual_discipline |\n| What and when | It gives the discovery date, the incident period if known, and time zones. | Essential | truthfulness_factual_discipline, clarity_plain_language |\n| Who and what is affected | It names the affected groups, systems, services and specific data categories, or says these are not yet known. | Essential | stakeholder_respect_impact |\n| Nature of exposure | It says whether data was accessed, acquired, altered or made unavailable, or that this is undetermined. | High | truthfulness_factual_discipline |\n| Reader action | It gives a concrete action for the reader, or says none is needed now. | Essential | stakeholder_respect_impact, clarity_plain_language |\n| Decision and owner | It names who decided what, such as the notification, the timing, and public statements, and who owns the response and questions. | High | accountability_agency |\n| Cause and own exposure | It separates the attacker's actions from the organization's own control gaps, without claiming a cause it cannot support. | High | causation_explanation, fairness_independence_conflicts |\n| Present response | It describes what is being done now, specific enough to check. | High | corrective_action_proof |\n| Support matched to harm | Any support offered fits the data involved, with terms, duration and how to claim it. | Medium | stakeholder_respect_impact, corrective_action_proof |\n| Update commitment | It gives a next update time or cadence and one place where updates appear. | High | verification_follow_through |\n| Authenticity | It tells recipients how to confirm the notice is real and how the organization will and won't contact them. | Medium | verification_follow_through, clarity_plain_language |\n| Reporting channel | It gives a way for affected people to report problems or ask questions, with hours. | Medium | listening_employee_voice |\n| Post-incident account | It commits to a review of what failed, names who owns it and when it will be reported, and says whether it is independent. | Medium | future_readiness_learning, verification_follow_through |\n| Cross-audience consistency | Facts, dates and scope agree with any other communications supplied for the same incident. | High | truthfulness_factual_discipline, accountability_agency |\n\n## Drafting notes: triggers considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nRaise a High-severity finding when any of these is true:\n\n- The draft states a categorical outcome (\"no data was compromised\", \"the incident is contained\", \"systems are secure\", or similar) while also saying the investigation is ongoing, or gives no basis for the claim.\n- The draft uses \"no evidence of misuse\", \"out of an abundance of caution\" or \"we take security seriously\" in place of stating what was exposed and what is being done.\n- The draft says data was involved but does not name the categories, and does not say they are not yet known.\n- The draft is addressed to affected individuals and gives neither an action nor a statement that no action is currently needed.\n- The draft does not say who is affected (customers, employees, partners, patients or another group).\n- The draft gives no discovery date, or gives dates that conflict with each other or with supplied related communications.\n- A holding statement or ongoing-incident update gives no next update time or cadence and names no place where updates will appear.\n- The draft attributes the incident to a named attacker, a nation-state, or a \"sophisticated\" actor, or to a vendor or third party, and gives no stated basis.\n- The draft attributes the incident to a vendor and does not state the organization's own role, such as its selection, oversight or data-sharing decisions.\n- The draft states that notification is or is not legally required, or that it is \"compliant with all applicable laws\", with no acknowledgement that counsel has confirmed it. Never accept such a statement as a finding of compliance.\n- The draft names no owner for the response, no decision-maker, and no contact for questions.\n- The draft gives affected people no way to confirm the notice is genuine (a verified site, the organization's stated contact method, or how the organization will and will not contact them).\n- An Investor communication states that the incident is or is not material, or gives an impact figure, and says nothing about who made the determination or when.\n- The draft describes support as protecting people (\"monitoring will keep you safe\") without saying what it covers and for how long.\n\nSet specialist_review_needed to true on the following findings:\n\n- **Legal and Privacy:** the legal-conclusion finding, any finding about notification content or timing, and any finding about data categories.\n- **Investor relations and Legal:** the materiality finding.\n- **Information security:** any finding about attribution, containment claims, or the nature of exposure.\n- **HR or Labor:** any finding where the affected group is employees.\n- **Local market:** any finding where affected people are in more than one country.\n\n## Drafting notes: questions considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nAlways include these:\n\n- What is confirmed, and who owns each confirmed fact? (Information security)\n- Which statements in the draft are assessments or unknowns rather than confirmed facts?\n- Which state, national, sector, contract and cross-border notification duties may apply, and what is the earliest deadline? Counsel must confirm; the review does not state whether any obligation applies. (Legal, Privacy)\n- Has law enforcement asked for a delay, and does the law allow one in this case? (Legal)\n- For a public company: who made the materiality determination, when, and how does the draft agree with the filing? (Investor relations, Legal)\n- Do the website, customer letter, call-center script, employee talking points, regulator notice and executive statement agree on facts, dates and scope?\n- Does publishing this change containment, evidence preservation or an investigation? (Information security)\n- Who owns the next update, and can the organization meet the time it names?\n- What did the organization's own decisions or controls contribute, separate from the attacker's actions?\n- Does the support offered match the data involved?\n- Have language, accessibility and technology needs been considered for the affected people?\n- Who owns the post-incident account, and will any part of it be independent?\n- If employees are affected: have they been told before external release? (HR, Labor)\n\n## 8. What this protocol does not cover\n\n- **Speed of notice.** The draft shows whether dates are stated, not whether the organization was fast. Timeliness has no dimension among the ten, so the protocol cannot score it. A human must judge it against the earliest applicable deadline.\n- **Operational preparedness.** Out-of-band channels, tabletop exercises, and named incident roles before an incident are outside what a draft reveals.\n- **Legal conclusions.** It cannot say whether a notice is required, adequate or compliant. State and country laws, GDPR, sector rules and contracts are not covered here, and the sources are U.S.-centered. Counsel decides.\n- **Whether a claim is true.** It checks whether claims are supported in the text, not against the facts. Information security must verify them.\n- **Materiality.** It flags a materiality claim without a stated determination. It cannot judge the determination.\n- **Cross-audience consistency.** It can compare only what it is given.\n- **Sources.** The evidence is guidance and consensus, not effectiveness studies. It assumes the four sources were correctly summarized and are current."
    },
    {
      "id": "geopolitical",
      "name": "Geopolitical event affecting operations or employee welfare",
      "layer": "event",
      "family": "external",
      "version": "1.1.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": null,
      "changelog": [
        "1.1.1 — Evidence labels added; no check changed.",
        "1.1.0 — narrows core.central_fact_first, replacing the dead plain-naming pointer. Danger and protective steps now replaces the people-harmed overlay's general version. No check reworded.",
        "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
      ],
      "rests_on": "EU worker-information directives and US WARN, official guidance with no force of law, and three studies.",
      "elements": [
        {
          "id": "geopolitical.basis-for-speaking",
          "name": "Basis for speaking",
          "means": "The draft says what connects this organization to this event — its people, its sites, its supply, its obligations — rather than speaking because others are speaking.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts",
          "basis": "research",
          "sources": [
            "bamiatzi-2024-partisan-csr",
            "braga-2026-sociopolitical-activism"
          ],
          "basis_note": "Descriptive research (peer imitation; employees the least receptive audience); a caution, not a standard."
        },
        {
          "id": "geopolitical.discretion-inside-compliance",
          "name": "Discretion inside compliance",
          "means": "Where the organization was compelled by law, sanctions or government direction, and where it chose — whether to exit, when, on what terms, and what happens to local staff.",
          "weight": "core",
          "dimension": "accountability_agency",
          "basis": "judgement",
          "sources": [],
          "basis_note": "Built from the structure of sanctions and consultation obligations; no source catalogues this evasion."
        },
        {
          "id": "geopolitical.exposure-separated-from-event",
          "name": "Exposure separated from event",
          "means": "What follows from the event itself and what follows from the organization's own prior positioning — where it sited operations, how concentrated its suppliers or staff are.",
          "weight": "core",
          "dimension": "causation_explanation",
          "basis": "judgement",
          "sources": []
        },
        {
          "id": "geopolitical.danger-and-protective-steps",
          "name": "Danger and protective steps",
          "means": "For people in or near the affected area, the risk as currently assessed, the protective steps taken or planned, and who is responsible for them.",
          "weight": "core",
          "dimension": "corrective_action_proof",
          "basis": "law",
          "sources": [
            "eu-directive-89-391"
          ],
          "replaces": [
            "people-harmed.danger_and_protection"
          ],
          "basis_note": "Binding for EU employers toward their workers; applied by analogy elsewhere."
        },
        {
          "id": "geopolitical.status-of-open-decisions",
          "name": "Status of open decisions",
          "means": "What has been decided, what is under consideration, and what would cause the next decision to be made.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "judgement",
          "sources": [],
          "basis_note": "No source establishes when a decision under consideration must be disclosed."
        },
        {
          "id": "geopolitical.divided-workforce",
          "name": "Divided workforce",
          "means": "The draft is written for a workforce holding different relationships to the conflict, and is clear about what applies to everyone regardless of where they sit.",
          "weight": "supporting",
          "dimension": "stakeholder_respect_impact",
          "basis": "judgement",
          "sources": [],
          "basis_note": "No source addresses a workforce on opposing sides of a conflict."
        },
        {
          "id": "geopolitical.route-for-personal-circumstances",
          "name": "Route for personal circumstances",
          "means": "A way for affected staff to tell the organization facts about their own situation — location, family, travel, immigration status — that would change its response, and what happens to what they report.",
          "weight": "supporting",
          "dimension": "listening_employee_voice",
          "basis": "judgement",
          "sources": []
        },
        {
          "id": "geopolitical.conditions-for-revisiting",
          "name": "Conditions for revisiting",
          "means": "What would cause this position or operational decision to change, and when it will next be reviewed.",
          "weight": "supporting",
          "dimension": "verification_follow_through",
          "basis": "judgement",
          "sources": []
        }
      ],
      "triggers": [
        {
          "check": "An operational change is attributed to the event itself — the conflict, the sanctions, the border closure — with no decision by the organization named alongside it.",
          "dimension": "causation_explanation"
        },
        {
          "check": "The draft states that the organization is complying with sanctions, export controls or government direction and offers that as the whole account, naming no discretionary choice made around it.",
          "dimension": "accountability_agency",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The decision is placed with a parent, headquarters or another jurisdiction and no accountable person or entity is named on the reader's side of the organization.",
          "dimension": "accountability_agency",
          "review": [
            "Legal",
            "Labor"
          ]
        },
        {
          "check": "The draft withholds information on grounds of confidentiality, legal advice or security without saying why it is withheld or for how long.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The draft requires employees to attend a session, acknowledge receipt, or affirm the organization's position on the political matter.",
          "dimension": "fairness_independence_conflicts",
          "review": [
            "Legal",
            "HR"
          ]
        },
        {
          "check": "People are in or near a danger zone and the draft offers support resources — counselling, assistance lines, flexibility — but names no protective step, no owner for it, and nothing for those people to do.",
          "dimension": "corrective_action_proof",
          "review": [
            "HR",
            "Legal"
          ]
        }
      ],
      "questions": [
        {
          "ask": "What gives this organization standing to address this event, and is that the reason being given to readers?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "Has a decision already been taken — an exit, suspension, relocation or withdrawal — that this draft does not disclose?",
          "review": [
            "Legal",
            "Executive"
          ]
        },
        {
          "ask": "Does what this says about the effect on employees match what the organization has told, or will tell, investors and regulators?",
          "review": [
            "Investor relations",
            "Legal"
          ]
        },
        {
          "ask": "Is the reason given here the reason the decision was actually made?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "Which statements here are true only as of today, and who corrects them when the situation moves?",
          "review": [
            "Executive"
          ]
        },
        {
          "ask": "Can this message lawfully and safely be read by staff inside the affected jurisdiction, and does anything in it expose them?",
          "review": [
            "Legal",
            "Local market",
            "Information security"
          ]
        }
      ],
      "narrows": [
        "core.central_fact_first"
      ],
      "prose": "## Source\n\n**Binding law, read in full or in the parts cited.**\n\n- Council Directive 89/391/EEC on safety and health of workers at work, Articles 8, 10 and 11. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A31989L0391 — the employer must inform workers as soon as possible of serious and imminent danger *and of the steps taken or to be taken as regards protection*, must give all necessary information on risks and protective measures, and must consult in advance and in good time. This is the anchor for the danger-and-protective-steps element and for the trigger on support offered without protection.\n- Council Directive 98/59/EC on collective redundancies, Article 2. Read from the UK retained copy at https://www.legislation.gov.uk/eudr/1998/59/article/2 because EUR-Lex repeatedly served a different document. Article 2(3) requires the reasons, numbers, period and *selection criteria* in writing. Article 2(4) provides that the obligation applies whether the decision was taken by the employer or by a controlling undertaking, and that ignorance of the parent's decision is no defense — the documentary basis for the trigger on attributing a decision upward. Articles 3 and 4 were not read.\n- Directive 2002/14/EC establishing a general framework for informing and consulting employees, Articles 4 and 6. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32002L0014 — information and consultation on the undertaking's economic situation, on threats to employment, and on decisions likely to change work organization. Article 6 permits withholding where disclosure would seriously harm the undertaking, as an exception the employer must justify.\n- Directive (EU) 2025/2450 amending the European Works Councils Directive, read as the Official Journal PDF at https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502450. It adds a duty to state the reasons for a confidentiality claim and its duration. **It does not apply until 2029**, and the article numbering returned by extraction was not independently confirmed. It is cited here as evidence that bare confidentiality claims were common enough to legislate against, not as a current obligation.\n- 20 CFR 639.7 and 639.9 (WARN). https://www.ecfr.gov/current/title-20/chapter-V/part-639/section-639.7 and https://www.ecfr.gov/current/title-20/chapter-V/part-639/section-639.9 — a literal content specification for a notice, including a *named company official with a telephone number*, and, where notice is shortened under unforeseeable business circumstances, a brief statement of the reason for the reduction.\n- California Labor Code § 1137, read via https://codes.findlaw.com/ca/labor-code/lab-sect-1137/ because the official bill page disallows automated fetching. It prohibits retaliation against an employee who declines to attend a meeting or receive communications about the employer's opinion on political matters. **Its current enforceability is unknown** — it was reported preliminarily enjoined in late 2025 by secondary sources only, which were not relied on. Comparable laws in other US states were not surveyed. The trigger on compelled attendance is framed as a drafting check, not as a statement of what the law requires.\n\n**Official guidance, no force of law.**\n\n- SEC Division of Corporation Finance, sample letter on disclosures pertaining to Russia's invasion of Ukraine, 3 May 2022. https://www.sec.gov/corpfin/sample-letter-companies-pertaining-to-ukraine. The letter carries an emphatic staff disclaimer — it \"has no legal force or effect\". It is used here only as the most detailed official articulation of what an organization should be able to account for after a geopolitical event, including the board's role in overseeing the risks *expressly including employees*. That is the basis for the question about consistency between the message and the filings.\n- CISA, Shields Up guidance for corporate leaders and CEOs. https://www.cisa.gov/shields-guidance-corporate-leaders-and-ceos. Advisory; the page carried no visible date. It establishes facts that should exist, not message content, and says nothing about communicating with employees.\n\n**Research.**\n\n- Bamiatzi, Brieger, Karakulak, Kinderman and Manning (2024), \"The rise of partisan CSR — corporate responses to the Russia–Ukraine war\", *Journal of Business Ethics* 198, 263–291. https://link.springer.com/article/10.1007/s10551-024-05795-9. Read in abstract, method and findings. It documents peer imitation as a driver of corporate response, and an \"opportunistically neutral\" response type. This supports the basis-for-speaking element.\n- Braga, Tardin, Grinstein and Perin (2026), \"Corporate sociopolitical activism as a signal — a meta-analysis\", *Journal of Business Research* 210, 116147. https://www.sciencedirect.com/science/article/pii/S0148296326001815. Employees respond least favorably of all stakeholder groups. Treated as a caution toward restraint and specificity, not as a specification.\n- Hamelberg, de Ruyter, van Dolen and Konuş (2024), \"Finding the right voice\", *Journal of Public Policy and Marketing* 44(1). https://journals.sagepub.com/doi/10.1177/07439156241230910. Measures Twitter engagement, not credibility, and points the opposite way from the meta-analysis on CEO versus brand voice. **Nothing in this protocol rests on it.**\n\n**Professional codes**, used only as background on character rather than content — the Page Principles (https://page.org/who-we-are/page-principles/), the PRSA Code of Ethics (undated in its own PDF, https://www.prsa.org/docs/default-source/about/ethics/prsa_code_of_ethics.pdf?sfvrsn=c9b66a6b_2) and the IABC Code of Ethics (undated, https://www.iabc.com/about/what-we-do/standards/code-of-ethics). SHRM's \"Navigating International Crises\" hub (https://www.shrm.org/topics-tools/topics/international-crisis) is the closest professional guidance to this event class and is the reason the protocol tests for support offered in place of an account — all five of its recommendations concern support and none asks the employer to state a decision.\n\n**Not read, and therefore not relied on.** ISO 22361 clause 8, ISO 31030 and ISO 22301 are paywalled; only catalogue pages and a table of contents were seen, so no claim here rests on what those standards say. Coombs, *Ongoing Crisis Communication* (6th ed., 2021), was identified from the publisher page only. The Equinor In Amenas investigation report itself could not be opened — only the announcement page — so nothing is claimed about what it says regarding communication with employees or next of kin.\n\n**Resting on professional judgment rather than a published source.** Four of the drafting checks come from the structure of the obligations above rather than from any document that catalogues them — the agentless-causation trigger, the compliance-framing trigger, the support-without-protection trigger, and the question about commercial reason versus stated reason. No source was found that catalogues evasions specific to this event class. That absence is itself part of the picture.\n\n## Basis\n\nThe legal instruments bind Member States and covered US employers and are enforceable, but they are triggered by *consequences* — redundancy, physical danger, material effect on an issuer — not by the geopolitical event itself. An organization can communicate at length about a war, a coup, a sanctions regime or a border closure and touch none of them. For many drafts this protocol sees, none of the binding sources will apply, and the checks are then drafting discipline drawn from them by analogy rather than compliance tests.\n\nThe EU directives take effect through national transposition, which varies materially between Member States and was not examined. German, French, Dutch and Nordic works-council law in particular goes well beyond the directive floor.\n\nThe regulator guidance is explicitly not law, says so in its own text, and in the SEC's case is specific to one event in 2022 and has not been reissued or generalized.\n\nThe research is about the wrong outcome. The meta-analysis covers 88 studies and 501 effect sizes but reports an overall effect of r = 0.084 with heterogeneity of I² = 98.9%, across a construct — sociopolitical activism — much broader than geopolitical events. The Journal of Business Ethics paper is a qualitative coding of 140 firms with no outcome measurement and no counterfactual; it is a taxonomy, not evidence that anything works. The third study measures engagement on one platform among 608 experimental participants in one country. **No study was found that measures the effect of message content on employee trust after a geopolitical event.** The strongest research-derived claim available is negative — that employees are the least receptive audience for corporate stances — which argues for specificity and restraint rather than for any particular content.\n\nSo: the elements, triggers and questions here are assembled from adjacent legal obligations and from professional judgment. They are not validated against measured outcomes, and no source claims they are.\n\n## What this protocol does not cover\n\nIt cannot tell you whether the organization should take a position on this event at all. No source distinguishes an event on which an employer has standing to speak from one on which it does not. The protocol can ask what the basis is; a human has to judge whether that basis holds.\n\nIt cannot judge a message it cannot compare to anything. The single strongest test available for this event class — whether the employee message says less about the impact on employees than the securities filing does — requires the filing, which the tool does not have. It is raised as a question for the author to settle, not scored.\n\nIt cannot judge the interval between decision and announcement, which is where most of the deception in this event class sits. No source establishes when an organization deliberating an exit, suspension or relocation must say so. The protocol asks; it cannot detect concealment from the draft alone.\n\nIt cannot judge accuracy that has decayed. Statements that were true when written go false as a geopolitical situation moves, and the professional codes address correction of *errors*, not of superseded truth.\n\nIt cannot decide which entity is accountable when the decision was made by a parent in another jurisdiction. Directive 98/59/EC forecloses upward attribution for redundancies only. For suspending operations, moving staff or changing a market position, no source establishes whether the local entity, the parent or a named executive is the party a message must identify. The protocol flags an unnamed accountable owner on the reader's side as a finding, and leaves the resolution to counsel and leadership.\n\nIt cannot resolve a message read simultaneously by staff on opposing sides of a conflict. Every source examined assumes a workforce with a single relationship to the event.\n\nTwo narrows apply. **On naming who decided**, the core check asks for a named decision-maker. In a cross-border group the deciding entity and the person a reader can hold to it may not be the same, and naming only the parent is itself the evasion Directive 98/59/EC Article 2(4) exists to close. This protocol therefore asks for both — the entity where the decision sat and an accountable owner reachable on the reader's side — and does not treat a named parent alone as satisfying the check. **On stating the central fact in ordinary words**, vagueness about a specific site, route, convoy or named individual may be a security decision taken to protect people, not evasion. Where the draft is specific about the decision and its owner but general about locations or individuals in a danger zone, that should not be read as euphemism. Generality about *what was decided* is not covered by this narrowing and remains a finding.\n\nNothing here is legal advice. Where an obligation may apply — collective redundancy information, health and safety information and consultation, works-council consultation, WARN notice content, sanctions and export control, employee data protection, or any restriction on compelling employees to receive political communications — counsel must confirm whether it applies and what it requires. Jurisdictions outside the EU and the US were not examined at all, including the jurisdiction where the event is actually happening, which is where staff are most exposed."
    },
    {
      "id": "workforce-reduction",
      "name": "Workforce reduction and restructuring",
      "layer": "event",
      "family": "workforce",
      "version": "2.0.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": null,
      "changelog": [
        "2.0.1 — Evidence labels added; no check changed.",
        "2.0.0 — five elements, four triggers and three questions moved to the workforce-impact overlay, which applies them to every job-affecting event. The euphemism trigger now narrows core.central_fact_first.",
        "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
      ],
      "rests_on": "EEOC and US Labor Department guidance, Fair Work Australia and CIPD, plus three studies, none of them about wording.",
      "elements": [
        {
          "id": "workforce-reduction.support-for-those-leaving",
          "name": "Support for those leaving",
          "means": "Named support for people whose roles end, with a provider, owner and date.",
          "weight": "core",
          "dimension": "corrective_action_proof",
          "basis": "guidance",
          "sources": [
            "fair-work-redundancy",
            "cipd-redundancy-factsheet"
          ],
          "basis_note": "Practitioner and regulator guidance on redundancy support; not binding."
        },
        {
          "id": "workforce-reduction.the-remaining-workforce",
          "name": "The remaining workforce",
          "means": "What work stops, moves or changes owner for the people who stay, and who decides.",
          "weight": "supporting",
          "dimension": "corrective_action_proof",
          "basis": "research",
          "sources": [
            "lee-2023-layoff-survivors"
          ],
          "basis_note": "Qualitative study of 15 layoff survivors at one company; shows fairness and follow-through matter, not what a message must say."
        },
        {
          "id": "workforce-reduction.leadership-exposure",
          "name": "Leadership exposure",
          "means": "Whether leadership roles, pay or incentives are affected by the same decision.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts",
          "basis": "judgement",
          "sources": []
        }
      ],
      "triggers": [
        {
          "check": "The draft never says in plain terms that roles or employment end, reaching instead for rightsizing, workforce optimization, simplification, efficiency, synergies, realignment, organizational health, agile or leaner organization, fewer layers, streamlining, cost discipline, transition, impacted or exit.",
          "dimension": "stakeholder_respect_impact",
          "narrows": "core.central_fact_first"
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
        }
      ],
      "prose": "## 3. Source\n\nNo single standard governs communication about workforce restructuring. This protocol rests on three tiers of source.\n\n**Regulator and professional-body guidance, read by the author of this protocol:**\n\n- U.S. Equal Employment Opportunity Commission, *Q&A: Understanding Waivers of Discrimination Claims in Employee Severance Agreements*, OLC Control Number EEOC-NVTA2009-2, issued 15 July 2009. This is a technical assistance document. Its own header says it does not have the force of law. Whether it has been revised or superseded since 2009 is not confirmed here, and counsel must check.\n- U.S. Equal Employment Opportunity Commission, *Avoiding Discrimination in Layoffs or Reductions in Force (RIF)*, https://www.eeoc.gov/employers/small-business/avoiding-discrimination-layoffs-or-reductions-force-rif (undated page, read 21 September 2026).\n- U.S. Department of Labor, Employment and Training Administration, *Plant Closings and Layoffs (WARN Act)*, https://www.dol.gov/general/topic/termination/plantclosings (undated page, read 21 September 2026).\n- Fair Work Ombudsman (Australia), *Redundancy*, https://www.fairwork.gov.au/ending-employment/redundancy (undated page, read 21 September 2026).\n- Chartered Institute of Personnel and Development, *Redundancy factsheet*, https://www.cipd.org/uk/knowledge/factsheets/redundancy-factsheet/. Page metadata shows both 6 April 2026 and 24 January 2023. Only the public part was read. The members' guide is behind a paywall.\n- Arthur W. Page Society, *The Page Principles*, https://page.org/who-we-are/page-principles/ (undated page, read 21 September 2026).\n\n**Research, read by the author of this protocol:**\n\n- Lee, S., Hong, S., Shin, W.-Y., & Lee, B. G. (2023). The Experiences of Layoff Survivors: Navigating Organizational Justice in Times of Crisis. *Sustainability*, 15(24), 16717. https://doi.org/10.3390/su152416717\n- Topa, G., Aranda-Carmena, M., & De-Maria, B. (2022). Psychological Contract Breach and Outcomes: A Systematic Review of Reviews. *International Journal of Environmental Research and Public Health*, 19(23), 15527. https://www.mdpi.com/1660-4601/19/23/15527\n- Khaw, K. W., Alnoor, A., AL-Abrrow, H., Tiberius, V., Ganesan, Y., & Atshan, N. A. (2022). Reactions towards organizational change: a systematic literature review. *Current Psychology*, published online 13 April 2022. https://doi.org/10.1007/s12144-022-03070-6. Pages 1–6 of 24 were read, so only what appears there is cited.\n\n**Professional judgment.** These parts rest on no published source:\n\n- Which gaps count as High and which as Moderate.\n- The wording of each trigger.\n- The mapping of each element to the ten dimensions.\n\n**Opened, not relied on.** NIST AI 600-1, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile* (July 2024), and OECD, *Recommendation of the Council on Artificial Intelligence*, OECD/LEGAL/0449. Only the front matter of each was read (NIST pp. 1–4, OECD pp. 1–6). Both govern how an AI tool is built and run, not what a draft says. They belong in the tool's own governance notes, not in this protocol.\n\n**Not opened, so not cited:** the IABC Global Standard and Code of Ethics, the Page \"trusted content\" post, Van Vuuren 2008, the Taylor & Francis job-insecurity article, the SAGE identity-threat article, and the EEOC disparate-impact Q&A. It is not confirmed that the Khaw paper is the same paper as PMC9006211, which could not be opened, and the rest of the Khaw paper has not been read.\n\n## 4. Basis\n\n- **Lee et al.** A qualitative case study of interviews with 15 Airbnb employees who survived the 2020 layoffs.\n- **Topa et al.** A systematic review of eight earlier reviews, seven of them meta-analyzes. The authors call their own conclusions about the effects of psychological-contract breach \"tentative\".\n- **Khaw et al.** A PRISMA literature review of 79 studies, drawn from four databases with the search term \"reactions to change\". About 90% of the 79 studies relied on self-reports. It is not about layoffs. Its statement that communication is critical to success cites another author, Gillet et al. (2013), as its source, so it reports that claim and did not test it.\n- **EEOC waiver Q&A.** A government agency's plain-language explanation of existing law, with worked examples and a sample waiver. It does not bind courts or the public.\n- **EEOC, DOL, Fair Work, CIPD, Page.** Two US agencies, one Australian agency, the UK HR professional body, and a US communications society. The first three say what employers must or should do in their own jurisdictions. CIPD and Page are practitioner standards. The Page Society's own page says Page did not write the principles.\n\n## Drafting notes: elements considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nImportance uses Core, Important and Supporting, so it is not confused with the Low, Moderate and High severity scale. \"Bears on\" gives the scored dimension.\n\n| Element | What it means | Importance | Bears on |\n|---|---|---|---|\n| Decision status | The draft says whether the decision is final, proposed, or in consultation. | Core | accountability_agency, truthfulness_factual_discipline |\n| Named decision owner | A role, body or officer is named as having decided. | Core | accountability_agency |\n| Scope of impact | The draft says who is affected by count or range, function, site or country, and whether the group is still being set. | Core | stakeholder_respect_impact |\n| Plain statement of job loss | The draft says in ordinary words that jobs or roles end. | Core | stakeholder_respect_impact, clarity_plain_language |\n| Individual notice | The draft says how and when each affected person will learn they are affected. | Core | stakeholder_respect_impact |\n| Timing and terms | The draft gives dates (notice, last day) and pay and benefit terms, or says where they will be found and by when. | Core | clarity_plain_language, corrective_action_proof |\n| Selection basis and alternatives | The draft says how roles or people were chosen, the group they were chosen from, and what was tried first (voluntary exit, redeployment, hiring freeze). | Core | accountability_agency, fairness_independence_conflicts, causation_explanation |\n| Stated reason | The draft gives the reason for the reduction in plain terms, and it is the same reason leadership would give if asked later. | Important | causation_explanation, truthfulness_factual_discipline |\n| Limited promises | Statements about the future are tied to a condition, date or basis. | Important | truthfulness_factual_discipline |\n| Support for those leaving | Named support, with an owner and a date, for people whose roles end. | Important | corrective_action_proof |\n| Remaining workforce | The draft says what work stops, moves or changes owner, and who decides. | Important | corrective_action_proof, stakeholder_respect_impact |\n| Voice and what can change | The draft says what employees or their representatives can still influence, and separates that from what leadership has already decided. | Important | listening_employee_voice |\n| Follow-up channel | A named route for questions, a next-update date, and a way to correct the record. | Important | verification_follow_through |\n| Manager readiness | Where the draft equips managers, it says what they can confirm and where questions go. | Supporting | corrective_action_proof, clarity_plain_language |\n| Leadership exposure | The draft says whether leadership roles, pay or incentives are affected by the same decision. | Supporting | fairness_independence_conflicts |\n| Change to practice | The draft says what will change in planning, governance or incentives to reduce recurrence. | Supporting | future_readiness_learning |\n\nSupport for the Stated reason element is Example 8 in the EEOC waiver Q&A. An employee was told the cut was a \"reorganization\", later heard a performance reason, and the court found fraud. That is an illustration in the guidance, not a rule the tool applies. The group people were chosen from is what the guidance calls the \"decisional unit\" and CIPD calls the selection pool.\n\n## Drafting notes: triggers considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nRaise a High-severity finding when any of these is true. If the layoff protocol has already raised the same gap, merge the findings instead of duplicating them.\n\n1. The draft announces role eliminations or a headcount reduction and never says whether the decision is final, proposed, or subject to consultation.\n2. The draft calls the decision final and also invites employee input, feedback or consultation, without saying what is still open to change. Set specialist_review_needed to true, type HR or Labor.\n3. The decision is written in the passive voice, or credited to \"the business\", \"market conditions\" or a process, and no role, body or officer is named as the one who decided.\n4. The draft does not say who is affected: no number or range, no function, site or country, and no statement of whether the group is still being decided.\n5. The draft goes to a wider audience than the affected group and does not say how or when affected people will be told individually.\n6. The draft gives no dates (notice, last working day, or a date by which dates will be given) and no pay or benefit terms, and does not say where either will be found.\n7. The draft never says in plain terms that roles or employment end. It uses only words such as \"transition\", \"impacted\", \"realign\" or \"exit\". The layoff protocol's watchlist supplies the terms.\n8. The draft gives an absolute promise about the future, or guarantees an outcome for affected employees, with no condition, date or stated basis. Examples of the kind of claim: no further reductions, roles are secure, everyone will be redeployed.\n9. The draft states as fact that the process is lawful, compliant, fair, objective or free of bias, and does not describe the process. Set specialist_review_needed to true, type Legal.\n\n**Specialist review.** Set specialist_review_needed to true on triggers 1, 3, 4, 5 and 6, with type HR or Labor. Add Local market when the draft names more than one country or state. On any finding that touches notice, consultation, filing or separation terms, say that an obligation may apply and that counsel must confirm. Never say whether one does.\n\n**Raise Moderate, not High, when:**\n\n- The draft says nothing about the remaining workforce: what work stops, moves or changes owner.\n- The draft promises support but names no provider, owner or date.\n- The draft has no channel for questions and no next-update date.\n- An external or investor message mentions the reduction and does not say whether employees were told first. Type Investor relations.\n- A Manager toolkit or Talking points document does not say what managers must not confirm or where to send questions. Type HR.\n- The draft says employees were heard or consulted without saying how their input was used.\n- The draft does not say whether leadership roles, pay or incentives are affected by the same decision.\n- The draft says how many roles are affected but does not say which group they were chosen from. Examples of the kind of group: one department, all staff at a site, the whole company. Type HR.\n\n**Raise Low when** the draft says nothing about what will change in practice to reduce recurrence.\n\n## Drafting notes: questions considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nAlways include these:\n\n1. Is the decision final, proposed, or in consultation, and who confirmed that? *(HR or Labor; Legal)*\n2. Which entities, countries, states or agreements may require notice, consultation or a filing? Counsel must confirm which apply. *(Legal; Labor; Local market)*\n3. Has anyone reviewed whether the affected group is uneven across protected groups, and who? *(HR; Legal)*\n4. Who will tell each affected person, when, and in what order compared with this message?\n5. Can you support any statement about future reductions or job security? What is it based on, and who has approved it? *(Executive)*\n6. What work stops, moves or changes owner for the people who stay, and who decides?\n7. What can managers confirm today, what can they not, and where do their questions go? *(HR)*\n8. Does the draft carry personal data, such as names, leave, health or immigration details, and who can see it before publication? *(Privacy)*\n9. If the company is listed, or the reduction may be material, has timing been reviewed against external disclosure? *(Investor relations)*\n10. Do any separation terms or agreements mentioned in the draft, including waiting, review or revocation periods, need review before anyone reads the draft? Counsel must confirm which requirements apply. *(Legal)*\n11. Who owns the next update, on what date, and who corrects the record if something here proves wrong?\n12. Is the reason given in this draft the same as the reason recorded for the decision and used in any separation paperwork? *(HR; Legal)*\n\n## 8. What this protocol does not cover\n\n- **What the draft says, not what is true.** The tool reads the draft. It cannot tell whether a process was fair, a selection was unbiased, or a fact is correct. It treats the draft's claims as claims.\n- **Legal conclusions.** It flags where an obligation may apply and never says a draft is compliant or non-compliant. The legal sources here are US federal, UK and Australian. Nothing in this protocol rests on EU collective-redundancy rules, Canadian rules, or the law of any other country, and a draft naming one should get a Local market review. The EEOC guidance also notes that state law governs waiver validity and that restructurings often engage other regimes, such as WARN, the NLRA, ERISA and benefit plans. The tool notes that they may apply and does not analyze them.\n- **Separation agreements.** The EEOC guidance says group waivers for employees aged 40 and over may require a written statement of the group chosen from, the eligibility factors, time limits, and job titles and ages. They may also require 45 days to consider (21 for individual offers) and 7 days to revoke. Those items belong in the agreement, not in an announcement. So the tool must not flag their absence from an all-staff message, and it must not say whether they apply. A draft that is itself a separation agreement needs a different protocol.\n- **Unsettled points inside the guidance.** The same document says courts differ on whether \"eligibility factors\" means the criteria used to pick people. So the tool must not treat selection criteria as a legal requirement. The existing layoff trigger on criteria rests on process fairness, which is professional judgment here.\n- **Selection.** It does not advise on who should be affected or on selection criteria. It only checks whether the draft describes them.\n- **Evidence limits.** The research shows that fairness, explanation and follow-through matter to how employees judge restructuring. It does not show that any particular draft wording changes outcomes. The Lee study covers 15 people at one company. The Topa authors call their conclusions tentative. The Khaw review is not about layoffs. The thresholds for High and Moderate are judgment, not measured cut-offs.\n- **Things that do not land on the ten dimensions.** These have no home among the ten, so the tool does not score them:\n  - legal and contractual sequencing;\n  - IT, payroll and property logistics;\n  - retention and survivor-wellbeing outcomes;\n  - AI-governance duties (NIST, OECD), which concern how the tool itself is run, not what a draft says.\n- **Tone.** The protocol does not score empathy or warmth. It checks whether specific information is present, because the tool cannot verify feeling.\n- **Where a human decides.** A person must decide whether the decision is final, what is said to whom and in what order, and whether the message goes out at all."
    },
    {
      "id": "allegations",
      "name": "Allegations and misconduct",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Allegations and misconduct\n\nApplies to every event whose family is `allegations` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "commercial",
      "name": "Commercial and financial decisions",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Commercial and financial decisions\n\nApplies to every event whose family is `commercial` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "external",
      "name": "External events and societal issues",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# External events and societal issues\n\nApplies to every event whose family is `external` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "incident",
      "name": "Incident and disruption",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Incident and disruption\n\nApplies to every event whose family is `incident` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "leadership",
      "name": "Leadership change",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Leadership change\n\nApplies to every event whose family is `leadership` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "scrutiny",
      "name": "Public scrutiny and reputation",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Public scrutiny and reputation\n\nApplies to every event whose family is `scrutiny` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "workforce",
      "name": "Workforce and organization change",
      "layer": "family",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Workforce and organization change\n\nApplies to every event whose family is `workforce` in `protocols/events.yaml`.\nHolds what those events share; an event protocol holds only what differs\nfrom this.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "apology",
      "name": "Public apology",
      "layer": "overlay",
      "trigger": "apology",
      "version": "1.0.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": null,
      "changelog": [
        "1.0.1 — Evidence labels added; no check changed.",
        "1.0.0 — moved into the layered framework. Checks, triggers and questions unchanged."
      ],
      "rests_on": "One 2016 study of 755 people, known here through a press account, plus the tool author's own standard.",
      "elements": [
        {
          "id": "apology.acknowledged-responsibility",
          "name": "Acknowledged responsibility",
          "means": "The organization or a named leader says it is responsible for the conduct, decision or failure — not merely that the outcome is regrettable.",
          "weight": "core",
          "dimension": "accountability_agency",
          "basis": "research",
          "sources": [
            "lewicki-2016-effective-apologies",
            "sciencedaily-2016-six-elements"
          ],
          "basis_note": "The most important of six apology elements in one 2016 study of 755 people, known here through a press account."
        },
        {
          "id": "apology.repair-offered",
          "name": "Repair offered",
          "means": "A remedy for the people affected — restitution, correction, recall, support or access — proportionate to the harm.",
          "weight": "core",
          "dimension": "corrective_action_proof",
          "basis": "research",
          "sources": [
            "lewicki-2016-effective-apologies",
            "sciencedaily-2016-six-elements"
          ],
          "basis_note": "The second most important element in the same study, known through a press account."
        },
        {
          "id": "apology.direct-regret",
          "name": "Direct regret",
          "means": "An unconditional apology for the organization's own conduct, not conditional on how anyone reacted.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact",
          "basis": "judgement",
          "sources": [],
          "basis_note": "Regret is one of six apology elements in a 2016 study, but requiring it to be unconditional is the tool's own standard."
        },
        {
          "id": "apology.conduct-rejected",
          "name": "Conduct rejected",
          "means": "The draft says the conduct was wrong, not only that the reaction was unfortunate.",
          "weight": "supporting",
          "dimension": "accountability_agency",
          "basis": "judgement",
          "sources": [],
          "basis_note": "Close to the study's “declaration of repentance”, but not the same thing."
        },
        {
          "id": "apology.restraint-in-the-ask",
          "name": "Restraint in the ask",
          "means": "The draft does not demand forgiveness, understanding or moving on, and does not ask before repair is stated.",
          "weight": "supporting",
          "dimension": "fairness_independence_conflicts",
          "basis": "judgement",
          "sources": [],
          "basis_note": "A 2016 study found asking for forgiveness added least to an apology; treating a demand for it as a fault is the tool's own standard."
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
      "prose": "## 3. Source\n\n- **Published research (Acknowledged responsibility and Repair offered only):** Lewicki, R. J., Polin, B., & Lount, R. B. (2016). \"An Exploration of the Structure of Effective Apologies.\" *Negotiation and Conflict Management Research*, 9(2), 177–196. doi:10.1111/ncmr.12073. https://onlinelibrary.wiley.com/doi/abs/10.1111/ncmr.12073\n- **Secondary account, read in full:** Ohio State University (written by Jeff Grabmeier), \"Six elements of an effective apology, according to science,\" ScienceDaily, 12 April 2016. https://www.sciencedaily.com/releases/2016/04/160412091111.htm\n- **Not read:** the article itself, which is paywalled. Study details in this protocol come from the press account, which quotes the lead author.\n- **Professional judgment (everything else):** the 12-standard audit key supplied by the tool's author. It has no published source.\n\n## 4. Basis\n\nTwo experiments with 755 participants: 333 online adults and 422 undergraduates. Each read a scenario in which a job candidate apologizes for an incorrect tax return. They then rated the apology on effectiveness, credibility and adequacy, from 1 to 5. Apologies contained between one and six components. Study 1 told participants which components were present, and Study 2 showed them actual statements. The evidence covers written apologies by an individual to an individual, judged by hypothetical readers. It did not test organizations, public audiences or real trust outcomes.\n\n## Drafting notes: elements considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nImportance labels: Core, Supporting, Minor. \"Research\" means Lewicki et al. supports the ranking. \"Judgment\" means it rests on the audit key.\n\n| Element | What it means | Importance | Dimensions |\n|---|---|---|---|\n| Acknowledged responsibility | The organization or a named leader says it is responsible for the conduct, decision or failure. | Core (research) | accountability_agency, fairness_independence_conflicts |\n| Repair offered | A remedy for the people affected, such as restitution, correction, recall, support or access. | Core (research) | corrective_action_proof, stakeholder_respect_impact |\n| Offense named | The conduct, decision, product or omission is identified in ordinary words a reader new to the story can follow. | Core (judgment) | accountability_agency, clarity_plain_language |\n| Organizational agency | The organization's own role in making, approving, enabling or failing to prevent the conduct is stated, not left in passive or abstract wording. | Core (judgment) | accountability_agency |\n| Impact recognized | The affected groups and the concrete harm to them are named before the organization's own discomfort. | Core (judgment) | stakeholder_respect_impact |\n| System change | Operational, policy, governance, staffing or oversight changes that address why the failure could happen. | Core (judgment) | future_readiness_learning, corrective_action_proof |\n| Owner and follow-up | A named role or body owns the work, with a date or an external standard by which progress can be checked. | Core (judgment) | verification_follow_through, accountability_agency |\n| Explanation | A brief, fact-grounded account of how the failure happened. It separates confirmed facts from what is still under investigation, and it explains rather than excuses. | Supporting (research: tied third) | causation_explanation, truthfulness_factual_discipline |\n| Direct regret | An unconditional statement of apology for the organization's own conduct. | Supporting (research: tied third) | stakeholder_respect_impact, clarity_plain_language |\n| Conduct rejected | The draft says the conduct was wrong, not only that the reaction was unfortunate. | Supporting (research: tied third) | accountability_agency, future_readiness_learning |\n| Timely care information | If people are still at risk, the draft tells them what to do and whom to contact, and says what is confirmed now. | Supporting (judgment) | stakeholder_respect_impact, clarity_plain_language |\n| Restraint in the ask | The draft does not demand forgiveness, understanding or moving on. | Minor (research: forgiveness ranked lowest) | fairness_independence_conflicts, stakeholder_respect_impact |\n\nThe rankings marked \"research\" rest on the Lewicki study, but the study did not test corporate apologies. Treat \"Core (research)\" as the best available evidence, not as proof for this setting. The tie between regret, explanation and repentance means the protocol should not raise a finding because one of the three is stronger than another.\n\n## Drafting notes: triggers considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\n**Watchlist.** Treat these as prompts in addition to the vague-action list: \"mistakes were made\", \"we regret that this happened\", \"sorry if\", \"any inconvenience\", \"the situation\", \"recent events\", \"the incident\", \"the content was posted\", \"not who we are\", \"never our intention\", \"we hear your concerns\", \"we are conducting a review\", \"we take this seriously\", \"we ask for your understanding\", \"committed to doing better\". A watchlist term alone is not a finding. Raise one only when the term stands in place of an element from Section 5.\n\nRaise a High-severity finding when any of these is true:\n\n- No sentence says the organization or a named leader is responsible for the conduct, decision or failure. The draft offers only regret, sympathy or concern. *(accountability_agency; Legal)*\n- The draft never says what the conduct or failure was. The only references are \"the situation\", \"the incident\", \"mistakes\" or similar. *(accountability_agency, clarity_plain_language)*\n- The cause is placed only on an individual employee, a vendor, a miscommunication, circumstances or the audience's reaction, and the draft does not state the organization's own supervisory or control role. *(accountability_agency, fairness_independence_conflicts; Legal, plus HR if an employee is named)*\n- The only apology sentence is conditional on the audience's reaction, for example \"if\", \"to anyone who felt\", or \"that concerns were raised\". *(stakeholder_respect_impact; Legal)*\n- The draft names no affected group and no concrete harm. Alternatively, it states that no one was harmed with no stated basis. *(stakeholder_respect_impact; add Privacy or Information security where data is involved, and HR or Labor where employees are affected)*\n- The draft describes harm to identifiable people and offers neither a repair nor any corrective action. *(corrective_action_proof; Executive)*\n- The only forward commitment is a review, an investigation, training or \"doing better\", and it has no named owner and no date. *(corrective_action_proof, verification_follow_through; Executive)*\n- The draft, or context the author supplied, describes knowledge, intent, concealment or deliberate choice, and the draft calls it a mistake, error, oversight or miscommunication. *(truthfulness_factual_discipline, accountability_agency; Legal.)* This trigger rests on professional judgment, not on the study. The study found the components worked the same for competence and integrity failures, so do not cite research for it.\n- The draft describes an ongoing risk to people (safety, money, data, access) and gives them no action to take or contact to use. *(stakeholder_respect_impact, clarity_plain_language; Privacy or Information security where data is involved)*\n\n**Raise Moderate when:**\n\n- Explanation comes before the first statement of responsibility.\n- The explanation names external context, third parties or audience misreading and names no internal decision or control.\n- The only apology is conditional but responsibility is stated elsewhere.\n- Values language stands in for a statement that the conduct was wrong.\n- The draft asks for understanding or patience before any repair is stated.\n- The impact passage leads with reputation, criticism or intent before the affected group.\n- An owner is named by department only, or a follow-up has no date.\n- Facts are still developing and the draft does not separate confirmed from unconfirmed or give an update date.\n\n**Raise Low when** the draft requests forgiveness after repair has been stated.\n\n## Drafting notes: questions considered (not applied)\n\nThe checks the tool applies are the ones listed on this card.\nAlways include these:\n\n- Who approved the decision or conduct being apologized for, and does the draft say so?\n- Who is affected, and have they been told directly before or at the same time as the public release?\n- Is the repair proportionate to the harm, and does the named owner have authority to commit to it? *(Executive)*\n- Which statements in the draft are confirmed today, and which are still under investigation? When is the next update?\n- Does the draft blame a person or vendor who has not been told or given a chance to respond? *(HR, Legal)*\n- Does any statement of responsibility carry legal consequences that counsel should review before publication? *(Legal)*\n- Do notification, disclosure or consultation obligations apply in the markets where people are affected? These may apply, and counsel must confirm. *(Legal, Privacy, Information security, Investor relations, Local market, or HR and Labor, depending on the case)*\n\n## 8. What this protocol does not cover\n\n- **It cannot judge sincerity or whether the apology will land.** It reads for the presence of information, not for feeling.\n- **It cannot verify facts.** It can see whether the draft separates confirmed from unconfirmed, not whether the confirmed statements are true.\n- **It cannot see timing.** Timeliness can only be checked against dates and care information the draft itself states.\n- **It makes no legal call.** It never says a draft is compliant or non-compliant. Whether an admission of responsibility creates liability is for counsel. The protocol never advises softening responsibility to manage that risk.\n- **Its evidence base is thin.** Only the responsibility, repair and forgiveness rankings rest on a published study, known here through a press account. It used written hypothetical scenarios, student and online participants, and perceived effectiveness as the outcome. Everything else is one author's professional standard.\n- **It does not adjust for the kind of failure.** The study found apologies were less accepted when the failure involved integrity, and component value did not change. The protocol applies the same checks either way. Whether a deliberate breach needs consequences or independent review is for a human to decide, because the draft cannot show it.\n- **Two dimensions get little coverage.** listening_employee_voice has no element here, because nothing in the supplied material supports one. fairness_independence_conflicts is checked only through blame-shifting and the ask."
    },
    {
      "id": "listed-company",
      "name": "Listed company disclosure",
      "layer": "overlay",
      "trigger": "listed-company",
      "version": "0.2.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": "2027-03-25",
      "rests_on": "US and EU securities disclosure law, applied to every message from a listed organization; its extension to employees and partners is professional judgement.",
      "changelog": [
        "0.2.1 — basis notes moved into the file",
        "0.2.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed.",
        "0.1.0 (2026-09-25): first draft, built from sources already opened in the CEO departure source review. No new research."
      ],
      "elements": [
        {
          "id": "listed-company.no_half_truth",
          "name": "Nothing left out that makes the rest misleading",
          "means": "Where the draft describes the financial effect, cause or outlook of the event, it doesn't leave out a fact the supplied context shows would change how a reader understands what it does say.",
          "weight": "core",
          "dimension": "truthfulness_factual_discipline",
          "basis": "law",
          "sources": [
            "sec-rule-10b5"
          ],
          "basis_note": "Binding on US securities communications; applies here only to listed organizations."
        },
        {
          "id": "listed-company.same_to_all",
          "name": "The same material facts for every audience",
          "means": "The material facts in the draft match what the organization is telling investors and the market, and the draft doesn't give one audience (employees, analysts, partners) material information that the others don't get at the same time.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts",
          "basis": "law",
          "sources": [
            "sec-regulation-fd",
            "eu-impl-reg-2016-1055"
          ],
          "basis_note": "Reg FD covers market professionals and holders; extending it to employees and partners is professional judgement."
        },
        {
          "id": "listed-company.eu_notice_form",
          "name": "Named sender, date and time (EU inside information)",
          "means": "Where the draft is the public disclosure of inside information, it names the person making the notification with their position, gives the date and time, and says that it contains inside information.",
          "weight": "supporting",
          "dimension": "verification_follow_through",
          "basis": "law",
          "sources": [
            "eu-impl-reg-2016-1055"
          ],
          "applies_if": {
            "jurisdiction": [
              "EU"
            ],
            "format": [
              "Investor or market disclosure",
              "Press release or public statement"
            ]
          },
          "basis_note": "Binding for EU inside-information disclosures only."
        }
      ],
      "triggers": [
        {
          "check": "The draft describes the event as having little or no financial effect, or gives a positive outlook, while the supplied context shows costs, losses, liabilities or uncertainty the draft doesn't mention.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
            "Investor relations"
          ]
        },
        {
          "check": "The draft is addressed to employees, customers or partners and contains figures, dates or decisions that the supplied context doesn't show being released to the market at the same time.",
          "dimension": "fairness_independence_conflicts",
          "review": [
            "Legal",
            "Investor relations"
          ]
        }
      ],
      "questions": [
        {
          "ask": "Is anything in this draft inside information or material non-public information, and has counsel confirmed when and how it must be released to the market? Counsel must confirm which rules apply.",
          "review": [
            "Legal",
            "Investor relations"
          ]
        },
        {
          "ask": "Will the market, employees and other audiences receive the material facts at the same time? If not, who hears first, and is that permitted?",
          "review": [
            "Legal",
            "Investor relations"
          ]
        },
        {
          "ask": "Will a later filing (an annual report, proxy statement or remuneration report) show something this draft contradicts or leaves out?",
          "review": [
            "Legal",
            "Investor relations"
          ]
        }
      ],
      "prose": "## What this overlay does\n\nIt adds the checks that securities disclosure rules make relevant to **any** message from a listed organization, whatever the event. Rules written for one event (for example the Form 8-K departure deadline, or the EU rule that a board's removal decision triggers disclosure) stay in that event's protocol.\n\nThe framework prompt already flags securities questions for specialist review. This overlay doesn't judge compliance. It checks whether the message's content is complete and consistent enough to raise the questions counsel must answer.\n\n## Source\n\n- **Nothing left out that makes the rest misleading:** US Rule 10b-5(b), 17 CFR 240.10b-5, which bars omitting \"a material fact necessary in order to make the statements made, in the light of the circumstances under which they were made, not misleading.\" Opened and read (CEO review 2.4).\n- **Same facts for every audience:** US Regulation FD, 17 CFR Part 243, which requires public disclosure \"simultaneously\" when material non-public information is disclosed intentionally to certain market professionals and holders (CEO review 2.3). EU Implementing Regulation 2016/1055, which requires inside information to be disseminated \"to as wide a public as possible on a non-discriminatory basis\" and \"simultaneously throughout the Union\" (CEO review 2.7).\n- **Named sender, date and time:** EU Implementing Regulation 2016/1055, Article 2 (CEO review 2.7).\n\nReg FD's selective-disclosure rule covers market professionals and securityholders, not employees as such. The *same facts for every audience* element extends its logic to employees and partners because a leak from those audiences is the usual route to selective disclosure. That extension is **professional judgement** and should be labelled so in the Library.\n\n## Limits\n\n- **MAR Article 17 was not read in the original** (CEO review §7): the \"as soon as possible\" duty and the conditions for delay are known only through instruments that cite it. Read it before this overlay is marked active.\n- US coverage is SEC registrants and NYSE-listed companies. **Nasdaq rules and foreign private issuers (Form 6-K) were not verified.**\n- EU coverage is issuers within MAR's scope. National rules in most member states were not reviewed. The UK is not covered.\n- The overlay can't tell from the draft whether information is material or inside information. It asks."
    },
    {
      "id": "people-harmed",
      "name": "People harmed or at risk",
      "layer": "overlay",
      "trigger": "people-harmed",
      "version": "0.3.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": "2027-03-25",
      "rests_on": "The EU workplace-safety directive (binding only for EU employers toward their workers) and US CDC emergency-communication guidance applied by analogy, plus crisis-communication theory.",
      "changelog": [
        "0.3.1 — basis notes moved into the file",
        "0.3.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed.",
        "0.2.0 (2026-09-25): combination rule with the geopolitical and cyber protocols set: their event-specific elements replace this overlay's equivalents when both apply.",
        "0.1.0 (2026-09-25): first draft, built from sources already opened in the geopolitical and core protocol source reviews. No new research."
      ],
      "elements": [
        {
          "id": "people-harmed.harm_acknowledged",
          "name": "Harm acknowledged in plain words",
          "means": "The draft says plainly that people were harmed or put at risk, and who, rather than describing only an \"incident\", \"event\" or \"impact\".",
          "weight": "core",
          "dimension": "stakeholder_respect_impact",
          "basis": "guidance",
          "sources": [
            "cdc-cerc-intro-2018",
            "coombs-2007"
          ],
          "basis_note": "US CDC emergency guidance and crisis-communication theory, applied by analogy; not a measured effect."
        },
        {
          "id": "people-harmed.danger_and_protection",
          "name": "The danger now, and the protective steps",
          "means": "For people who may still be at risk, the draft states the danger as currently assessed, the protective steps taken or planned, and who is responsible for them.",
          "weight": "core",
          "dimension": "corrective_action_proof",
          "basis": "law",
          "sources": [
            "eu-directive-89-391",
            "cdc-cerc-intro-2018"
          ],
          "basis_note": "Binding for EU employers toward their workers; applied by analogy elsewhere."
        },
        {
          "id": "people-harmed.support",
          "name": "Support people can actually reach",
          "means": "Where support is offered, the draft says what it is, who provides it, how to get it and for how long, and offers only what the supplied context confirms exists.",
          "weight": "supporting",
          "dimension": "stakeholder_respect_impact",
          "basis": "research",
          "sources": [
            "coombs-2007"
          ],
          "basis_note": "Crisis-communication theory (Coombs 2007), not a measured effect."
        }
      ],
      "triggers": [
        {
          "check": "Harm is described only in impersonal terms (\"individuals were impacted\", \"an incident occurred\") and the draft never says that people were hurt or put at risk.",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "check": "The draft calls the harm or risk \"minor\", \"isolated\" or \"limited\" while the supplied context doesn't establish its extent.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
            "Health and safety"
          ]
        },
        {
          "check": "The draft describes effects on operations, customers or results before it says anything about the people harmed.",
          "dimension": "stakeholder_respect_impact"
        },
        {
          "check": "Support is mentioned (\"support is available\", \"we are here for our people\") with no provider, route or contact.",
          "dimension": "stakeholder_respect_impact"
        }
      ],
      "questions": [
        {
          "ask": "Have the people harmed, and where relevant their families, been told directly before this message goes out?",
          "review": [
            "HR",
            "Health and safety"
          ]
        },
        {
          "ask": "Are the protective steps described in the draft actually in place today, and who confirmed it?",
          "review": [
            "Health and safety",
            "Legal"
          ]
        },
        {
          "ask": "Does any legal duty to inform workers or a regulator about the danger apply here, and has it been met? Counsel must confirm which rules apply.",
          "review": [
            "Legal",
            "Health and safety"
          ]
        }
      ],
      "prose": "## What this overlay does\n\nIt adds what a message owes people who were hurt or are still at risk. The framework already asks who is affected and what readers should do. This overlay narrows both: harm must be named as harm, and people still at risk must be told the danger and what is being done about it.\n\n## Source\n\n- **Harm acknowledged:** CDC CERC, \"Express Empathy: Crises create harm, and the suffering should be acknowledged in words\" (core review 2.2). Coombs (2007): \"The first priority in any crisis is to protect stakeholders from harm, not to protect the reputation\" (core review 5.2). Guidance and theory, not measured effect.\n- **Danger and protective steps:** EU OSH Framework Directive 89/391/EEC, Article 8, which requires employers to inform workers \"as soon as possible\" of \"the serious and imminent danger\" and \"the steps taken or to be taken as regards protection\" (geopolitical review 1.3). **Binding only for employers in the EU and only toward their workers.** For other readers and places, the element applies CERC guidance and the same reasoning by analogy.\n- **Support people can reach:** Coombs (2007), adjusting information. The requirement to offer only what context confirms comes from the framework's non-invention rule.\n\n## How it combines with event protocols\n\nTwo active event protocols already have their own, event-specific version of an element here:\n\n- `geopolitical.danger-and-protective-steps` (people in or near a conflict area) → replaces `people-harmed.danger_and_protection`\n- `cyber-incident.support-matched-to-harm` (support that fits the data exposed) → replaces `people-harmed.support`\n\nRule: when an event protocol and an overlay both apply, and the event protocol's element is marked `replaces: [<overlay element id>]`, the resolver drops the overlay's element and keeps the event's. The event protocols keep their wording; the overlay covers every other event where people are harmed. Add the `replaces` field to those two elements in the same change that activates this overlay.\n\n## Limits\n\n- US workplace-safety duties (OSHA) were not reviewed.\n- The overlay only fires when the intake box is ticked. It can't detect harm the author didn't declare.\n- Nothing reviewed addresses notifying next of kin; the first question is professional judgement."
    },
    {
      "id": "personal-data",
      "name": "Personal data",
      "layer": "overlay",
      "trigger": "personal-data",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Personal data\n\nSwitched on when the event is a cyber incident or data breach.\nAn overlay is chosen by the intake answers, not by the event.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "stage-unfolding",
      "name": "Still unfolding",
      "layer": "overlay",
      "trigger": "stage-unfolding",
      "version": "0.1.0",
      "status": "draft",
      "last_reviewed": null,
      "review_by": null,
      "changelog": [
        "0.1.0 — stub. Structure only; no checks written."
      ],
      "rests_on": "Nothing yet. This is a stub and applies to no review until it has content and a status of active.",
      "elements": [],
      "triggers": [],
      "questions": [],
      "prose": "# Still unfolding\n\nSwitched on when the situation is not yet public, or still unfolding.\nAn overlay is chosen by the intake answers, not by the event.\n\n## Source\n\nNot yet written. This file exists so the layer is in place and the resolver\nskips it; it carries no checks and reaches no review while its status is\ndraft.\n\n## Basis\n\nNot yet written."
    },
    {
      "id": "workforce-impact",
      "name": "Workforce impact",
      "layer": "overlay",
      "trigger": "workforce-impact",
      "version": "0.3.1",
      "status": "active",
      "last_reviewed": "2026-09-25",
      "review_by": "2027-03-25",
      "rests_on": "EU collective-redundancy and consultation directives and US WARN rules, which govern formal notices; applying their content to employee messages is professional judgement.",
      "changelog": [
        "0.3.1 — basis notes moved into the file",
        "0.3.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed.",
        "0.2.0 (2026-09-25): reconciled with workforce-reduction 1.0.0. Takes over its five law-related elements word for word (adding only \"where roles end\" / \"no roles are affected\" so they fit events where job loss isn't certain), four of its triggers and three of its questions. Adds EU and US law as sources, and four new triggers. Trigger narrowed: policy-change and labor-dispute no longer fire it.",
        "0.1.0 (2026-09-25): first draft from the geopolitical source review."
      ],
      "elements": [
        {
          "id": "workforce-impact.decision-status",
          "name": "Decision status",
          "means": "Whether the decision is final, proposed, or in consultation.",
          "weight": "core",
          "dimension": "accountability_agency",
          "basis": "law",
          "sources": [
            "eu-directive-2002-14",
            "eu-directive-98-59"
          ],
          "basis_note": "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."
        },
        {
          "id": "workforce-impact.scope-of-impact",
          "name": "Scope of impact",
          "means": "How many are affected, in which functions, sites and countries, or that the group is still being set, or plainly that no roles are affected.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact",
          "basis": "law",
          "sources": [
            "eu-directive-98-59",
            "us-warn-20-cfr-639"
          ],
          "basis_note": "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."
        },
        {
          "id": "workforce-impact.selection-basis-and-alternatives",
          "name": "Selection basis and alternatives",
          "means": "Where roles end, how roles or people were chosen, the group chosen from, and what was tried first — voluntary exit, redeployment, a hiring freeze.",
          "weight": "core",
          "dimension": "fairness_independence_conflicts",
          "basis": "law",
          "sources": [
            "eu-directive-98-59"
          ],
          "basis_note": "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."
        },
        {
          "id": "workforce-impact.individual-notice-timing-and-terms",
          "name": "Individual notice, timing and terms",
          "means": "Where roles end, how and when each affected person is told, with notice dates, last day and pay terms, or where those will be found and by when.",
          "weight": "core",
          "dimension": "stakeholder_respect_impact",
          "basis": "law",
          "sources": [
            "us-warn-20-cfr-639",
            "eu-directive-98-59"
          ],
          "basis_note": "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."
        },
        {
          "id": "workforce-impact.voice-and-what-can-still-change",
          "name": "Voice and what can still change",
          "means": "What employees or their representatives can still influence, kept separate from what leadership has already decided.",
          "weight": "core",
          "dimension": "listening_employee_voice",
          "basis": "law",
          "sources": [
            "eu-directive-2002-14",
            "eu-directive-98-59"
          ],
          "basis_note": "EU and US law governing formal notices to representatives and authorities; applying it to employee messages is professional judgement."
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
          "check": "The decision is attributed to a parent company, head office or group (\"the group has decided\", \"as directed by our parent\") and the draft doesn't say what the local organization decided or owns.",
          "dimension": "accountability_agency",
          "review": [
            "Legal",
            "HR"
          ]
        },
        {
          "check": "The draft gives less notice than planned or says the change takes effect immediately, and gives no reason for the shortened notice.",
          "dimension": "causation_explanation",
          "review": [
            "Legal",
            "HR"
          ]
        },
        {
          "check": "The draft withholds information on grounds of confidentiality without saying why or for how long.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal"
          ]
        },
        {
          "check": "The draft says employees or representatives have been consulted, or that consultation is complete, while the supplied context shows it hasn't started or finished.",
          "dimension": "truthfulness_factual_discipline",
          "review": [
            "Legal",
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
          "ask": "Were affected employees assessed for internal mobility or redeployment before selection?",
          "review": [
            "HR"
          ]
        },
        {
          "ask": "Does this draft match the formal notice given to employee representatives or authorities, and what they were told in writing?",
          "review": [
            "HR",
            "Legal"
          ]
        }
      ],
      "prose": "## What this overlay does\n\nIt carries the checks every job-affecting decision needs, whatever the event: whether the decision is final, who is affected, how people were chosen, how and when each person hears, and what can still change. They were written for the workforce-reduction protocol and are moved here word for word, so they also apply to site closures, and to cost-cutting, market exits and mergers when employees are an audience.\n\n## Source\n\nThe five elements were written as professional judgement and practitioner guidance in the workforce-reduction protocol (EEOC, US Department of Labor, Fair Work Ombudsman, CIPD). That protocol states that **nothing in it rests on EU collective-redundancy rules.** This overlay adds that basis:\n\n- **Decision status; Voice and what can still change:** Directive 2002/14/EC, Article 4 (information and consultation \"in particular where there is a threat to employment\"); Directive 98/59/EC (consultation on collective redundancies). Geopolitical review 1.1, 1.2.\n- **Scope of impact:** Directive 98/59/EC, Article 2(3): number and categories affected and the period. 20 CFR 639.7: job titles, numbers per classification, dates and schedule. Geopolitical review 1.2, 1.5.\n- **Selection basis:** Directive 98/59/EC, Article 2(3): \"the criteria proposed for the selection of the workers to be made redundant.\"\n- **Individual notice, timing and terms:** 20 CFR 639.7 (dates and schedule); Directive 98/59/EC, Article 2(3) (method for calculating payments).\n- **New triggers:** Directive 98/59/EC Art. 2(4) (parent-company decisions); 20 CFR 639.9 (reason for shortened notice); Directive 2002/14/EC Art. 6 and Directive (EU) 2025/2450 (reasons for confidentiality; applicable from 2029, article number unverified).\n\n**These laws govern formal notices to representatives and authorities, not employee messages.** Applying their content to a message is professional judgement: an employee message that says less than the formal notice is a checkable gap. Label it that way in the Library.\n\nThe workforce-reduction protocol's guidance sources (EEOC, DOL, Fair Work, CIPD) were not re-read for this overlay and are not attached to individual elements here; they stay listed on that protocol.\n\n## Limits\n\n- Directive 98/59/EC read from the UK retained copy, Article 2 only.\n- EU national transposition, US state mini-WARN laws and Directive 2009/38/EC (European Works Councils) were not reviewed.\n- Labor-relations law during strikes and bargaining was not reviewed; the overlay does not fire for \"Strike or labor dispute\" or \"Major policy change\"."
    }
  ];
