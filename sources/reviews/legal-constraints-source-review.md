# Source review: Legal constraints (apology laws and what can be said without admitting liability)

**Purpose:** groundwork for a "Legal constraints" option, so that when counsel limits what a message may say, the tool treats declared limits as constraints rather than evasion, and helps the writer see what can still be said.
**Scope:** United States and European Union (the UK noted for comparison only)
**Prepared:** 28 September 2026
**Status:** source review with design recommendations; nothing built. Not legal advice; every point below is for counsel to confirm.

---

## 0. How these sources were read

Same method as the earlier reviews. US rules were read from Cornell LII and Justia; research from publisher and SSRN abstracts. Nothing is cited from memory. The tool itself must never state that anything is legally safe; the framework forbids legal conclusions.

---

## 1. The short answer

Counsel's caution is real but often broader than the law requires. Four findings matter for communicators:

1. **Saying what you are doing to fix the problem is, in US federal courts, generally not evidence of fault.** Federal Rule of Evidence 407: evidence of measures "that would have made an earlier injury or harm less likely to occur" is "not admissible to prove: negligence; culpable conduct; a defect in a product or its design; or a need for a warning or instruction." The stated policy is "encouraging people to take, or at least not discouraging them from taking, steps in furtherance of added safety." (It can be admitted for other purposes, and state rules vary.)
2. **Offering to pay medical and similar costs is not, by itself, evidence of liability.** Federal Rule of Evidence 409 excludes "furnishing, promising to pay, or offering to pay medical, hospital, or similar expenses" to prove liability. But factual admissions made alongside the offer are **not** protected.
3. **Most US states have "apology laws", but they protect sympathy, not admissions of fault, and mostly in healthcare.** In Ho & Liu's study, 36 states had them: 30 limited to healthcare, 6 general. California's, a general one, makes expressions of "sympathy or a general sense of benevolence" relating to an accident inadmissible as an admission of liability, but "a statement of fault … shall not be inadmissible". It covers statements "made to that person or to the family of that person", so a public statement may fall outside it.
4. **Sympathy alone may backfire; full apologies can help resolve disputes.** In Robbennolt's experiment, "a full, responsibility accepting, apology increased the likelihood that the offer would be accepted", while "a partial, sympathy expressing, apology increased participants' uncertainty". And "the nature of the applicable evidentiary rule did not influence the apologies' effect." In medical malpractice, apology laws were associated with faster settlement and smaller payments, most of all in severe cases (Ho & Liu 2011).

**For the EU:** no EU-level apology law was found, and member states' rules weren't reviewed. The UK (outside scope) has a general provision (Compensation Act 2006, s. 2) and a 2025 government consultation on strengthening it.

**What this means for the tool:** when counsel rules out admitting fault, a message can usually still (a) express sympathy and regret for what happened, (b) say plainly what is being done to fix it and prevent it recurring, (c) offer practical help, and (d) say there's something it can't discuss yet, and when it will say more. The tool should ask for those, and phrase its fixes as options to take to counsel, never as demands to admit.

---

## 2. The sources

### Tier 1 — Binding law (US)

