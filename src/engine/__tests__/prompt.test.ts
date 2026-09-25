import { describe, expect, it } from "vitest";
import { buildSystemBlocks, buildUserMessage, OUTPUT_NOTES } from "../prompt.js";
import { SYSTEM_PROMPT } from "../promptText.js";
import { DEMO_1, DEMO_2, DEMO_1_WITH_CONTEXT } from "../fixtures.js";
import { PROTOCOLS, protocolsFor } from "../protocols.js";
import { PROTOCOL_RULES } from "../protocolPrompt.js";
import { DIMENSION_IDS } from "../types.js";

describe("system prompt text", () => {
  it("carries the verbatim Section 5 prompt", () => {
    expect(SYSTEM_PROMPT.startsWith("You are the evaluation engine for Trust Assessment Assistant.")).toBe(true);
    expect(SYSTEM_PROMPT.trimEnd().endsWith("No prose before or after it.")).toBe(true);
    for (const heading of ["YOUR EVIDENCE", "THE ACCOUNT", "SCORING", "STATED VERSUS SUBSTANTIATED", "AGENCY AND ABSTRACTION SCAN", "DEVIL'S ADVOCATE", "NON-INVENTION", "LANGUAGE", "OUTPUT"]) {
      expect(SYSTEM_PROMPT).toContain(`\n${heading}\n`);
    }
  });

});

describe("buildSystemBlocks", () => {
  it("sends the framework, then the event protocol, then the rules, then the output notes", () => {
    const blocks = buildSystemBlocks(DEMO_1.request).map((b) => b.text);
    expect(blocks[0]).toBe(SYSTEM_PROMPT);
    expect(blocks[1]).toContain("WORKFORCE REDUCTION AND RESTRUCTURING");
    expect(blocks[2]).toBe(PROTOCOL_RULES);
    expect(blocks[blocks.length - 1]).toBe(OUTPUT_NOTES);
  });

  it("carries the account the framework asks for, including what the reader should do", () => {
    // These two were the only part of the deleted event core that the
    // framework did not already have. They live here now, not in a layer.
    expect(SYSTEM_PROMPT).toContain("what the reader should do now, or that nothing is needed from them yet");
    expect(SYSTEM_PROMPT).toContain("when the next update comes, where it will appear, and a named way to ask");
  });

  it("sends no protocol at all when the draft is about none of the thirteen events", () => {
    const routine = buildSystemBlocks({ ...DEMO_1.request, communication_event: "None of these", goal: "Inform" }).map((b) => b.text);
    expect(routine).toEqual([SYSTEM_PROMPT, OUTPUT_NOTES]);
  });

  it("adds a posture on top of any event, chosen by the goal and not the event", () => {
    const onEvent = buildSystemBlocks({ ...DEMO_1.request, goal: "Apologize or repair trust" }).map((b) => b.text);
    expect(onEvent.some((t) => t.startsWith("PUBLIC APOLOGY"))).toBe(true);
    expect(onEvent.some((t) => t.includes("WORKFORCE REDUCTION"))).toBe(true);

    const elsewhere = buildSystemBlocks({
      ...DEMO_1.request,
      communication_event: "Cyberattack or data incident",
      goal: "Apologize or repair trust",
    }).map((b) => b.text);
    expect(elsewhere.some((t) => t.startsWith("PUBLIC APOLOGY"))).toBe(true);
    expect(elsewhere.some((t) => t.includes("CYBER INCIDENT"))).toBe(true);

    // No goal, no posture.
    expect(buildSystemBlocks(DEMO_1.request).map((b) => b.text).some((t) => t.startsWith("PUBLIC APOLOGY"))).toBe(false);
  });

  it("sends the shared rules once however many protocols apply", () => {
    const blocks = buildSystemBlocks({ ...DEMO_1.request, goal: "Apologize or repair trust" }).map((b) => b.text);
    expect(protocolsFor({ ...DEMO_1.request, goal: "Apologize or repair trust" })).toHaveLength(2);
    expect(blocks.filter((t) => t === PROTOCOL_RULES)).toHaveLength(1);
  });
});

describe("the protocol library", () => {
  it("selects one event and one posture from the intake, never by reading the draft", () => {
    const applied = protocolsFor({ ...DEMO_1.request, goal: "Apologize or repair trust" }).map((p) => p.id);
    expect(applied).toEqual(["workforce-restructuring", "public-apology"]);

    expect(protocolsFor({ ...DEMO_1.request, communication_event: "None of these", goal: "Inform" })).toEqual([]);
  });

  it("sends no protocol at all for an event that has no file yet, leaving the framework to it", () => {
    const applied = protocolsFor({
      ...DEMO_1.request,
      communication_event: "Workplace safety event or facility emergency",
      goal: "Inform",
    });
    expect(applied).toEqual([]);
    const blocks = buildSystemBlocks({
      ...DEMO_1.request,
      communication_event: "Workplace safety event or facility emergency",
      goal: "Inform",
    }).map((b) => b.text);
    expect(blocks).toEqual([SYSTEM_PROMPT, OUTPUT_NOTES]);
  });

  it("maps every element and trigger in the library to a dimension the engine scores", () => {
    for (const p of PROTOCOLS) {
      for (const e of p.elements) expect(DIMENSION_IDS, `${p.id}/${e.name}`).toContain(e.dimension);
      for (const t of p.triggers) expect(DIMENSION_IDS, `${p.id}/${t.check.slice(0, 30)}`).toContain(t.dimension);
    }
  });

  it("keeps the workforce protocol carrying what the old layoff block did", () => {
    const block = buildSystemBlocks(DEMO_1.request).map((b) => b.text).join("\n");
    // The euphemism list and the feedback trigger moved into the file rather
    // than living in a second, overlapping instruction.
    expect(block).toContain("rightsizing");
    expect(block).toContain("synergies");
    expect(block).toMatch(/feedback[^.]*without an explicit statement that leadership/i);
    expect(block).toContain("internal mobility");
  });

  it("never supplies wording and never asks for a section of its own", () => {
    const block = buildSystemBlocks(DEMO_2.request).map((b) => b.text).join("\n");
    expect(block).toContain("never supply wording");
    expect(block).not.toContain("protocol_review");
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
