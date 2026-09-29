import { describe, expect, it } from "vitest";
import {
  affectedAudienceLabel,
  audienceVisible,
  canEvaluate,
  coverageNotice,
  defaultAudiences,
  disclosureMismatch,
  EMPTY_INTAKE,
  intakeFields,
  intakeFromRequest,
  investorAudienceLabel,
  missingAnswers,
  SHORT_DRAFT_WARNING,
  showHighRiskWarning,
  showShortDraftWarning,
  showTooShortWarning,
  TOO_SHORT_WARNING,
  wordCount,
  type IntakeState,
} from "../rules.js";

const full: IntakeState = {
  organization_type: "Private company",
  listed_where: "",
  headquarters: "United States",
  communication_event: "Layoffs or job cuts",
  event_description: "",
  communication_format: "Employee announcement",
  format_description: "",
  main_announcement: "",
  audiences: ["All employees"],
  situation: "Not yet public",
  people_at_risk: false,
  counsel_limited: false,
  locations: ["United States"],
  purpose: "Announce a decision or change",
};
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

describe("wordCount", () => {
  it("counts whitespace-separated words", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount("one two\nthree")).toBe(3);
  });
});

describe("showHighRiskWarning", () => {
  it("shows for the listed events and for anywhere in the EU", () => {
    expect(showHighRiskWarning("Disappointing results or profit warning", ["United States"])).toBe(true);
    expect(showHighRiskWarning("Price increase or change to terms", ["Germany"])).toBe(true);
    expect(showHighRiskWarning("Price increase or change to terms", ["European Union"])).toBe(true);
    expect(showHighRiskWarning("Price increase or change to terms", ["United States"])).toBe(false);
  });
});

describe("missingAnswers", () => {
  it("names every unanswered question, in the words the screen uses", () => {
    expect(missingAnswers(full)).toEqual([]);
    expect(missingAnswers(EMPTY_INTAKE)).toContain("Type of organization");
    expect(missingAnswers(EMPTY_INTAKE)).toContain("What's happening");
    expect(missingAnswers({ ...full, audiences: [] })).toEqual(["Who will receive this"]);
    expect(missingAnswers({ ...full, locations: [] })).toEqual(["Where is this happening"]);
  });

  it("asks for the words when the answer is 'Something else'", () => {
    const other: IntakeState = { ...full, communication_event: "Something else" };
    expect(missingAnswers(other)).toEqual(["What's happening, in your own words"]);
    expect(missingAnswers({ ...other, event_description: "A supplier went bust." })).toEqual([]);
  });
});

describe("the conditionals", () => {
  it("names the directly affected people after the event, and hides them when nobody is", () => {
    expect(affectedAudienceLabel("Layoffs or job cuts")).toBe("Departing employees");
    expect(affectedAudienceLabel("Site, office or store closure")).toBe("Employees at the site");
    expect(affectedAudienceLabel("New CEO or leadership appointment")).toBeNull();
    expect(audienceVisible("Employees directly affected", { ...full, communication_event: "New CEO or leadership appointment" })).toBe(false);
  });

  it("renames the market audience by organization, and hides it for a public body", () => {
    expect(investorAudienceLabel("Publicly listed company")).toBe("Investors and analysts");
    expect(investorAudienceLabel("Nonprofit or charity")).toBe("Donors, funders and trustees");
    expect(investorAudienceLabel("Public body or government agency")).toBeNull();
    expect(audienceVisible("Investors and analysts", { ...full, organization_type: "Public body or government agency" })).toBe(false);
  });

  it("pre-selects the audiences a format normally goes to, minus any that are hidden", () => {
    expect(defaultAudiences("Press release or public statement", full)).toEqual(["Media", "General public and communities"]);
    expect(defaultAudiences("Investor or market disclosure", { ...full, organization_type: "Public body or government agency" })).toEqual([]);
  });

  it("says so when a non-listed organization picks a market disclosure", () => {
    expect(disclosureMismatch({ ...full, communication_format: "Investor or market disclosure" })).toBe(true);
    expect(
      disclosureMismatch({ ...full, organization_type: "Publicly listed company", communication_format: "Investor or market disclosure" }),
    ).toBe(false);
  });

  it("says which places the tool carries no legal checks for, and stays quiet otherwise", () => {
    expect(coverageNotice(["United States", "Germany"])).toBeNull();
    expect(coverageNotice(["Multiple regions / global"])).toBeNull();
    expect(coverageNotice(["Canada"])).toContain("Legal checks for Canada aren't included");
    expect(coverageNotice(["Canada", "Japan"])).toContain("Canada and Japan");
  });
});

