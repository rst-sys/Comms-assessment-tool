import { describe, expect, it } from "vitest";
import { buildSystemBlocks, buildUserMessage, OUTPUT_NOTES } from "../prompt.js";
import { LAYOFF_BLOCK, SYSTEM_PROMPT } from "../promptText.js";
import { DEMO_1, DEMO_2, DEMO_1_WITH_CONTEXT } from "../fixtures.js";
import { APOLOGY_PROTOCOL, PROTOCOLS, protocolsFor } from "../protocols.js";
import { DIMENSION_IDS } from "../types.js";

describe("system prompt text", () => {
  it("carries the verbatim Section 5 prompt", () => {
    expect(SYSTEM_PROMPT.startsWith("You are the evaluation engine for Trust Assessment Assistant.")).toBe(true);
    expect(SYSTEM_PROMPT.trimEnd().endsWith("No prose before or after it.")).toBe(true);
    for (const heading of ["YOUR EVIDENCE", "THE ACCOUNT", "SCORING", "STATED VERSUS SUBSTANTIATED", "HEIGHTENED REVIEW", "AGENCY AND ABSTRACTION SCAN", "DEVIL'S ADVOCATE", "NON-INVENTION", "LANGUAGE", "OUTPUT"]) {
      expect(SYSTEM_PROMPT).toContain(`\n${heading}\n`);
    }
  });

  it("carries the verbatim Section 10 layoff block", () => {
    expect(LAYOFF_BLOCK.startsWith("LAYOFF AND RESTRUCTURING REVIEW")).toBe(true);
    expect(LAYOFF_BLOCK).toContain("Were affected employees assessed for internal mobility before selection?");
    expect(LAYOFF_BLOCK.trimEnd().endsWith("counsel must confirm.")).toBe(true);
  });
});

describe("buildSystemBlocks", () => {
  it("adds the layoff block only for a workforce reduction", () => {
    const layoff = buildSystemBlocks(DEMO_1.request).map((b) => b.text);
    expect(layoff).toEqual([SYSTEM_PROMPT, LAYOFF_BLOCK, OUTPUT_NOTES]);

    const apology = buildSystemBlocks(DEMO_2.request).map((b) => b.text);
    expect(apology).toEqual([SYSTEM_PROMPT, APOLOGY_PROTOCOL.promptBlock, OUTPUT_NOTES]);
  });

  it("adds the apology protocol for the repair goal, and not otherwise", () => {
    // An apology is a posture, not an event: it can sit on top of any of the
    // thirteen, so the goal decides and the event does not.
    const byGoal = buildSystemBlocks({ ...DEMO_1.request, goal: "Apologize or repair trust" }).map((b) => b.text);
    expect(byGoal.filter((t) => t === APOLOGY_PROTOCOL.promptBlock).length).toBe(1);

    const otherEvent = buildSystemBlocks({
      ...DEMO_1.request,
      communication_event: "Cyberattack or data incident",
      goal: "Apologize or repair trust",
    }).map((b) => b.text);
    expect(otherEvent).toContain(APOLOGY_PROTOCOL.promptBlock);

    expect(buildSystemBlocks(DEMO_1.request).map((b) => b.text)).not.toContain(APOLOGY_PROTOCOL.promptBlock);
  });

  it("puts the protocol block after any type block and before the output notes", () => {
    const blocks = buildSystemBlocks({ ...DEMO_1.request, goal: "Apologize or repair trust" }).map((b) => b.text);
    expect(blocks).toEqual([SYSTEM_PROMPT, LAYOFF_BLOCK, APOLOGY_PROTOCOL.promptBlock, OUTPUT_NOTES]);
  });
});

describe("the effective-apology protocol", () => {
  it("names the six components in the order the research ranks them, with the research cited", () => {
    expect(APOLOGY_PROTOCOL.elements.map((e) => e.name)).toEqual([
      "Expression of regret",
      "Explanation of what went wrong",
      "Acknowledgment of responsibility",
      "Declaration of repentance",
      "Offer of repair",
      "Request for forgiveness",
    ]);
    expect(APOLOGY_PROTOCOL.source).toContain("Lewicki");
    expect(APOLOGY_PROTOCOL.source).toContain("2016");
    expect(APOLOGY_PROTOCOL.source).toContain("Negotiation and Conflict Management Research");
  });

  it("maps every component to a dimension the engine already scores", () => {
    for (const element of APOLOGY_PROTOCOL.elements) {
      expect(DIMENSION_IDS).toContain(element.dimension);
    }
  });

  it("tells the model every component and never to supply wording", () => {
    for (const element of APOLOGY_PROTOCOL.elements) {
      expect(APOLOGY_PROTOCOL.promptBlock).toContain(element.name);
    }
    expect(APOLOGY_PROTOCOL.promptBlock).toContain("never supply wording");
  });

  it("is the only protocol in the registry, and protocolsFor selects on the request", () => {
    expect(PROTOCOLS).toEqual([APOLOGY_PROTOCOL]);
    expect(protocolsFor(DEMO_2.request)).toEqual([APOLOGY_PROTOCOL]);
    expect(protocolsFor(DEMO_1.request)).toEqual([]);
  });
});

