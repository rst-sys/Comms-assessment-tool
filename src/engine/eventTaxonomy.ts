/**
 * GENERATED FILE — do not edit.
 *
 * Built from protocols/events.yaml by scripts/compile-protocols.ts. Change an
 * event by editing that file and running `npm run protocols`. A test fails if
 * this file and the YAML disagree.
 *
 * The labels are written out as literals rather than derived, because
 * CommunicationEvent is a union of them and every enum, record and switch in
 * the app depends on it.
 */

export interface EventEntry {
  readonly id: string;
  readonly label: string;
  readonly family: string | null;
  readonly event_protocol?: string;
  readonly ui_groups: readonly string[];
}

export const EVENT_FAMILIES = [
  { id: "leadership", name: "Leadership change" },
  { id: "workforce", name: "Workforce and organization change" },
  { id: "incident", name: "Incident and disruption" },
  { id: "allegations", name: "Allegations and misconduct" },
  { id: "commercial", name: "Commercial and financial decisions" },
  { id: "scrutiny", name: "Public scrutiny and reputation" },
  { id: "external", name: "External events and societal issues" },
] as const;
export type EventFamilyId = (typeof EVENT_FAMILIES)[number]["id"];

export const EVENT_UI_GROUPS = [
  { id: "most-common", name: "Most common" },
  { id: "leadership-governance", name: "Leadership and governance" },
  { id: "people-workplace", name: "People and workplace" },
  { id: "operations-safety", name: "Operations and safety" },
  { id: "business-finance", name: "Business and finance" },
  { id: "legal-reputation", name: "Legal and reputation" },
  { id: "external-events", name: "External events" },
] as const;

export const EVENT_TAXONOMY: readonly EventEntry[] = [
  { id: "ceo-departure", label: "CEO or senior leader departure", family: "leadership", event_protocol: "ceo-departure", ui_groups: ["most-common", "leadership-governance"] },
  { id: "leadership-appointment", label: "New CEO or leadership appointment", family: "leadership", ui_groups: ["leadership-governance"] },
  { id: "board-governance-dispute", label: "Board change or governance dispute", family: "leadership", ui_groups: ["leadership-governance"] },
  { id: "leader-allegations", label: "Allegations against a leader", family: "allegations", ui_groups: ["leadership-governance"] },
  { id: "death-leader-employee", label: "Death of a leader or employee", family: "leadership", ui_groups: ["leadership-governance", "people-workplace"] },
  { id: "layoffs", label: "Layoffs or job cuts", family: "workforce", event_protocol: "workforce-reduction", ui_groups: ["most-common", "people-workplace"] },
  { id: "restructuring", label: "Restructuring or reorganization", family: "workforce", event_protocol: "workforce-reduction", ui_groups: ["most-common", "people-workplace"] },
  { id: "site-closure", label: "Site, office or store closure", family: "workforce", event_protocol: "workforce-reduction", ui_groups: ["people-workplace"] },
  { id: "workplace-accident", label: "Workplace accident or serious injury", family: "incident", ui_groups: ["people-workplace"] },
  { id: "harassment-culture-allegations", label: "Harassment, discrimination or culture allegations", family: "allegations", ui_groups: ["people-workplace"] },
  { id: "labor-dispute", label: "Strike or labor dispute", family: "workforce", ui_groups: ["people-workplace"] },
  { id: "policy-change", label: "Major policy change (e.g. return to office, benefits)", family: "workforce", ui_groups: ["people-workplace"] },
  { id: "cyber-incident", label: "Cyber incident or data breach", family: "incident", event_protocol: "cyber-incident", ui_groups: ["most-common", "operations-safety"] },
  { id: "system-outage", label: "System outage or service disruption", family: "incident", ui_groups: ["operations-safety"] },
  { id: "product-recall", label: "Product recall or safety issue", family: "incident", ui_groups: ["most-common", "operations-safety"] },
  { id: "environmental-incident", label: "Environmental incident", family: "incident", ui_groups: ["operations-safety"] },
  { id: "supply-chain-disruption", label: "Supply chain disruption", family: "incident", ui_groups: ["operations-safety"] },
  { id: "merger-acquisition", label: "Merger, acquisition or sale", family: "commercial", ui_groups: ["most-common", "business-finance"] },
  { id: "profit-warning", label: "Disappointing results or profit warning", family: "commercial", ui_groups: ["business-finance"] },
  { id: "price-terms-change", label: "Price increase or change to terms", family: "commercial", ui_groups: ["business-finance"] },
  { id: "financial-difficulty", label: "Financial difficulty or cost-cutting", family: "commercial", ui_groups: ["business-finance"] },
  { id: "strategy-market-exit", label: "Change of strategy or exit from a market", family: "commercial", ui_groups: ["business-finance"] },
  { id: "investigation-litigation", label: "Investigation, lawsuit or regulatory action", family: "allegations", ui_groups: ["legal-reputation"] },
  { id: "fraud-misconduct", label: "Fraud or financial misconduct", family: "allegations", ui_groups: ["legal-reputation"] },
  { id: "backlash", label: "Backlash to something the organization said or did", family: "scrutiny", ui_groups: ["legal-reputation"] },
  { id: "misinformation", label: "Rumor or misinformation about the organization", family: "scrutiny", ui_groups: ["legal-reputation"] },
  { id: "activist-pressure", label: "Pressure from activists, campaigners or investors", family: "scrutiny", ui_groups: ["legal-reputation"] },
  { id: "geopolitical-event", label: "Geopolitical event (war, sanctions, unrest)", family: "external", event_protocol: "geopolitical", ui_groups: ["external-events"] },
  { id: "natural-disaster", label: "Natural disaster or extreme weather", family: "external", ui_groups: ["external-events"] },
  { id: "public-health-emergency", label: "Public health emergency", family: "external", ui_groups: ["external-events"] },
  { id: "social-political-issue", label: "Social or political issue (deciding whether to speak)", family: "external", ui_groups: ["external-events"] },
  { id: "something-else", label: "Something else", family: null, ui_groups: [] },
];

/** Every event label, in taxonomy order. The union the whole app is typed on. */
export const COMMUNICATION_EVENTS = [
  "CEO or senior leader departure",
  "New CEO or leadership appointment",
  "Board change or governance dispute",
  "Allegations against a leader",
  "Death of a leader or employee",
  "Layoffs or job cuts",
  "Restructuring or reorganization",
  "Site, office or store closure",
  "Workplace accident or serious injury",
  "Harassment, discrimination or culture allegations",
  "Strike or labor dispute",
  "Major policy change (e.g. return to office, benefits)",
  "Cyber incident or data breach",
  "System outage or service disruption",
  "Product recall or safety issue",
  "Environmental incident",
  "Supply chain disruption",
  "Merger, acquisition or sale",
  "Disappointing results or profit warning",
  "Price increase or change to terms",
  "Financial difficulty or cost-cutting",
  "Change of strategy or exit from a market",
  "Investigation, lawsuit or regulatory action",
  "Fraud or financial misconduct",
  "Backlash to something the organization said or did",
  "Rumor or misinformation about the organization",
  "Pressure from activists, campaigners or investors",
  "Geopolitical event (war, sanctions, unrest)",
  "Natural disaster or extreme weather",
  "Public health emergency",
  "Social or political issue (deciding whether to speak)",
  "Something else",
] as const;

/** The event chosen when nothing on the list fits; the user then types what happened. */
export const OTHER_EVENT = "Something else";

/** Events that name something, for anywhere "Something else" is not a real answer. */
export const NAMED_EVENT_COUNT = 31;
