/** Stubbed areas (Section 1): a nav entry and one paragraph each, nothing more. */
export const STUB_PAGES = [
  {
    key: "saved-reviews",
    title: "Saved Reviews",
    text: "Saved Reviews will keep a private history of the reviews you have run, so you can reopen one without keeping track of a file. It isn't in this build. The app stores nothing.",
  },
  {
    key: "team-workspace",
    title: "Team Workspace",
    text: "Team Workspace will let a communications team share reviews, assign findings, and track who has signed off on a draft. It is not in this build; this prototype is single-user and stores nothing.",
  },
  {
    key: "enterprise-governance",
    title: "Governance Console",
    text: "The Governance Console will let an organization control how drafts are handled: what's hidden before sending, how long anything is kept, where it's stored, who can use the tool, and a record of who did what. It isn't in this build. The privacy panel shows only what the tool does today.",
  },
  {
    key: "settings",
    title: "Settings",
    text: "Settings will let you choose the AI model, how long anything is kept, and how drafts are labelled. It isn't in this build. For now these are set by the owner and shown in the privacy panel.",
  },
] as const;
export type StubKey = (typeof STUB_PAGES)[number]["key"];
