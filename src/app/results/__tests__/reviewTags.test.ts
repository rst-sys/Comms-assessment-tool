import { describe, expect, it } from "vitest";
import { reviewTagsFor, specialistQuestions } from "../model.js";
import { SPECIALIST_REVIEW_TYPES } from "../../../engine/types.js";

/**
 * Information security was missing from the review functions entirely, which
 * the owner spotted on a data-breach review: the tool could name Privacy but
 * had no way to say "get security to look at this". The previous question
 * filter matched the bare word "security" with no category behind it, so such
 * a question was flagged as needing a specialist without naming which.
 */
describe("Information security as a review function", () => {
  it("is one of the types the engine may name", () => {
    expect(SPECIALIST_REVIEW_TYPES).toContain("Information security");
  });

  it("is tagged on the questions a breach actually raises", () => {
    const questions = [
      "Has the intrusion been contained, and who confirmed it?",
      "Is the account of how the attacker gained access technically accurate?",
      "What credentials were exposed, and have they been rotated?",
      "Has forensics established the earliest date of compromise?",
    ];
    for (const q of questions) expect(reviewTagsFor(q), q).toContain("Information security");
  });

  it("is distinct from Privacy, which answers a different question", () => {
    // Whose data, and what must they be told: privacy.
    expect(reviewTagsFor("Which data subjects must be notified, and by when?")).toEqual(["Privacy"]);
    // How they got in and whether it is closed: security.
    expect(reviewTagsFor("Has the vulnerability been patched across all systems?")).toEqual(["Information security"]);
    // A breach question often needs both, and gets both.
    expect(reviewTagsFor("Was personal data exfiltrated during the breach?")).toEqual([
      "Privacy",
      "Information security",
    ]);
  });

  it("does not tag ordinary questions that merely mention a word in passing", () => {
    expect(reviewTagsFor("What is the update cadence after this announcement?")).toEqual([]);
    expect(reviewTagsFor("Are affected people told before any external announcement?")).toEqual([]);
  });

  it("every tag it can produce is a type the schema accepts", () => {
    const probe = [
      "legal counsel", "HR", "works-council consultation", "personal data", "cyber breach",
      "investor relations", "each market", "the board",
    ];
    for (const q of probe) {
      for (const tag of reviewTagsFor(q)) expect(SPECIALIST_REVIEW_TYPES, q).toContain(tag);
    }
  });

  it("still counts a security question as needing a specialist", () => {
    expect(specialistQuestions(["Has the ransomware been contained?"])).toHaveLength(1);
  });
});
