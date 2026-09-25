---
id: listed-company
name: Listed company disclosure
layer: overlay
trigger: org_type = publicly_listed
version: 0.2.0
status: draft
last_reviewed: 2026-09-25
review_by: 2027-03-25
rests_on: >-
  US and EU securities disclosure law, applied to every message from a listed organization; its extension to employees and partners is professional judgement.
changelog:
  - 0.2.0 (2026-09-25): made to pass the build checker: added rests_on and a Source heading. No element, trigger or question changed.
  - 0.1.0 (2026-09-25): first draft, built from sources already opened in the CEO departure source review. No new research.

elements:
  - id: listed-company.no_half_truth
    name: Nothing left out that makes the rest misleading
    means: Where the draft describes the financial effect, cause or outlook of the event, it doesn't leave out a fact the supplied context shows would change how a reader understands what it does say.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [sec-rule-10b5]
  - id: listed-company.same_to_all
    name: The same material facts for every audience
    means: The material facts in the draft match what the organization is telling investors and the market, and the draft doesn't give one audience (employees, analysts, partners) material information that the others don't get at the same time.
    weight: core
    dimension: fairness_independence_conflicts
    basis: law
    sources: [sec-regulation-fd, eu-impl-reg-2016-1055]
  - id: listed-company.eu_notice_form
    name: Named sender, date and time (EU inside information)
    means: Where the draft is the public disclosure of inside information, it names the person making the notification with their position, gives the date and time, and says that it contains inside information.
    weight: supporting
    dimension: verification_follow_through
    basis: law
    sources: [eu-impl-reg-2016-1055]
    applies_if: { jurisdiction: [EU], format: [investor_disclosure, press_release] }

triggers:
  - check: The draft describes the event as having little or no financial effect, or gives a positive outlook, while the supplied context shows costs, losses, liabilities or uncertainty the draft doesn't mention.
    dimension: truthfulness_factual_discipline
    review: [Legal, Investor relations]
  - check: The draft is addressed to employees, customers or partners and contains figures, dates or decisions that the supplied context doesn't show being released to the market at the same time.
    dimension: fairness_independence_conflicts
    review: [Legal, Investor relations]

questions:
  - ask: Is anything in this draft inside information or material non-public information, and has counsel confirmed when and how it must be released to the market? Counsel must confirm which rules apply.
    review: [Legal, Investor relations]
  - ask: Will the market, employees and other audiences receive the material facts at the same time? If not, who hears first, and is that permitted?
    review: [Legal, Investor relations]
  - ask: Will a later filing (an annual report, proxy statement or remuneration report) show something this draft contradicts or leaves out?
    review: [Legal, Investor relations]
---

## What this overlay does

It adds the checks that securities disclosure rules make relevant to **any** message from a listed organization, whatever the event. Rules written for one event (for example the Form 8-K departure deadline, or the EU rule that a board's removal decision triggers disclosure) stay in that event's protocol.

The framework prompt already flags securities questions for specialist review. This overlay doesn't judge compliance. It checks whether the message's content is complete and consistent enough to raise the questions counsel must answer.

## Source

- **Nothing left out that makes the rest misleading:** US Rule 10b-5(b), 17 CFR 240.10b-5, which bars omitting "a material fact necessary in order to make the statements made, in the light of the circumstances under which they were made, not misleading." Opened and read (CEO review 2.4).
- **Same facts for every audience:** US Regulation FD, 17 CFR Part 243, which requires public disclosure "simultaneously" when material non-public information is disclosed intentionally to certain market professionals and holders (CEO review 2.3). EU Implementing Regulation 2016/1055, which requires inside information to be disseminated "to as wide a public as possible on a non-discriminatory basis" and "simultaneously throughout the Union" (CEO review 2.7).
- **Named sender, date and time:** EU Implementing Regulation 2016/1055, Article 2 (CEO review 2.7).

Reg FD's selective-disclosure rule covers market professionals and securityholders, not employees as such. The *same facts for every audience* element extends its logic to employees and partners because a leak from those audiences is the usual route to selective disclosure. That extension is **professional judgement** and should be labelled so in the Library.

## Limits

- **MAR Article 17 was not read in the original** (CEO review §7): the "as soon as possible" duty and the conditions for delay are known only through instruments that cite it. Read it before this overlay is marked active.
- US coverage is SEC registrants and NYSE-listed companies. **Nasdaq rules and foreign private issuers (Form 6-K) were not verified.**
- EU coverage is issuers within MAR's scope. National rules in most member states were not reviewed. The UK is not covered.
- The overlay can't tell from the draft whether information is material or inside information. It asks.
