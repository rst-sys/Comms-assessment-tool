# Source review: Incident and disruption family

**Events in the family:** Cyber incident or data breach · System outage or service disruption · Product recall or safety issue · Environmental incident · Workplace accident or serious injury · Supply chain disruption
**Scope:** United States and European Union
**Prepared:** 25 September 2026
**Purpose:** source basis for the Incident family protocol

---

## 0. How these sources were read

Same method as the earlier reviews: pages retrieved with a web-fetch tool that returns extracted text. Quotes are as returned. The NIS2 text was read from a secondary host (springlex.eu) because EUR-Lex returned 404 and another host timed out; verify the wording against the Official Journal before relying on it. Nothing is cited from memory.

---

## 1. The short answer

Only one event in this family has its own protocol (cyber incident). The other five get the core protocol and, where people are harmed, the People harmed overlay. **The gap is outages, recalls, environmental incidents, workplace accidents and supply-chain disruptions.**

The strongest law found speaks to product recalls, and it is unusually specific about *wording*:

- **EU General Product Safety Regulation (2023/988), Article 36:** a recall notice must "clearly describe the risk at stake, avoiding any terms, expressions or other elements that may decrease consumers' perception of the risk," and names "voluntary", "precautionary", "discretionary" and "in rare situations" as such terms. Article 37 requires the recalling business to offer "at least two options between repair, replacement, or adequate refund."
- **US, 16 CFR 1115.27:** a mandatory recall notice must include, among other things, "the word 'recall'", a "clear and concise description of the product's actual or potential hazards", the number of units, the remedy, "consumer actions required", and contact information.

For service disruptions, EU NIS2 (Directive 2022/2555, Article 23) requires covered entities to notify "the recipients of their services of significant incidents that are likely to adversely affect the provision of those services," and to tell those potentially affected by a significant cyber threat "any measures or remedies" they can take.

No source was found that sets message content for environmental incidents, workplace accidents or supply-chain disruption as such.

---

## 2. The sources, by tier

### Tier 1 — Binding law

**1.1 Regulation (EU) 2023/988 on general product safety (GPSR), 10 May 2023; applies from 13 December 2024.**
Link read: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32023R0988
*Read status:* opened, partly read (Articles 36 and 37(1)).
*Key material:* Article 36: recall notices must be "clear, transparent and clearly describe the risk at stake, avoiding any terms, expressions or other elements that may decrease consumers' perception of the risk," including "voluntary", "precautionary", "discretionary" and "in rare situations". Article 37(1): "economic operators initiating a product recall shall offer consumers at least two options between repair, replacement, or adequate refund of the value of the recalled product, except where impossible or disproportionate."
*Binds:* directly applicable in the EU; consumer products within its scope. A 2024 implementing regulation (2024/1435) sets a recall-notice template; not read.

**1.2 16 CFR 1115.27, Recall notice content requirements (US Consumer Product Safety Commission).** Current as of 11 September 2026.
Link: https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115/subpart-C/section-1115.27
*Read status:* opened and read (as summarized by the tool; the list below is its extraction).
*Key material:* the notice must include the word "recall"; its date; a product description; the action being taken (stop sale, repair, replacement, refund); the approximate number of units; a "clear and concise description of the product's actual or potential hazards"; the recalling firm and manufacturers; retailers; regions; manufacture and sale dates; price; a summary of incidents, injuries and deaths; and the remedy, "consumer actions required", and contact information.
*Binds:* mandatory recall notices under the Consumer Product Safety Act. Voluntary recalls follow separate CPSC guidelines (a 2013 Federal Register notice and the CPSC Recall Handbook, neither opened).

**1.3 Directive (EU) 2022/2555 (NIS2), Article 23.**
Link read: https://www.springlex.eu/en/packages/nis2/nis2-directive/article-23/ (secondary host)
*Read status:* opened, partly read (Article 23(1)–(2) as returned).
*Key material:* "Where appropriate, entities concerned shall notify, without undue delay, the recipients of their services of significant incidents that are likely to adversely affect the provision of those services." Essential and important entities must "communicate, without undue delay, to the recipients of their services that are potentially affected by a significant cyber threat any measures or remedies that those recipients are able to take."
*Binds:* member states, through transposition; applies to essential and important entities in listed sectors, not every organization.

### Already reviewed, relevant here

- **CDC CERC** (core review 2.2): "Be Right: … what is known, what is not known, and what is being done to fill in the gaps."
- **Cyber protocol sources** (NIST SP 800-61r3, SEC Form 8-K Item 1.05 guide, HHS Breach Notification Rule, FTC guide): informing the cyber event protocol; not re-read.
- **EU OSH Framework Directive 89/391/EEC** (geopolitical review 1.3): informing workers of serious danger and protective steps; already in the People harmed overlay.