describe("canEvaluate", () => {
  it("requires every answer and a draft in range", () => {
    expect(canEvaluate(words(100), full)).toBe(true);
    expect(canEvaluate(words(5001), full)).toBe(false);
    expect(canEvaluate(words(100), { ...full, purpose: "" })).toBe(false);
    expect(canEvaluate(words(100), EMPTY_INTAKE)).toBe(false);
  });

  it("blocks below ten words and allows everything above, warning or not", () => {
    expect(canEvaluate("", full)).toBe(false);
    expect(canEvaluate(words(5), full)).toBe(false);
    expect(canEvaluate(words(9), full)).toBe(false);
    // Ten is the floor, not fifty: a short post is reviewed, with a warning.
    expect(canEvaluate(words(10), full)).toBe(true);
    expect(canEvaluate(words(30), full)).toBe(true);
    expect(canEvaluate(words(49), full)).toBe(true);
  });
});

describe("the two draft-length warnings", () => {
  it("blocks below ten, warns from ten to forty-nine, and stays quiet from fifty", () => {
    expect(showTooShortWarning(words(5))).toBe(true);
    expect(showShortDraftWarning(words(5))).toBe(false);

    expect(showTooShortWarning(words(10))).toBe(false);
    expect(showShortDraftWarning(words(10))).toBe(true);
    expect(showShortDraftWarning(words(49))).toBe(true);

    expect(showShortDraftWarning(words(50))).toBe(false);
    expect(showTooShortWarning(words(50))).toBe(false);
  });

  it("says nothing at all on an empty box", () => {
    expect(showTooShortWarning("")).toBe(false);
    expect(showShortDraftWarning("")).toBe(false);
  });

  it("names the floor in the blocking message and the field in the warning", () => {
    expect(TOO_SHORT_WARNING).toBe("Paste at least 10 words to run a review.");
    expect(SHORT_DRAFT_WARNING).toContain("“Anything else we should know?”");
    expect(SHORT_DRAFT_WARNING).toContain("can’t");
  });
});

describe("intakeFields", () => {
  it("drops the answers their question is not asking for", () => {
    const fields = intakeFields({ ...full, listed_where: "NYSE", event_description: "ignored", main_announcement: "ignored" });
    expect(fields.organization).toEqual({ type: "Private company", headquarters: "United States" });
    expect(fields.event_description).toBeUndefined();
    expect(fields.main_announcement).toBeUndefined();
  });

  it("keeps the ones it is", () => {
    const fields = intakeFields({
      ...full,
      organization_type: "Publicly listed company",
      listed_where: " NYSE ",
      communication_format: "Talking points, FAQ or manager toolkit",
      main_announcement: " The announcement. ",
    });
    expect(fields.organization).toEqual({ type: "Publicly listed company", listed_where: "NYSE", headquarters: "United States" });
    expect(fields.main_announcement).toBe("The announcement.");
  });
});

describe("the counsel answer", () => {
  it("goes into the request and comes back out of it", () => {
    expect(intakeFields({ ...full, counsel_limited: true }).counsel_limited).toBe(true);
    const request = { ...intakeFields({ ...full, counsel_limited: true }), draft: "d", context: "", already_published: false };
    expect(intakeFromRequest(request).counsel_limited).toBe(true);
  });

  it("reads a request from before the question as unticked", () => {
    const { counsel_limited: _unused, ...older } = { ...intakeFields(full), draft: "d", context: "", already_published: false };
    expect(intakeFromRequest(older).counsel_limited).toBe(false);
  });
});
