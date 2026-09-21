# Step 1 — Finding the standards for an event

Before you can write a protocol you need something for it to rest on. This is
the prompt that goes looking.

Use it first, in its own Claude conversation. What it gives you back is what you
paste into the placeholder at the bottom of `PROTOCOL-PROMPT.md`.

## How to use it

1. Copy everything from the line `---- COPY FROM HERE ----` to the end.
2. Paste it into a new Claude conversation. **Turn web search on.**
3. Fill in the two blanks at the bottom: the event, and the markets you care
   about.
4. Read what comes back, especially the last two sections — what it could not
   verify, and what nobody has established.
5. Paste the whole reply into `PROTOCOL-PROMPT.md`, in a second conversation.

## One warning worth reading

The single most common failure in AI research is a citation that looks perfect
and does not exist. Real authors, plausible title, correct-looking year, invented.

This prompt is built to make that hard: it demands a working link for every
source and a separate list of everything Claude could not open. **If a source is
listed as "not opened", treat it as not found.** Do not let it into a protocol
on the strength of the title alone.

---- COPY FROM HERE ----

You are doing source research for a tool called Trust Assessment Assistant. I
need an authoritative, honest list of the standards and research that govern how
an organization should communicate about one kind of high-stakes event.

**Search the web. Do not answer from memory.** If you cannot search in this
conversation, say so and stop rather than working from recall — a citation from
memory is exactly what this task cannot use.

## What the tool does, so you know what to look for

It reviews a draft corporate communication — a memo, a notice, a statement — and
judges whether it gives a credible account of the decision behind it: what was
decided, who had the authority, what context mattered, who is affected, what
will change, who owns it, and how anyone can check that it happened.

So I am interested in sources that bear on **what a message must contain and
disclose**. Sources about operational handling are still useful when they
establish what facts must exist — a breach-response standard tells you what an
organization should be able to say — but tell me which kind each one is.

## What counts as authoritative

Sort what you find into these tiers, strongest first.

1. **Binding law or regulation.** Statutes, rules, filing requirements. Say who
   it binds and where.
2. **Regulator or agency guidance.** Not binding, but official. Say so
   explicitly — much of this carries a line stating it lacks the force of law,
   and if it does, quote it.
3. **Standards bodies.** ISO, NIST, national standards organizations.
4. **Professional bodies and codes of practice.** PRSA, IABC, CIPD, SHRM, the
   Arthur W. Page Society, industry associations.
5. **Peer-reviewed research.** Studies, meta-analyses, systematic reviews.
6. **Documented practitioner consensus.** Handbooks, established textbooks,
   post-incident reviews and public inquiries.

## What to leave out

Do not include agency thought-leadership, vendor blogs, content marketing,
listicles, LinkedIn posts, consultancy "point of view" papers, or AI-generated
summaries of any of the above. They are the easiest things to find and they are
worthless as a standard, because the tool has to be able to say what it rests on
and defend it.

## Verification rules — the part that matters most

For every source you list:

- **Give a link you actually opened.** Not a search result, not a guessed DOI.
- **Say whether you read it.** Mark each one "opened and read", "opened, partly
  read" with what you read, or "not opened" with the reason — paywalled, 403,
  login required, dead link.
- **Never invent a citation.** No constructed DOIs, no guessed page numbers, no
  approximated dates. If you know a paper exists but cannot reach it, put it in
  the "could not verify" list, not the main list.
- **Check currency.** Say the date, whether it has been revised or superseded,
  and if the page carries conflicting dates, say that too.
- **Distinguish what a source says from what someone says it says.** If you are
  relying on a press summary of a study rather than the study, say so plainly.

I would rather have four sources you genuinely opened than twenty you assembled
from memory and search snippets.

## What to give me back

**1. The short answer.** In three or four sentences: is there a recognised
standard for communicating about this event, or not? Do not soften it if the
answer is no.

**2. The sources, by tier.** For each: full citation (author or issuing body,
title, publication, year), the link, one sentence on what it covers, whether it
binds and whom, its currency, and your read status from the rules above.

**3. What it actually requires of a message.** Pull out the concrete
obligations: facts that must be stated, disclosures that are mandatory,
deadlines, who must be told and in what order. These are the things that can be
checked by reading a draft, so be specific and say which source each comes from.

**4. How good the evidence is.** For studies: how many participants, what was
measured, what the authors themselves say about their limits. For guidance:
who issues it and what standing it has. Be blunt about weakness. Most
communications guidance is consensus about good practice, not measured effect —
if that is the case here, say so.

**5. Known failure patterns.** What are the recognised evasions specific to this
event — the euphemisms, the standard deflections, the things organizations
reliably leave out? Cite where these are documented. If they are your own
observation rather than a source's, label them as that.

**6. Jurisdiction and scope limits.** Which countries and sectors the sources
cover, and which they do not. Name what is missing rather than leaving it
implied.

**7. Could not verify.** Everything you found referenced but could not open, and
why. This list existing is a sign of honest work, not a failure.

**8. What nobody has established.** The genuine gaps — questions a protocol
would need answered where no source answers them. A protocol written over a gap
it does not know about is worse than no protocol.

## Before you answer

If there is little or nothing authoritative for this event, **say that clearly
and give me what little there is.** A protocol built on nothing would make the
tool claim rigour it does not have, which is exactly what this tool exists to
catch in other people's communications. I can write a protocol that rests
openly on professional judgement; I cannot use one that rests on invented
citations.

---

**The event:**

[ WRITE IT HERE — for example: a cyberattack or data incident; a workplace
safety event; a recall or product defect ]

**The markets and sectors that matter to me:**

[ FOR EXAMPLE: United States and the European Union; publicly listed companies;
healthcare. Write "no particular market" if you want the general picture. ]
