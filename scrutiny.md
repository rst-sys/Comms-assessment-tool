---
id: scrutiny
name: Public scrutiny and reputation
layer: family
version: 0.1.0
status: draft
last_reviewed: 2026-09-26
review_by: 2027-03-26
rests_on: >-
  Research consensus on correcting false claims, EU and NYSE rules on rumours about listed companies, the SEC rule on shareholder campaigns, and a large study of online backlash.
changelog:
  - "0.1.0 (2026-09-26): first draft from the Public scrutiny family source review."

narrows:
  - core.estimates_as_estimates

elements:
  - id: scrutiny.criticism-stated-fairly
    name: What is being said, stated fairly
    means: The draft says what criticism, claim or demand it is responding to, in terms the people who raised it would recognise, and who raised it where that is already public. A false claim is stated once, just before the correction.
    weight: core
    dimension: listening_employee_voice
    basis: judgement
    sources: []
  - id: scrutiny.correction-fact-first
    name: A correction that leads with the fact
    means: Where the draft corrects a false or inaccurate claim, it leads with the accurate fact, refers to the false claim once, says why it is wrong, points to evidence readers can check, and ends on the fact.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: guidance
    sources: [lewandowsky-2020-debunking]
    basis_note: "An expert consensus of 22 misinformation researchers (The Debunking Handbook 2020), written mainly about public-interest topics; applied to claims about organizations as professional judgement."
  - id: scrutiny.no-denial-of-what-is-true
    name: No denial of what is true
    means: The draft doesn't deny, or dismiss as rumour or speculation, a claim the supplied context shows is accurate or partly accurate. Where the organization can't comment, it says so plainly rather than implying the claim is false.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [eu-mar-2014-596, nyse-lcm-202-03]
    basis_note: "Binding for listed companies: EU law requires disclosure when an accurate rumour concerns inside information whose release was delayed, and NYSE rules call for a candid statement when rumours are correct. Applied to all organizations as professional judgement."
  - id: scrutiny.position-and-reasons
    name: A position, with reasons
    means: The draft says what the organization accepts, what it doesn't and why, and whether anything will change as a result, giving its reasoning rather than only regret or sympathy.
    weight: core
    dimension: causation_explanation
    basis: research
    sources: [herhausen-2019-firestorms]
    basis_note: "One large study of 472,995 negative posts on 89 large US companies' Facebook pages found that explanation contained backlash better than empathy; applied beyond social media as professional judgement."

triggers:
  - check: The draft questions critics' motives or character ("agenda-driven", "a vocal minority", "misinformed activists", "short-term investors") instead of answering what they said, where the supplied context doesn't support the charge.
    dimension: stakeholder_respect_impact
    review: [Legal, Investor relations]
  - check: The draft offers conditional or deflecting regret ("we regret if anyone was offended", "we're sorry you feel that way", "any offense caused") in place of addressing what was said or done.
    dimension: accountability_agency
  - check: The draft opens with the false claim (in the headline or first sentence) or repeats it more than once, rather than leading with the accurate fact.
    dimension: truthfulness_factual_discipline
  - check: The draft calls a claim "false", "misleading" or "misinformation" without saying what is true or pointing to evidence.
    dimension: truthfulness_factual_discipline
  - check: The draft says the organization has "listened" or "heard the feedback" without saying what, if anything, will change.
    dimension: listening_employee_voice

questions:
  - ask: Would responding spread the claim or criticism to people who haven't seen it, and is a response still the right call?
    review: [Executive]
  - ask: Is every fact used to answer the claim verified, and can the evidence the draft points to be published?
    review: [Legal]
  - ask: If the organization is listed, does the rumour touch information whose disclosure has been delayed, and has counsel confirmed whether it must now be disclosed?
    review: [Legal, Investor relations]
  - ask: If this is part of a shareholder campaign or proxy contest, has counsel reviewed the draft as a solicitation?
    review: [Legal, Investor relations]
---

## What this protocol is

The shared checks for every event in the Public scrutiny family: backlash to something the organization said or did; rumours or misinformation about it; and pressure from activists, campaigners or investors. None of these events has its own protocol.

*No denial of what is true* is a sharper form of the core protocol's *Estimates marked as estimates*: where both fire, the tool raises one finding. Where the user's purpose is to apologize, the Apology overlay's checks on regret also apply.

## Source

**Binding law and listing rules, read in the parts cited:**

- Regulation (EU) No 596/2014 (Market Abuse Regulation), Article 17(7), read from the UK retained copy. https://www.legislation.gov.uk/eur/2014/596/article/17
- NYSE Listed Company Manual, Section 202.03, read from the 2015 rule-filing exhibit. https://www.sec.gov/files/rules/sro/nyse/2015/34-75809-ex5.pdf
- SEC Rule 14a-9 and its Note, 17 CFR 240.14a-9 (basis for the trigger on attacking critics' character, and the proxy question). https://www.law.cornell.edu/cfr/text/17/240.14a-9

**Expert consensus:** Lewandowsky, Cook, Ecker et al. (2020), *The Debunking Handbook 2020*, doi:10.17910/b7.1182.

**Research:** Herhausen, Ludwig, Grewal, Wulf & Schoegel (2019), *Journal of Marketing* 83(3).

**Declared professional judgement:** *What is being said, stated fairly*; applying each source beyond its setting; the wording of all five triggers.

Full source review: `sources/reviews/scrutiny-family-source-review.md`.

## What this protocol does not cover

- Whether to respond at all. The first reviewer question asks; no source gives a rule.
- Defamation, platform takedowns, and proxy filings beyond Rule 14a-9: for counsel.
- Whether the criticism is justified. The tool checks the message.
