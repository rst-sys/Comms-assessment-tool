/** Stubbed areas (Section 1): a nav entry and one paragraph each, nothing more. */
export const STUB_PAGES = [
  {
    key: "saved-reviews",
    title: "Saved Reviews",
    text: "Saved Reviews will keep a private history of the reviews you have run, so you can reopen one without keeping track of a file. It is not in this build: the app stores nothing. You can save a review to your own computer from the results page, and load it again under Compare Revisions.",
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
