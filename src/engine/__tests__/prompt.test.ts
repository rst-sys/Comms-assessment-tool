import { describe, expect, it } from "vitest";
import { buildSystemBlocks, buildUserMessage, OUTPUT_NOTES } from "../prompt.js";
import { LAYOFF_BLOCK, SYSTEM_PROMPT } from "../promptText.js";
import { DEMO_1, DEMO_2, DEMO_1_WITH_CONTEXT } from "../fixtures.js";

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
  it("adds the layoff block only for Layoff or restructuring", () => {
    const layoff = buildSystemBlocks(DEMO_1.request).map((b) => b.text);
    expect(layoff).toEqual([SYSTEM_PROMPT, LAYOFF_BLOCK, OUTPUT_NOTES]);

    const apology = buildSystemBlocks(DEMO_2.request).map((b) => b.text);
    expect(apology).toEqual([SYSTEM_PROMPT, OUTPUT_NOTES]);
  });
});

describe("buildUserMessage", () => {
  it("includes the draft and every intake field as labeled blocks", () => {
    const msg = buildUserMessage(DEMO_1.request);
    expect(msg).toContain("DRAFT\n<<<\nRapid growth brought complexity.");
    expect(msg).toContain("Communication type: Layoff or restructuring");
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
