---
id: allegations
name: Allegations and misconduct
layer: family
version: 0.2.0
status: active
last_reviewed: 2026-09-26
review_by: 2027-03-26
rests_on: >-
  EU and US law protecting whistleblowers, the EU presumption of innocence (binding on authorities, applied by analogy), US prosecutors' criteria for internal investigations, and research on denial after trust violations.
changelog:
  - "0.2.0 (2026-09-26): after a dry run on two memos, the 'baseless' trigger also covers vouching for the accused while the matter is open; the 'take very seriously' trigger also fires beside a dismissal of the allegations; 'Who is finding out' names the court or regulator as the reviewer for lawsuits and regulatory action."
  - "0.1.0 (2026-09-26): first draft from the Allegations family source review."

narrows:
  - core.estimates_as_estimates

elements:
  - id: allegations.alleged-vs-established
    name: What is alleged, and what is established
    means: The draft says what has been alleged and what, if anything, has been established, and keeps the two apart. Until the facts are established it neither treats the allegation as proven nor denies it outright, unless the supplied context shows it is false.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [eu-directive-2016-343, kim-2004]
    basis_note: "The EU presumption of innocence binds public authorities in criminal cases; applied to organizations by analogy. One set of experiments (Kim et al. 2004) found apology repairs trust better than denial once evidence of guilt emerges."
  - id: allegations.who-investigates
    name: Who is finding out, and how independently
    means: The draft says who is investigating or reviewing the matter (for a lawsuit or regulatory action, the court or regulator, and any internal review), how independent they are of the people involved, and what will happen to the findings (published, summarized, or reported to whom).
    weight: core
    dimension: fairness_independence_conflicts
    basis: guidance
    sources: [doj-eccp-2024]
    basis_note: "US prosecutors assess whether internal investigations are properly scoped, independent, objective and documented; written for investigations, applied to messages as professional judgement."
  - id: allegations.protection-for-those-who-report
    name: Protection for those who raised concerns
    means: The draft doesn't identify the people who raised the concern or question their motives. Where it goes to employees, it says how to raise concerns and that retaliation is not allowed, and nothing in it discourages reporting to a regulator.
    weight: core
    dimension: listening_employee_voice
    basis: law
    sources: [eu-directive-2019-1937, sox-18-usc-1514a, sec-rule-21f-17]
    basis_note: "Binding under EU whistleblower law (reporters' identity kept confidential; harm to their reputation counts as retaliation) and, for US listed companies, US law (no retaliation; no impeding reports to the SEC). Applied to organizations and public statements as professional judgement."
  - id: allegations.steps-while-open
    name: Steps taken while the matter is open
    means: The draft says what has been done while the matter is open (for example, a person on leave or stepping back from duties, or safeguards for the people affected), and makes clear that such steps are not a finding.
    weight: supporting
    dimension: corrective_action_proof
    basis: judgement
    sources: []

triggers:
  - check: The draft calls the allegations "unfounded", "baseless" or "false", or vouches for the accused person's character or record, while the matter is open or where the supplied context doesn't show the allegations are false.
    dimension: truthfulness_factual_discipline
    review: [Legal]
  - check: The draft calls an investigation "independent", "thorough" or "comprehensive" without saying who carries it out or to whom they report.
    dimension: fairness_independence_conflicts
    review: [Legal]
  - check: The draft describes the people who raised the concern in a way that could identify them, or questions their motives or timing ("a disgruntled former employee", "the timing is suspicious").
    dimension: listening_employee_voice
    review: [Legal, HR]
  - check: The draft says the organization "takes these allegations very seriously", or similar, in place of saying what is being done, or alongside a dismissal of the allegations.
    dimension: corrective_action_proof
  - check: The draft presents a settlement, dismissal or closed inquiry as proof there was no wrongdoing, when it wasn't a finding on the facts.
    dimension: truthfulness_factual_discipline
    review: [Legal]

questions:
  - ask: Could anything in this draft identify, or let colleagues work out, who raised the concern or who is accused?
    review: [Legal, HR]
  - ask: Have the investigators agreed the draft's description of the investigation, including who runs it, how independent they are and what happens to the findings?
    review: [Legal]
  - ask: Could any sentence here be read as a finding, either way, before the investigation ends?
    review: [Legal]
  - ask: If a court or regulator is involved, does the draft match what has been filed, and do any settlement or confidentiality terms limit what it can say?
    review: [Legal]
---

## What this protocol is

The shared checks for every event in the Allegations family: allegations against a leader; harassment, discrimination or culture allegations; fraud or financial misconduct; and investigations, lawsuits or regulatory action. None of these events has its own protocol.

*What is alleged, and what is established* is a sharper form of the core protocol's *Estimates marked as estimates*: where both fire, the tool raises one finding. Where people have been harmed, the People harmed overlay applies as usual. Where an allegation has led to a leader's exit and the user files the message as a departure, the CEO departure protocol applies instead of this family.

## Source

**Binding law, read in the parts cited:**

- Directive (EU) 2019/1937 (Whistleblower Directive), Articles 16, 19 and 22. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L1937
- Sarbanes-Oxley Act § 806, 18 U.S.C. § 1514A(a). https://www.law.cornell.edu/uscode/text/18/1514A
- SEC Rule 21F-17(a), 17 CFR 240.21F-17. https://www.ecfr.gov/current/title-17/chapter-II/part-240/subject-group-ECFR3bd6e6ae1e9d09d/section-240.21F-17
- Directive (EU) 2016/343 (presumption of innocence), Articles 2 and 4(1); binds public authorities only, used by analogy. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016L0343

**Official guidance:** US Department of Justice, *Evaluation of Corporate Compliance Programs* (updated September 2024). https://www.justice.gov/criminal/criminal-fraud/page/file/937501/dl

**Research:** Kim, Ferrin, Cooper & Dirks (2004), *Journal of Applied Psychology* 89(1), abstract only.

**Declared professional judgement:** applying each source to public statements and beyond its jurisdiction; *Steps taken while the matter is open*; the wording of all five triggers.

**Not used:** the EEOC's 2024 harassment guidance (rescinded 22 January 2026) and the SEC's "no-deny" settlement policy (rescinded 18 May 2026).

Full source review: `sources/reviews/allegations-family-source-review.md`.

## What this protocol does not cover

- Whether a statement is defamatory, privileged or allowed under a settlement. The reviewer questions ask; counsel decides.
- Data protection for allegations and criminal-offence data (the Personal data overlay, when built).
- Whether the investigation itself is sound. The tool checks the message.
