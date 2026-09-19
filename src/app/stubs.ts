/** Stubbed areas (Section 1): a nav entry and one paragraph each, nothing more. */
export const STUB_PAGES = [
  {
    key: "saved-reviews",
    title: "Saved Reviews",
    text: "Saved Reviews will keep a private history of the drafts you have evaluated, with their scores and findings, so a revision can be checked against the earlier version. It is not in this build: nothing is saved, and closing the tab discards everything.",
  },
  {
    key: "compare-revisions",
    title: "Compare Revisions",
    text: "Compare Revisions will place two versions of a draft side by side with their scores, showing which findings were resolved, which remain, and which are new. It is not in this build.",
  },
  {
    key: "team-workspace",
    title: "Team Workspace",
    text: "Team Workspace will let a communications team share reviews, assign findings, and track who has signed off on a draft. It is not in this build; this prototype is single-user and stores nothing.",
  },
  {
    key: "enterprise-governance",
    title: "Enterprise Governance Console",
    text: "The Enterprise Governance Console will hold customer-controlled processing, redaction, retention policies, data residency, audit logging, and access controls. It is not in this build; the privacy panel shows only what the code currently enforces.",
  },
  {
    key: "standards-library",
    title: "Standards Library",
    text: "The Standards Library will hold type-specific review protocols: financial disclosure, privacy incidents, AI and surveillance, and health and safety are planned alongside the layoff and restructuring protocol the engine applies today. It is not in this build.",
  },
  {
    key: "settings",
    title: "Settings",
    text: "Settings will cover provider and model selection, processing mode, retention choices, and the classification label. It is not in this build; the provider and model are read from the server's configuration and shown in the privacy panel.",
  },
] as const;
export type StubKey = (typeof STUB_PAGES)[number]["key"];