**2.1 Federal Rule of Evidence 407, Subsequent Remedial Measures, with the Advisory Committee note.**
Link read: https://www.law.cornell.edu/rules/fre/rule_407
*Read status:* opened and read (the rule and the note's policy sentence, as returned).
*Key material:* quoted above. Applies in federal courts; most states have similar rules, not surveyed.

**2.2 Federal Rule of Evidence 409, Offers to Pay Medical and Similar Expenses, with the Advisory Committee note.**
Link read: https://www.law.cornell.edu/rules/fre/rule_409
*Read status:* opened and read.
*Key material:* the rule, quoted above; the note says it "does not extend to conduct or statements not a part of the act of furnishing or offering or promising to pay", so accompanying factual statements are not protected.

**2.3 California Evidence Code § 1160(a).**
Link read: https://law.justia.com/codes/california/code-evid/division-9/chapter-3/section-1160/
*Read status:* opened and read.
*Key material:* "The portion of statements, writings, or benevolent gestures expressing sympathy or a general sense of benevolence relating to the pain, suffering, or death of a person involved in an accident and made to that person or to the family of that person shall be inadmissible as evidence of an admission of liability in a civil action. A statement of fault, however, which is part of, or in addition to, any of the above shall not be inadmissible pursuant to this section."
*Note:* one state's law, chosen as an example of a general (not healthcare-only) apology law. Other states differ.

### Tier 5 — Research

**2.4 Robbennolt, J. K. (2003). "Apologies and Legal Settlement: An Empirical Examination." *Michigan Law Review*, 102(3).**
Link read: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=708361
*Read status:* opened, partly read (abstract).
*Design:* experiment; participants read an accident vignette, took the injured party's role and decided whether to accept a settlement offer.
*Findings:* quoted above.
*Weight:* one experiment with vignettes. The best available evidence that sympathy-only statements can backfire and that evidentiary protection doesn't change how apologies are received.

**2.5 Ho, B., & Liu, E. (2011). "Does sorry work? The impact of apology laws on medical malpractice." *Journal of Risk and Uncertainty*, 43(2), 141–167.**
Link read: https://link.springer.com/article/10.1007/s11166-011-9126-0
*Read status:* opened, partly read (abstract).
*Findings:* 36 states with apology laws (30 healthcare-specific, 6 general); difference-in-differences estimates suggest the laws "expedite the resolution process", with "the greatest reduction in average payment size and settlement time in cases involving severe patient outcomes."
*Weight:* a large observational study, medical malpractice only.

### Outside scope, noted only

- **UK:** Compensation Act 2006, s. 2 (an apology or offer of redress "shall not of itself amount to an admission of negligence"); a 2025 Ministry of Justice consultation response on reforming the law of apologies. Found in search results; not read.

---

## 3. What the sources support

| What a constrained message can still do | Support | Caveat |
|---|---|---|
| Express sympathy and regret for what happened | State apology laws (sympathy protected, fault not) | Many states only; healthcare-only in most; may not cover public statements |
| Say what is being done to fix the problem and prevent recurrence | FRE 407 (remedial measures not evidence of negligence) | Federal courts; can be admitted for other purposes; state rules vary |
| Offer practical help, including costs | FRE 409 (offers to pay medical and similar expenses) | Factual admissions alongside the offer aren't protected |
| Say there's something it can't discuss yet, and when it may say more | No law requires or forbids; the tool's existing standard ("declared withholding") | Judgement |
| Accept responsibility, where counsel permits | Robbennolt 2003 (full apologies help settlement); Ho & Liu 2011 | Counsel decides |

---

## 4. How good the evidence is

The rules are binding and clear, but narrow: evidence rules decide what a court may hear, not what a regulator or the public concludes. Apology laws vary by state and mostly cover healthcare. The research is one experiment and one observational study, both in injury and malpractice settings. Enough to show communicators that "say nothing that could be used against us" is often broader than the law requires, and that sympathy alone has costs; not enough to tell any writer what is safe. Every point is for counsel.

---

## 5. Design recommendations for the "Legal constraints" option

**A. Intake.** A checkbox: *"Counsel has limited what this message can say."* Users add the specifics in "Anything else we should know?" (for example, "no admission of fault while litigation is possible").

**B. A small overlay, switched on by the checkbox,** with two checks:
1. *Constraint declared, not hidden:* the draft says plainly that there's something it can't discuss yet (without legal jargon) and when it may say more, rather than filling the gap with a stock phrase or implying there's nothing to say.
2. *Still says what it can:* the draft still gives the facts it can, expresses sympathy or regret for what happened, says what is being done to fix it, and offers practical help.

And one rule for the model (in the overlay, or in OUTPUT_NOTES): when a fix would require an admission the stated constraint rules out, frame it as an action, sympathy or declared-constraint alternative, and add a reviewer question for counsel. Never tell the writer something is legally safe.

**C. How it combines with what's live.**
- *Crisis in progress:* its responsibility check already accepts "what the organization is doing about it" where the context shows counsel has limited admissions. With the checkbox, that condition becomes explicit.
- *Apology overlay:* when both apply, the Apology overlay's "Acknowledged responsibility" should give way to the constraint (superseded_by), so the tool doesn't demand an admission the writer has said they can't make.
- *CEO departure, Public scrutiny:* already accept declared withholding.

**D. A reviewer question** in the checklist: *"Counsel: which of these can the message include — sympathy or regret, the steps being taken, offers of help — and does any state apology law or evidence rule apply here?"*

**E. Later, if testers want it:** a results section, "What you can still say", listing the four kinds of statement in section 3, drawn from the draft's own situation, with the caveat that counsel must confirm.

---

## 6. Could not verify

| Source | Why |
|---|---|
| Federal Rule of Evidence 408 (compromise offers) | Not opened. |
| Apology laws in states other than California | Not surveyed; counts from Ho & Liu (2011), which may be out of date. |
| EU member states' rules on apologies and admissions | Not reviewed. |
| UK Compensation Act 2006, s. 2, and the 2025 consultation response | Search results only; outside scope. |
| Robbennolt (2003) and Ho & Liu (2011), full texts | Abstracts only. |

---

## 7. What nobody has established

1. Whether public statements (as opposed to statements to the injured person) are treated as apologies under state apology laws.
2. Whether declared legal constraints ("we can't comment on fault yet") cost trust compared with silence or a full apology.
3. How regulators, as opposed to courts, treat apologies and remedial statements.

---

## Sources

- [Federal Rule of Evidence 407 (Cornell LII)](https://www.law.cornell.edu/rules/fre/rule_407)
- [Federal Rule of Evidence 409 (Cornell LII)](https://www.law.cornell.edu/rules/fre/rule_409)
- [California Evidence Code § 1160 (Justia)](https://law.justia.com/codes/california/code-evid/division-9/chapter-3/section-1160/)
- [Robbennolt (2003), SSRN abstract](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=708361)
- [Ho & Liu (2011), Journal of Risk and Uncertainty](https://link.springer.com/article/10.1007/s11166-011-9126-0)