---

## 3. What the sources support

| Check | Support | Basis label |
|---|---|---|
| What happened, and when | Recall-notice rules require the hazard, dates and incidents (US, EU); CERC "Be Right" | judgement, informed by law and guidance |
| The risk stated plainly | GPSR Art. 36 (bans risk-lessening terms in EU recall notices); 16 CFR 1115.27 (hazard description) | law (recalls); judgement for other incidents |
| What still works, and when service returns | NIS2 Art. 23 (notify service recipients of significant incidents) | law (EU covered entities); judgement elsewhere |
| What people are owed, and how to claim | GPSR Art. 37 (choice of repair, replacement, refund); 16 CFR 1115.27 (remedy, actions, contact) | law (recalls); judgement elsewhere |

---

## 4. How good the evidence is

The law is strong, specific and narrow. GPSR and 16 CFR 1115.27 are the most message-specific rules found in any review so far, but they govern **recall notices** only. NIS2 covers **service incidents** at essential and important entities only. Applying their logic to environmental incidents, workplace accidents and supply-chain disruption is professional judgement, and the labels say so.

No research was reviewed for this family. Crisis-communication research relevant to incidents (Coombs 2007; Arpan & Roskos-Ewoldsen 2005) was reviewed for the core protocol.

---

## 5. Known failure patterns

**Documented in a source**
1. Describing a recall as "voluntary", "precautionary", "discretionary" or relevant "in rare situations" (named by GPSR Art. 36 as terms that decrease the perception of risk).

**Practitioner observation, not sourced (label as judgement)**
2. "Out of an abundance of caution" used for an action a regulator required or a known hazard demanded.
3. "Contact customer support" in place of saying what remedy people are owed.
4. "Service has been restored" while the draft also describes continuing effects (the core protocol's certainty check and the cyber protocol's categorical-outcome trigger already cover this).

---

## 6. Scope limits

- **Environmental incidents:** EU Seveso III (2012/18/EU) and Environmental Liability (2004/35/EC) directives, and US EPCRA and CERCLA reporting, not reviewed. Most concern notifying authorities, not public messages.
- **Workplace accidents:** US OSHA reporting rules not reviewed; EU worker information covered only through Directive 89/391/EEC.
- **Food, drugs, vehicles and medical devices:** sector recall regimes (FDA, NHTSA, EU sector rules) not reviewed. GPSR excludes several of these.
- **EU GPSR implementing regulation 2024/1435** (recall-notice template) not read.
- **CPSC voluntary-recall guidelines and Recall Handbook** not read.
- **Supply chain:** nothing specific found.

---

## 7. Could not verify

| Source | Why |
|---|---|
| NIS2 on EUR-Lex | EUR-Lex HTML returned 404; nis2-info.eu timed out. Read from springlex.eu. |
| GPSR on EUR-Lex (HTML) | 404; read from the EUR-Lex PDF instead. |
| Implementing Regulation (EU) 2024/1435 | Found in search results only. |
| CPSC Recall Handbook (2025 technical revision) | Found in search results only. |

---

## 8. What nobody has established

1. Whether naming a restoration time that later slips damages trust more than saying "not yet known."
2. Whether "precautionary" framing reduces consumer response. The EU legislator assumed so; no study was reviewed.
3. What an organization owes the public, as opposed to authorities, after an environmental incident.

---

## Recommendation for the tool

Adopt the four checks in §3 as the Incident family protocol, with two triggers (risk-lessening framing of a required action; a remedy reduced to "contact support") and two questions. The cyber protocol's *What and when* replaces the family's *What happened, and when* for cyber drafts. Product recall is the strongest candidate for its own event protocol: GPSR and 16 CFR 1115.27 together specify more recall content than a family check can carry.

Draft protocol: `protocols/families/incident.md`.

---

## Sources

- [Regulation (EU) 2023/988 (GPSR), EUR-Lex PDF](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32023R0988)
- [16 CFR 1115.27 (eCFR)](https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115/subpart-C/section-1115.27)
- [NIS2 Article 23 (springlex.eu)](https://www.springlex.eu/en/packages/nis2/nis2-directive/article-23/)
- [Implementing Regulation (EU) 2024/1435 (not read)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1435)
- [CPSC Recall Handbook (not read)](https://www.cpsc.gov/s3fs-public/RecallHandbookFINAL9_2technicalrevision_3052025.pdf)
