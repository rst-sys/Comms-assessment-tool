---
id: ceo-departure
name: CEO or senior-leader departure
layer: event
events:
  - CEO or senior leader departure
version: 1
status: active
rests_on: >-
  US securities law for listed companies — Form 8-K, Regulation FD, Rule 10b-5 — plus professional judgment for everything else.

elements:
  - name: Character of the departure
    means: The draft says whether the leader chose to go, was asked to go, left by negotiated agreement or was removed, or says plainly that this is not being disclosed.
    weight: core
    dimension: truthfulness_factual_discipline
  - name: Reason, or declared withholding of it
    means: The draft either gives the reason for the departure or states that the reason is not being given, rather than leaving the gap unacknowledged or filling it with a stock phrase.
    weight: core
    dimension: causation_explanation
  - name: Decision date and effective date
    means: The draft distinguishes when the decision was taken or notice given from when the departure takes effect.
    weight: core
    dimension: truthfulness_factual_discipline
  - name: Who holds the authority now
    means: The draft names who holds the departing leader's authority from the departure date, whether that arrangement is interim, and how and roughly when a permanent appointment will be made.
    weight: core
    dimension: accountability_agency
  - name: The organization's own voice
    means: The account of the departure comes from the body that made or accepted the decision, not only from a quotation attributed to the departing leader.
    weight: supporting
    dimension: accountability_agency
  - name: Separation terms acknowledged
    means: Where there is a separation agreement, payment, consultancy or continuing role, the draft says it exists and where its terms are or will be disclosed.
    weight: supporting
    dimension: fairness_independence_conflicts
  - name: Continuity of the leader's commitments
    means: The draft says whether strategies, commitments or relationships closely tied to the departing leader continue, are under review, or end.
    weight: supporting
    dimension: stakeholder_respect_impact
  - name: A clean channel
    means: The departure is not announced in the same document as unrelated significant news that would draw attention away from it.
    weight: supporting
    dimension: fairness_independence_conflicts

triggers:
  - check: The departure is described as a retirement, a personal choice or a mutual decision, yet the same draft says it takes effect immediately, names an interim leader with no transition period, or refers to an investigation, review or board inquiry — and does not reconcile the two.
    dimension: truthfulness_factual_discipline
    review: [Legal, Executive]
  - check: The departure shares the draft with unrelated significant news — results, an acquisition, a restructuring, a major product launch — and the draft does not explain any connection between them.
    dimension: fairness_independence_conflicts
    review: [Investor relations]
  - check: No one is named as holding the departing leader's authority from the departure date, or an interim leader is named with no indication of how or when a permanent appointment will be made.
    dimension: accountability_agency
    review: [Executive]
  - check: The only explanation of why the leader is leaving appears in a quotation attributed to the departing leader, and the organization says nothing in its own voice about the decision.
    dimension: accountability_agency
  - check: The draft gives an effective date on or before the publication date but no date for when the decision was taken or notice given.
    dimension: truthfulness_factual_discipline
    review: [Legal, Investor relations]
  - check: A departing board member is said to be leaving over differences, a disagreement or a divergence of views on direction, and the draft does not say what the disagreement was about.
    dimension: truthfulness_factual_discipline
    review: [Legal]

questions:
  - ask: Was this departure the leader's decision, the board's, or negotiated between them — and would the draft's description still stand if the separation terms were published?
    review: [Legal, Executive]
  - ask: Is there a separation agreement with non-disparagement, confidentiality or agreed-statement terms, and has the draft been checked against it and against what later remuneration or proxy disclosures will show?
    review: [Legal, Investor relations]
  - ask: If the organization is listed, when did any regulatory disclosure clock start — on notice of the decision, or on the governing body's decision — and does the planned publication time fit it? Counsel must confirm which rules apply.
    review: [Legal, Investor relations]
  - ask: In what order will employees, the leader's direct reports, key customers and the market learn of this, and could telling any group early amount to selective disclosure? Counsel must confirm.
    review: [HR, Legal, Investor relations]
  - ask: Which strategies, commitments or relationships depended most on the departing leader, and what does the organization intend for each?
    review: [Executive]
  - ask: If this account is later contradicted — by an investigation, litigation, a filing or the departing leader — what will the organization do and how quickly?
    review: [Legal, Executive]