describe("buildUserMessage", () => {
  it("includes the draft and every intake field as labeled blocks", () => {
    const msg = buildUserMessage(DEMO_1.request);
    expect(msg).toContain("DRAFT\n<<<\nRapid growth brought complexity.");
    expect(msg).toContain("Communication event: Workforce reduction or major reorganization");
    expect(msg).toContain("Communication format: Employee announcement");
    expect(msg).toContain("Primary audience: All employees");
    expect(msg).toContain("Setting: High stakes");
    expect(msg).toContain("Market: United States");
    expect(msg).toContain("Goal: Announce a difficult employment action");
    expect(msg).toContain("Audience scope: Internal");
    expect(msg).toContain("heightened_review: true");
    expect(msg).toContain("already_published: false");
  });

  it("lists all thirteen context fields and says when none were supplied", () => {
    const msg = buildUserMessage(DEMO_1.request);
    expect(msg).toContain("No context fields were supplied.");
    expect(msg).toContain("Organization or sector: (not supplied)");
    expect(msg).toContain("Known legal, HR, labor, privacy, or disclosure review requirements: (not supplied)");
    expect((msg.match(/\(not supplied\)/g) ?? []).length).toBe(13);

    const withContext = buildUserMessage(DEMO_1_WITH_CONTEXT.request);
    expect(withContext).not.toContain("No context fields were supplied.");
    expect(withContext).toContain("Known facts and source material: The CEO and the executive team made the decision");
  });

  it("adds the retrospective note only when already published", () => {
    expect(buildUserMessage(DEMO_1.request)).not.toContain("already been issued");
    const published = buildUserMessage({ ...DEMO_2.request, already_published: true });
    expect(published).toContain("This draft has already been issued.");
    expect(published).toContain("already_published: true");
  });
});

describe("audience context documents and stance in the user message", () => {
  it("adds a labeled block per document with its kind, delivery and reach, and none when absent", () => {
    const withDocs = buildUserMessage({
      ...DEMO_1.request,
      audience_documents: [
        { kind: "supporting", title: "Employee FAQ", description: "Questions on selection and support", delivery: "Linked from the email", reach: "all", same_time: true, text: "Q: How were roles selected? A: By [criteria]." },
        { kind: "media_report", title: "Trade press story", description: "Reports layoffs are planned", delivery: "Published last week", reach: "some", same_time: false, text: "Sources say 200 roles will go." },
      ],
    });
    expect(withDocs).toContain("AUDIENCE CONTEXT DOCUMENTS (2; what the audience already has or will receive)");
    expect(withDocs).toContain("Document 1: Employee FAQ");
    expect(withDocs).toContain("Kind: Supporting document provided with this communication");
    expect(withDocs).toContain("Reach: The whole audience; same time as the main communication: yes");
    expect(withDocs).toContain("Document 2: Trade press story");
    expect(withDocs).toContain("Kind: Media report or public commentary");
    expect(withDocs).toContain("Reach: Part of the audience");
    expect(withDocs).toContain("Sources say 200 roles will go.");
    expect(buildUserMessage(DEMO_1.request)).not.toContain("AUDIENCE CONTEXT DOCUMENTS");
  });

  it("states the stance and, when reactive, what the draft reacts to", () => {
    expect(buildUserMessage(DEMO_1.request)).toContain("stance: proactive");
    const reactive = buildUserMessage({ ...DEMO_1.request, stance: "reactive", reacting_to: "A press report claiming 200 roles will go." });
    expect(reactive).toContain("stance: reactive");
    expect(reactive).toContain("reacting_to: A press report claiming 200 roles will go.");
  });
});

describe("the language rule (revision 21)", () => {
  it("no longer mandates the hedged register the owner found pompous", () => {
    // The old rule literally instructed this phrasing, and it was producing
    // "a reasonable affected employee could not tell ..." in every review.
    expect(SYSTEM_PROMPT).not.toContain("a reasonable stakeholder could interpret this as");
    expect(SYSTEM_PROMPT).not.toContain("consider identifying the deciding body or role");
  });

  it("tells the model to state plainly what is and is not in the draft", () => {
    expect(SYSTEM_PROMPT).toContain("with no hedging preamble");
    expect(SYSTEM_PROMPT).toContain("affected employees cannot tell");
    expect(SYSTEM_PROMPT).toMatch(/"Says", not "announces"/);
  });

  it("keeps calibration for the one case that needs it: how an audience may read something", () => {
    expect(SYSTEM_PROMPT).toContain("how an audience might read something");
    expect(SYSTEM_PROMPT).toContain("could be read as");
  });

  it("carries the owner's worked example, so the target register is not a matter of taste", () => {
    expect(SYSTEM_PROMPT).toContain("The draft says who is leaving but not how roles were chosen or how to challenge the outcome.");
  });

  it("still forbids the accusations and motive-reading it always did", () => {
    for (const rule of ["lied", "acted in bad faith", "Never state a motive"]) {
      expect(SYSTEM_PROMPT).toContain(rule);
    }
  });
});
