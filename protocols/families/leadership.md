---
id: leadership
name: Leadership change
layer: family
version: 0.3.0
status: active
last_reviewed: 2026-09-26
review_by: 2027-03-26
rests_on: >-
  US securities disclosure rules for appointments and board disputes, applied to announcements and to all organizations as professional judgement; no rule governs death announcements.
changelog:
  - "0.3.0 (2026-09-26): after a dry run on two messages about three employees killed in an air crash, the death check asks who holds responsibilities only for the death of a leader; new trigger for those who died left nameless with no reason given."
  - "0.2.0 (2026-09-26): after a dry run on two CEO appointment releases, the check on ties behind an appointment became a trigger (fires only when a tie is shown and not mentioned) and a question, since announcements rarely state ties and filings carry them; the CEO departure protocol's question on the character of a departure added word for word, so succession announcements get it and the checklist removes it as a duplicate on departure drafts."
  - "0.1.0 (2026-09-26): first draft from the Leadership family source review."

elements:
  - id: leadership.who-holds-the-role
    name: Who holds the role, and from when
    means: The draft says who holds the role and its authority, from what date, and whether the arrangement is interim; if interim, how and roughly when a permanent choice will be made.
    weight: core
    dimension: accountability_agency
    basis: law
    sources: [sec-form-8k]
    basis_note: US listed companies must file the name, position and date of a new officer; applying this to all announcements and organizations is professional judgement.
  - id: leadership.how-decided
    name: How the decision was made
    means: The draft says which body made the decision (board, trustees, members) and, for an appointment, how the person was chosen (succession plan, search, internal process).
    weight: supporting
    dimension: accountability_agency
    basis: judgement
    sources: [sec-slb-14e]
    basis_note: SEC staff treat succession planning as a governance matter; no rule requires an announcement to describe the process.
  - id: leadership.disagreement-described
    name: A disagreement described, or openly withheld
    means: Where a leader or director leaves, or the board is divided, over a disagreement, the draft says what the disagreement concerned, or says plainly that it won't.
    weight: core
    dimension: truthfulness_factual_discipline
    basis: law
    sources: [sec-form-8k]
    basis_note: US listed companies must briefly describe a departing director's disagreement; applying this to leaders and other organizations is professional judgement.
  - id: leadership.death-with-care
    name: A death announced with care
    means: Where the event is a death, the draft shares only facts the family has agreed to, does not speculate about the cause, and tells colleagues what support is available. For the death of a leader, it also says who holds their responsibilities for now.
    weight: supporting
    dimension: stakeholder_respect_impact
    basis: judgement
    sources: []

triggers:
  - check: An appointment is announced as a biography or tribute, with no word on who made the decision or how the person was chosen.
    dimension: accountability_agency
  - check: A death announcement gives or hints at a cause of death, or private details, not attributed to the family's wishes.
    dimension: stakeholder_respect_impact
    review: [HR, Legal]
  - check: The draft refers to those who died only as "employees", "members of the [company] family" or "those involved", with no names and no explanation that names are being withheld (for example, at the families' request).
    dimension: stakeholder_respect_impact
    review: [HR]
  - check: The draft or the supplied context shows a tie behind an appointment (a family relationship, an investor's nominee, a board member stepping into the role, prior business dealings) and the draft doesn't mention it.
    dimension: fairness_independence_conflicts
    review: [Legal, Investor relations]

questions:
  - ask: Was this departure the leader's decision, the board's, or negotiated between them — and would the draft's description still stand if the separation terms were published?
    review: [Legal, Executive]
  - ask: Is there any arrangement, family relationship or financial tie behind this appointment that a filing will show, and is the announcement consistent with it?
    review: [Legal, Investor relations]
  - ask: Has the family agreed to what is said, and have close colleagues been told before the wider announcement?
    review: [HR]
  - ask: Is there a succession plan, and can the draft say so without committing to names or dates it can't keep?
    review: [Executive]
---

## What this protocol is

The shared checks for every event in the Leadership family: CEO or senior-leader departures, new appointments, board changes or disputes, and the death of a leader or employee. It matters most for the three events without their own protocol.

On CEO departure drafts, that protocol's *Who holds the authority now* replaces this family's *Who holds the role, and from when*, and its trigger on a departing board member's unexplained "differences" is a sharper form of *A disagreement described, or openly withheld*.

## Source

**Binding law (US listed companies), read in the parts cited:**

- SEC Form 8-K, Item 5.02(a), (c) and (d). https://www.sec.gov/files/form8-k.pdf
- Regulation S-K Item 401(b), (d) and (e), 17 CFR 229.401. https://www.ecfr.gov/current/title-17/chapter-II/part-229/subpart-229.400/section-229.401

**Other law:** GDPR Recital 27 (does not apply to deceased persons' data). https://gdpr-info.eu/recitals/no-27/

**Regulator guidance, read for the CEO departure review:** SEC Staff Legal Bulletin 14E (succession planning); SEC C&DI 217.04 (a death is not a Form 8-K departure).

**Declared professional judgement:** *How the decision was made*; *A death announced with care*; the wording of all four triggers; applying filing rules to announcements and to organizations that aren't US-listed.

Full source review: `sources/reviews/leadership-family-source-review.md`.

## What this protocol does not cover

- Whether a filing is required, or its timing. The Listed company overlay asks; counsel decides.
- Nonprofit, public-body and private-company governance rules.
- A death caused by an incident at work: enter it as "Workplace accident or serious injury", which brings the Incident family and the People harmed overlay.