narrows:
  - plain-naming
---

## What this protocol narrows

The core asks for the central fact in ordinary words rather than euphemism. For a
departure, the central fact is *that* the leader is leaving and *how* — not
necessarily *why*. There are legitimate reasons not to give a reason: the
leader's health or family circumstances, an agreement both sides signed, legal
exposure, or an investigation still running. In US securities law, the regulator
considered requiring reasons for officer departures in 2004 and decided against
it, partly to spare departing officers embarrassment and partly because of the
risk of defamation claims.

So this protocol treats **saying plainly that the reason is not being given** as
an acceptable account. What it still flags is a stock phrase — "to spend more
time with family", "to pursue other opportunities", "has decided to retire" —
used where other facts in the draft suggest it is not the whole story. Silence
that is declared is honest. A reassuring phrase standing in for the reason is
the thing to catch.

## Source

This protocol rests on three different kinds of basis. The tool should not
blend them, and each is labelled here.

**1. Binding law — applies only to listed companies in the US and EU.**

- US Securities and Exchange Commission, *Form 8-K*, Item 5.02 and General
  Instruction B.1 (form revision SEC 873, February 2025).
  https://www.sec.gov/files/form8-k.pdf
- US SEC, Release 33-8400 / 34-49424, *Additional Form 8-K Disclosure
  Requirements and Acceleration of Filing Date* (2004).
  https://www.sec.gov/rules/2004/03/additional-form-8-k-disclosure-requirements-and-acceleration-filing-date
  — the Commission's reasons for not requiring officers' reasons, and for
  requiring a description of a director's disagreement.
- US SEC, Division of Corporation Finance, *Compliance & Disclosure
  Interpretations, Exchange Act Form 8-K*, Q117.01 (last updated 24 June 2024)
  — the four-business-day clock runs from notice of the decision, not the
  effective date. Staff guidance, not a Commission rule.
  https://www.sec.gov/rules-regulations/staff-guidance/compliance-disclosure-interpretations/exchange-act-form-8-k
- US SEC, Regulation FD, 17 CFR Part 243.
  https://www.ecfr.gov/current/title-17/chapter-II/part-243
- US SEC, Rule 10b-5(b), 17 CFR 240.10b-5 — no material omission that makes
  what is said misleading.
  https://www.ecfr.gov/current/title-17/chapter-II/part-240/subject-group-ECFR7dcc9448077bb0f/section-240.10b-5
- US SEC, Regulation S-K Item 402(j), 17 CFR 229.402(j) — severance and its
  conditions, including non-disparagement, disclosed in the proxy.
  https://www.ecfr.gov/current/title-17/chapter-II/part-229/subject-group-ECFR6a1ef9c5c8e3e8a/section-229.402
- Commission Delegated Regulation (EU) 2026/789 of 8 April 2026, Annex I row 13
  — the governing body's decision on appointment or removal is the final event
  that triggers disclosure. https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202600789
- Commission Implementing Regulation (EU) 2016/1055, Articles 2 and 3 — named
  sender, date and time, permanent chronological web record.
  https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1055
- Directive 2007/36/EC as amended by Directive (EU) 2017/828, Article 9b —
  remuneration reporting covering former directors and termination payments.
  https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02007L0036-20170609
- NYSE Regulation, *2026 Annual Listed Company Compliance Guidance Letter*
  (27 January 2026). https://www.nyse.com/publicdocs/nyse/markets/nyse/NYSE_2026_Annual_Guidance_Letter.pdf

**2. Documented behavior — justifies suspicion, not a standard.**

