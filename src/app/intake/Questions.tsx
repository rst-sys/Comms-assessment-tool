/**
 * The eight questions the intake asks before the draft.
 *
 * Small, dumb components: each takes the whole intake state and a setter, and
 * renders one card. They live apart from IntakeScreen because the screen was
 * already the longest file in the app and this redesign trebled the number of
 * controls on it.
 */
import { useId, useMemo, useState, type ReactNode } from "react";
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

function Card({ id, title, hint, wide, children }: { id: string; title: string; hint?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <section className={wide ? "card question question-wide" : "card question"} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {hint ? <p className="muted small question-hint">{hint}</p> : null}
      {children}
    </section>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <div className="group-label">{children}</div>;
}

function Choice({
  name,
  value,
  checked,
  onSelect,
  description,
  type = "radio",
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  description?: string;
  type?: "radio" | "checkbox";
}) {
  return (
    <label className={description ? "choice choice-described" : "choice"}>
      <input type={type} name={name} value={value} checked={checked} onChange={onSelect} />
      <span className="choice-body">
        <span className="choice-label">{value}</span>
        {description ? <span className="choice-note">{description}</span> : null}
      </span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// 1. Before you start
// ---------------------------------------------------------------------------

export function OrganizationQuestion({ state, onChange }: QuestionProps) {
  const listedId = useId();
  const hqId = useId();
  const setType = (type: OrganizationType) => {
    const next: IntakeState = { ...state, organization_type: type };
    if (type !== "Publicly listed company") next.listed_where = "";
    next.audiences = next.audiences.filter((a) => audienceVisible(a, next));
    onChange(next);
  };
  return (
    <Card id="organization" title="Before you start" hint="Tell us about the organization you communicate for." wide>
      <div className="split-two">
        <div className="choice-list">
          {ORGANIZATION_TYPES.map((t) => (
            <Choice key={t} name="organization-type" value={t} checked={state.organization_type === t} onSelect={() => setType(t)} />
          ))}
        </div>
        <div>
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
          </label>
        </div>
      </div>
      <CountryList />
    </Card>
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
// 2. What's happening?
// ---------------------------------------------------------------------------

export function EventQuestion({ state, onChange }: QuestionProps) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return null;
    return EVENT_GROUPS.flatMap(([, events]) => events).filter((e) => e.toLowerCase().includes(q));
  }, [query]);

  const setEvent = (event: CommunicationEvent) => {
    const next: IntakeState = { ...state, communication_event: event };
    if (!showEventDescription(event)) next.event_description = "";
    next.audiences = next.audiences.filter((a) => audienceVisible(a, next));
    onChange(next);
  };

  const option = (e: CommunicationEvent, key?: string) => (
    <Choice key={key ?? e} name="communication-event" value={e} checked={state.communication_event === e} onSelect={() => setEvent(e)} />
  );

  return (
    <Card id="event" title="What's happening?" hint="Choose the closest match." wide>
      <label className="field search-field">
        <span className="label" id={searchId}>Search events</span>
        <input type="search" value={query} aria-labelledby={searchId} placeholder="Search events…" onChange={(e) => setQuery(e.target.value)} />
      </label>
      {matches ? (
        <div className="choice-list">
          {matches.length === 0 ? (
            <p className="muted small">Nothing matches "{query.trim()}". Clear the search, or choose "Something else" below.</p>
          ) : (
            matches.map((e) => option(e))
          )}
        </div>
      ) : (
        <div className="event-groups">
          <div className="event-group">
            <GroupLabel>Most common</GroupLabel>
            <div className="choice-list">{MOST_COMMON_EVENTS.map((e) => option(e, `common-${e}`))}</div>
          </div>
          {EVENT_GROUPS.map(([group, events]) => (
            <div className="event-group" key={group}>
              <GroupLabel>{group}</GroupLabel>
              <div className="choice-list">{events.map((e) => option(e))}</div>
            </div>
          ))}
        </div>
      )}
      <div className="choice-list choice-list-apart">
        <Choice
          name="communication-event"
          value={`${OTHER_EVENT}…`}
          checked={state.communication_event === OTHER_EVENT}
          onSelect={() => setEvent(OTHER_EVENT)}
        />
      </div>
      {showEventDescription(state.communication_event) ? (
        <label className="field">
          <span className="label">Briefly describe what's happening</span>
          <textarea
            rows={2}
            value={state.event_description}
            onChange={(e) => onChange({ ...state, event_description: e.target.value })}
          />
        </label>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3. What are you drafting?
// ---------------------------------------------------------------------------

export function FormatQuestion({
  state,
  onChange,
  audiencesTouched,
  situationTouched,
}: QuestionProps & { audiencesTouched: boolean; situationTouched: boolean }) {
  const setFormat = (format: CommunicationFormat) => {
    const next: IntakeState = { ...state, communication_format: format };
    if (!showFormatDescription(format)) next.format_description = "";
    if (!showMainAnnouncement(format)) next.main_announcement = "";
    if (!audiencesTouched) next.audiences = defaultAudiences(format, next);
    if (format === "Holding statement" && !situationTouched) next.situation = HOLDING_STATEMENT_SITUATION;
    onChange(next);
  };
  return (
    <Card id="format" title="What are you drafting?" hint="Choose a format.">
      {FORMAT_GROUPS.map(([group, formats]) => (
        <div key={group}>
          <GroupLabel>{group}</GroupLabel>
          <div className="choice-list">
            {formats.map((f) => (
              <Choice
                key={f}
                name="communication-format"
                value={f}
                description={FORMAT_DESCRIPTIONS[f]}
                checked={state.communication_format === f}
                onSelect={() => setFormat(f)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="choice-list choice-list-apart">
        <Choice
          name="communication-format"
          value={`${OTHER_FORMAT}…`}
          checked={state.communication_format === OTHER_FORMAT}
          onSelect={() => setFormat(OTHER_FORMAT)}
        />
      </div>
      {showFormatDescription(state.communication_format) ? (
        <label className="field">
          <span className="label">Describe what you're drafting</span>
          <textarea rows={2} value={state.format_description} onChange={(e) => onChange({ ...state, format_description: e.target.value })} />
        </label>
      ) : null}
      {showMainAnnouncement(state.communication_format) ? (
        <label className="field">
          <span className="label">Paste the main announcement (optional)</span>
          <span className="muted small">We'll check your draft says nothing that goes beyond or contradicts it.</span>
          <textarea rows={4} value={state.main_announcement} onChange={(e) => onChange({ ...state, main_announcement: e.target.value })} />
        </label>
      ) : null}
      {disclosureMismatch(state) ? (
        <p className="notice" role="note">
          Your organization profile says it isn't listed. Change the profile or choose another format.
        </p>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 4. Who will receive this?
// ---------------------------------------------------------------------------

export function AudienceQuestion({ state, onChange, onTouch }: QuestionProps & { onTouch: () => void }) {
  const toggle = (audience: Audience) => {
    onTouch();
    const has = state.audiences.includes(audience);
    onChange({
      ...state,
      audiences: has ? state.audiences.filter((a) => a !== audience) : [...state.audiences, audience],
    });
  };
  const labelFor = (audience: Audience): string => {
    if (audience === AFFECTED_AUDIENCE) return affectedAudienceLabel(state.communication_event) ?? audience;
    if (audience === INVESTOR_AUDIENCE) return investorAudienceLabel(state.organization_type) ?? audience;
    return audience;
  };
  const groups = AUDIENCE_GROUPS.map(([group, list]) => [group, list.filter((a) => audienceVisible(a, state))] as const).filter(
    ([, list]) => list.length > 0,
  );
  return (
    <Card
      id="audiences"
      title="Who will receive this?"
      hint={
        <>
          Select all that apply. Assume anything you send may be seen by the media.
        </>
      }
    >
      {groups.map(([group, list]) => (
        <div key={group}>
          <GroupLabel>{group}</GroupLabel>
          <div className="choice-list">
            {list.map((a) => (
              <Choice
                key={a}
                type="checkbox"
                name={`audience-${a}`}
                value={labelFor(a)}
                description={AUDIENCE_DESCRIPTIONS[a]}
                checked={state.audiences.includes(a)}
                onSelect={() => toggle(a)}
              />
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 5. Where do things stand?
// ---------------------------------------------------------------------------

export function SituationQuestion({ state, onChange, onTouch }: QuestionProps & { onTouch: () => void }) {
  return (
    <Card id="situation" title="Where do things stand?">
      <div className="choice-list">
        {SITUATION_STATUSES.map((s) => (
          <Choice
            key={s}
            name="situation"
            value={s}
            description={SITUATION_DESCRIPTIONS[s]}
            checked={state.situation === s}
            onSelect={() => {
              onTouch();
              onChange({ ...state, situation: s });
            }}
          />
        ))}
      </div>
      <label className="choice choice-apart">
        <input
          type="checkbox"
          checked={state.people_at_risk}
          onChange={(e) => onChange({ ...state, people_at_risk: e.target.checked })}
        />
        <span className="choice-body">
          <span className="choice-label">People have been harmed or put at risk.</span>
        </span>
      </label>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 6. Where is this happening?
// ---------------------------------------------------------------------------

export function LocationQuestion({ state, onChange }: QuestionProps) {
  const [entry, setEntry] = useState("");
  const searchId = useId();

  const add = (place: string) => {
    const name = place.trim();
    if (name.length === 0 || state.locations.includes(name)) return;
    onChange({ ...state, locations: [...state.locations, name] });
  };
  const remove = (place: string) => onChange({ ...state, locations: state.locations.filter((l) => l !== place) });
  const toggle = (place: string) => (state.locations.includes(place) ? remove(place) : add(place));

  const commit = () => {
    add(entry);
    setEntry("");
  };

  const notice = coverageNotice(state.locations);

  return (
    <Card id="locations" title="Where is this happening?" hint="Where are the people affected by this?">
      <GroupLabel>Quick picks</GroupLabel>
      <div className="choice-list">
        {LOCATION_QUICK_PICKS.map((p) => (
          <Choice key={p} type="checkbox" name={`location-${p}`} value={p} checked={state.locations.includes(p)} onSelect={() => toggle(p)} />
        ))}
      </div>
      <label className="field">
        <span className="label" id={searchId}>Or search for a country</span>
        <div className="url-input">
          <input
            type="text"
            value={entry}
            list="country-list"
            aria-labelledby={searchId}
            placeholder="Type a country…"
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
          <button type="button" onClick={commit} disabled={entry.trim().length === 0}>
            Add
          </button>
        </div>
      </label>
      {showEuCountries(state.locations) ? (
        <p className="muted small">Which EU countries? Optional, and worth adding: rules on consulting employees differ by country.</p>
      ) : null}
      {showGlobalCountries(state.locations) ? (
        <p className="muted small">Which countries are most affected? Optional.</p>
      ) : null}
      {state.locations.length > 0 ? (
        <ul className="tag-list">
          {state.locations.map((l) => (
            <li key={l}>
              <button type="button" className="tag" onClick={() => remove(l)} aria-label={`Remove ${l}`}>
                {l} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {notice ? (
        <p className="notice" role="note">
          {notice}
        </p>
      ) : null}
      <CountryList />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 7. What is this draft mainly trying to do?
// ---------------------------------------------------------------------------

export function PurposeQuestion({ state, onChange }: QuestionProps) {
  return (
    <Card id="purpose" title="What is this draft mainly trying to do?" hint="Choose the one that matters most." wide>
      <div className="choice-list choice-list-columns">
        {PURPOSES.map((p) => (
          <Choice
            key={p}
            name="purpose"
            value={p}
            description={PURPOSE_DESCRIPTIONS[p]}
            checked={state.purpose === p}
            onSelect={() => onChange({ ...state, purpose: p })}
          />
        ))}
      </div>
    </Card>
  );
}
