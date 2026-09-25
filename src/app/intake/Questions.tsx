/**
 * The six questions in step 2, and the organization profile in step 1.
 *
 * Every one of the six is a dropdown. They were panels of radio buttons and
 * the whole screen was five of them tall; the options and the grouping have
 * not changed, only where they live until they are needed.
 */
import { useId, type ReactNode } from "react";
import { COUNTRIES } from "../../engine/countries.js";
import {
  AUDIENCE_DESCRIPTIONS,
  AUDIENCE_GROUPS,
  AFFECTED_AUDIENCE,
  EVENT_GROUPS,
  FORMAT_DESCRIPTIONS,
  FORMAT_GROUPS,
  HOLDING_STATEMENT_SITUATION,
  INVESTOR_AUDIENCE,
  LOCATION_QUICK_PICKS,
  MOST_COMMON_EVENTS,
  ORGANIZATION_TYPES,
  OTHER_EVENT,
  OTHER_FORMAT,
  PURPOSES,
  PURPOSE_DESCRIPTIONS,
  SITUATION_DESCRIPTIONS,
  SITUATION_STATUSES,
  type Audience,
  type CommunicationEvent,
  type CommunicationFormat,
  type OrganizationType,
} from "../../engine/types.js";
import { Menu, type MenuGroup } from "./Menu.js";
import {
  affectedAudienceLabel,
  audienceVisible,
  coverageNotice,
  defaultAudiences,
  disclosureMismatch,
  investorAudienceLabel,
  showEuCountries,
  showEventDescription,
  showFormatDescription,
  showGlobalCountries,
  showMainAnnouncement,
  type IntakeState,
} from "./rules.js";

export interface QuestionProps {
  state: IntakeState;
  onChange: (next: IntakeState) => void;
}