- Graffin, S. D., Carpenter, M. A., & Boivie, S. (2011). "What's all that
  (strategic) noise? Anticipatory impression management in CEO succession."
  *Strategic Management Journal*, 32(7), 748–770.
  https://terry.uga.edu/sites/default/files/inline-files/Graffin_Carpenter__Boivie_2011.pdf
  — basis for the clean-channel element and the second trigger.
- Tayan, B., with Gow, I. D., & Larcker, D. F. (2017). "Retired or Fired: How
  Can Investors Tell If the CEO Left Voluntarily?" Harvard Law School Forum on
  Corporate Governance, 8 June 2017.
  https://corpgov.law.harvard.edu/2017/06/08/retired-or-fired-how-can-investors-tell-if-the-ceo-left-voluntarily
  — a summary of Stanford GSB Working Paper No. 3547; basis for the stock
  phrases and the first trigger.
- Independent Directors of the Board of Wells Fargo & Company, *Sales Practices
  Investigation Report* (10 April 2017).
  https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm
  — a documented gap between a board's own finding and its public statement;
  basis for the last question.

**3. Declared professional judgment — no published source.**

The elements *character of the departure*, *reason or declared withholding*,
*who holds the authority now*, *the organization's own voice* and *continuity of
the leader's commitments* are the protocol author's position. No law, standard
or professional code requires them. The PRSA Code of Ethics (which names "lying
by omission" as improper) and the IABC Code of Ethics are consistent with them
but do not address departures and should not be cited as their authority.

## Basis

**The law** is binding and unambiguous, but narrow. It governs the fact, timing,
money and channel of a departure for listed companies. It does not require a
reason for an officer's departure, does not require naming who decided, and
creates no duty to tell employees anything. It was written to protect
securities markets, not to secure an account for the people affected. Several
points were read only in part or through secondary instruments — in particular,
the operative text of Article 17 of the EU Market Abuse Regulation was not
opened, and the Nasdaq listing rules and the full Form 8-K Item 5.02 text were
not verified.

**The research** is thin. Graffin et al. is the strongest source: 601 Fortune
1000 CEO successions from 1999 to 2004, finding unrelated self-controlled news
announced within a day of 20% of successions against an 11.4% baseline. The
authors say they infer intent from that gap rather than observe it. The
voluntary-versus-forced finding — published estimates of forced departures
ranging from 3% to 40% — comes from a summary of a working paper that has not
been peer-reviewed, and the paper itself was not read. The Wells Fargo report
was read in part.

**What no one has measured** is whether a more candid departure announcement
produces more trust, less rumor, better retention or any other outcome. This
protocol's central position — that an account should give a reason or say it is
withholding one — is judgment, not evidence.

## What this protocol does not cover

- **It cannot tell from the draft whether a departure was forced.** It flags
  contradictions inside the draft, not suspicions about the facts behind it.
- **It cannot check against documents it has not seen** — the separation
  agreement, the board minutes, the regulatory filing, or the next proxy. The
  questions ask the author to make those checks.
- **It does not judge legal compliance.** Where it mentions disclosure
  clocks or selective disclosure, an obligation *may* apply; counsel must
  confirm.
- **Its legal grounding covers only listed companies in the US and EU**, and in
  the EU only the instruments named above; national codes and regulator
  practice in most member states were not reviewed. For private companies,
  nonprofits, arts organizations, public bodies, and US-listed foreign
  issuers, the protocol applies reasoning borrowed from securities law by
  analogy, with no authority behind the transfer. The UK is not covered.
- **Sector rules are not covered** — banking, insurance, broker-dealer and
  similar regimes may impose different requirements, including on reasons.
- **It does not decide what should be said when an agreement limits what can be
  said.** It asks whether the draft is consistent with that agreement; it does
  not resolve the tension between confidentiality and candour. A human must.
- **A departure caused by death** is not what this protocol was written for and
  should be reviewed with care.