function Described({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Step 1: before you start
// ---------------------------------------------------------------------------

export function OrganizationQuestion({ state, onChange }: QuestionProps) {
  const hqId = useId();
  const listedId = useId();
  const setType = (type: OrganizationType) => {
    const next: IntakeState = { ...state, organization_type: type };
    if (type !== "Publicly listed company") next.listed_where = "";
    next.audiences = next.audiences.filter((a) => audienceVisible(a, next));
    onChange(next);
  };
  return (
    <div className="split-two">
      <div>
        <span className="label">Type of organization</span>
        <div className="choice-list">
          {ORGANIZATION_TYPES.map((t) => (
            <label className="choice-box" key={t}>
              <input
                type="radio"
                name="organization-type"
                value={t}
                checked={state.organization_type === t}
                onChange={() => setType(t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="field">
          <span className="label" id={hqId}>Headquarters</span>
          <input
            type="text"
            value={state.headquarters}
            aria-labelledby={hqId}
            list="country-list"
            placeholder="Type a country…"
            onChange={(e) => onChange({ ...state, headquarters: e.target.value })}
          />
          <span className="muted small">Where the organization is based. Used to pick the rules that apply.</span>
        </label>
        {state.organization_type === "Publicly listed company" ? (
          <label className="field">
            <span className="label" id={listedId}>Where is it listed?</span>
            <input
              type="text"
              value={state.listed_where}
              aria-labelledby={listedId}
              placeholder="Type an exchange or country…"
              onChange={(e) => onChange({ ...state, listed_where: e.target.value })}
            />
          </label>
        ) : null}
        <CountryList />
      </div>
    </div>
  );
}

/** One shared datalist of country names; several inputs point at it. */
export function CountryList() {
  return (
    <datalist id="country-list">
      {COUNTRIES.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 1: what's happening?
// ---------------------------------------------------------------------------

const EVENT_MENU: MenuGroup[] = [
  { label: "Most common", options: MOST_COMMON_EVENTS.map((e) => ({ value: e, label: e })) },
  ...EVENT_GROUPS.map(([label, events]) => ({ label, options: events.map((e) => ({ value: e, label: e })) })),
  { label: "Not on the list", options: [{ value: OTHER_EVENT, label: "Something else…" }] },
];

export function EventQuestion({ state, onChange }: QuestionProps) {
  const setEvent = (event: string) => {
    const next: IntakeState = { ...state, communication_event: event as CommunicationEvent };
    if (!showEventDescription(next.communication_event)) next.event_description = "";
    next.audiences = next.audiences.filter((a) => audienceVisible(a, next));
    onChange(next);
  };
  return (
    <div>
      <Menu
        label="What's happening?"
        hint="Searchable, grouped by category. One choice."
        placeholder="Choose the closest match"
        groups={EVENT_MENU}
        searchable
        value={state.communication_event}
        onChange={setEvent}
      />
      {showEventDescription(state.communication_event) ? (
        <Described label="Briefly describe what's happening">
          <textarea rows={2} value={state.event_description} onChange={(e) => onChange({ ...state, event_description: e.target.value })} />
        </Described>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 2: what are you drafting?
// ---------------------------------------------------------------------------

const FORMAT_MENU: MenuGroup[] = [
  ...FORMAT_GROUPS.map(([label, formats]) => ({
    label,
    options: formats.map((f) => ({ value: f, label: f, note: FORMAT_DESCRIPTIONS[f] })),
  })),
  { label: "Not on the list", options: [{ value: OTHER_FORMAT, label: "Something else…" }] },
];

export function FormatQuestion({
  state,
  onChange,
  audiencesTouched,
  situationTouched,
}: QuestionProps & { audiencesTouched: boolean; situationTouched: boolean }) {
  const setFormat = (value: string) => {
    const format = value as CommunicationFormat;
    const next: IntakeState = { ...state, communication_format: format };
    if (!showFormatDescription(format)) next.format_description = "";
    if (!showMainAnnouncement(format)) next.main_announcement = "";
    if (!audiencesTouched) next.audiences = defaultAudiences(format, next);
    if (format === "Holding statement" && !situationTouched) next.situation = HOLDING_STATEMENT_SITUATION;
    onChange(next);
  };
  return (
    <div>
      <Menu
        label="What are you drafting?"
        hint="Grouped by category. One choice."
        placeholder="Choose a format"
        groups={FORMAT_MENU}
        value={state.communication_format}
        onChange={setFormat}
      />
      {showFormatDescription(state.communication_format) ? (
        <Described label="Describe what you're drafting">
          <textarea rows={2} value={state.format_description} onChange={(e) => onChange({ ...state, format_description: e.target.value })} />
        </Described>
      ) : null}
      {showMainAnnouncement(state.communication_format) ? (
        <Described label="Paste the main announcement (optional)">
          <span className="muted small">We'll check your draft says nothing that goes beyond or contradicts it.</span>
          <textarea rows={4} value={state.main_announcement} onChange={(e) => onChange({ ...state, main_announcement: e.target.value })} />
        </Described>
      ) : null}
      {disclosureMismatch(state) ? (
        <p className="notice" role="note">
          Your organization profile says it isn't listed. Change the profile or choose another format.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 3: who will receive this?
// ---------------------------------------------------------------------------

export function AudienceQuestion({ state, onChange, onTouch }: QuestionProps & { onTouch: () => void }) {
  const labelFor = (audience: Audience): string => {
    if (audience === AFFECTED_AUDIENCE) return affectedAudienceLabel(state.communication_event) ?? audience;
    if (audience === INVESTOR_AUDIENCE) return investorAudienceLabel(state.organization_type) ?? audience;
    return audience;
  };
  const groups: MenuGroup[] = AUDIENCE_GROUPS.map(([label, list]) => ({
    label,
    options: list
      .filter((a) => audienceVisible(a, state))
      .map((a) => ({ value: a, label: labelFor(a), note: AUDIENCE_DESCRIPTIONS[a] })),
  })).filter((g) => g.options.length > 0);

  return (
    <Menu
      label="Who will receive this?"
      hint="Multi-select. Assume anything you send may be seen by the media."
      placeholder="Select all that apply"
      groups={groups}
      multiple
      value={state.audiences}
      onChange={(next) => {
        onTouch();
        onChange({ ...state, audiences: next as Audience[] });
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 4: where do things stand?
// ---------------------------------------------------------------------------

const SITUATION_MENU: MenuGroup[] = [
  { label: "", options: SITUATION_STATUSES.map((s) => ({ value: s, label: s, note: SITUATION_DESCRIPTIONS[s] })) },
];

export function SituationQuestion({ state, onChange, onTouch }: QuestionProps & { onTouch: () => void }) {
  return (
    <div>
      <Menu
        label="Where do things stand?"
        placeholder="Choose one"
        groups={SITUATION_MENU}
        value={state.situation}
        onChange={(value) => {
          onTouch();
          onChange({ ...state, situation: value as IntakeState["situation"] });
        }}
      />
      <label className="choice">
        <input type="checkbox" checked={state.people_at_risk} onChange={(e) => onChange({ ...state, people_at_risk: e.target.checked })} />
        <span>People have been harmed or put at risk</span>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 5: where is this happening?
// ---------------------------------------------------------------------------

const LOCATION_MENU: MenuGroup[] = [
  { label: "Quick picks", options: LOCATION_QUICK_PICKS.map((p) => ({ value: p, label: p })) },
  { label: "Countries", options: COUNTRIES.map((c) => ({ value: c, label: c })) },
];

export function LocationQuestion({ state, onChange }: QuestionProps) {
  const notice = coverageNotice(state.locations);
  return (
    <div>
      <Menu
        label="Where is this happening?"
        hint="Multi-select. Quick picks at the top, then search for a country."
        placeholder="Where are the people affected?"
        groups={LOCATION_MENU}
        searchable
        multiple
        value={state.locations}
        onChange={(locations) => onChange({ ...state, locations })}
      >
        {showEuCountries(state.locations) ? (
          <p className="muted small menu-foot">Which EU countries? Worth adding: rules on consulting employees differ by country.</p>
        ) : null}
        {showGlobalCountries(state.locations) ? <p className="muted small menu-foot">Which countries are most affected?</p> : null}
      </Menu>
      {notice ? (
        <p className="notice" role="note">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2, question 6: what is this mainly trying to do?
// ---------------------------------------------------------------------------

const PURPOSE_MENU: MenuGroup[] = [
  { label: "", options: PURPOSES.map((p) => ({ value: p, label: p, note: PURPOSE_DESCRIPTIONS[p] })) },
];

export function PurposeQuestion({ state, onChange }: QuestionProps) {
  return (
    <Menu
      label="What is this mainly trying to do?"
      hint="One choice."
      placeholder="Choose the one that matters most"
      groups={PURPOSE_MENU}
      value={state.purpose}
      onChange={(value) => onChange({ ...state, purpose: value as IntakeState["purpose"] })}
    />
  );
}
