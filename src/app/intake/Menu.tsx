/**
 * One dropdown, used for all six questions in step 2.
 *
 * Native <select> could not do three of the six: the event list needs a
 * search, and two of them take more than one answer. Rather than run two
 * kinds of control down the same grid, everything is this one — a button
 * that opens a panel, grouped options inside, search when the list is long,
 * tick-boxes and chips when more than one answer is allowed.
 *
 * It closes on Escape, on a click outside, and (when only one answer is
 * allowed) on choosing. Chips remove without opening it.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface MenuOption {
  value: string;
  label: string;
  /** A second line under the label, in the menu and nowhere else. */
  note?: string;
}

export interface MenuGroup {
  label: string;
  options: MenuOption[];
}

interface CommonProps {
  label: string;
  /** The line under the control: what this question is and how it behaves. */
  hint?: ReactNode;
  placeholder: string;
  groups: MenuGroup[];
  /** Show a search box above the options. */
  searchable?: boolean;
  /** Shown under the search box when nothing matches and the text can still be used. */
  children?: ReactNode;
}

type SingleProps = CommonProps & { multiple?: false; value: string; onChange: (value: string) => void };
type MultiProps = CommonProps & { multiple: true; value: string[]; onChange: (value: string[]) => void };

export function Menu(props: SingleProps | MultiProps) {
  const { label, hint, placeholder, groups, searchable } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const all = groups.flatMap((g) => g.options);
  const q = query.trim().toLowerCase();
  const shown: MenuGroup[] = q
    ? [{ label: "", options: all.filter((o) => o.label.toLowerCase().includes(q)) }]
    : groups;

  const chosen = props.multiple ? props.value : props.value === "" ? [] : [props.value];
  const labelOf = (value: string) => all.find((o) => o.value === value)?.label ?? value;

  const pick = (value: string) => {
    if (props.multiple) {
      props.onChange(props.value.includes(value) ? props.value.filter((v) => v !== value) : [...props.value, value]);
    } else {
      props.onChange(value);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="menu-field" ref={wrap}>
      <span className="label" id={labelId}>{label}</span>
      {/* The panel hangs off this, not off the whole field: anchoring it to
          the field put it below the hint line and left a gap. */}
      <div className="menu-anchor">
      <button
        type="button"
        className={open ? "menu-control menu-control-open" : "menu-control"}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? panelId : undefined}
        aria-labelledby={`${labelId} ${panelId}-value`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="menu-value" id={`${panelId}-value`}>
          {chosen.length === 0 ? (
            <span className="menu-placeholder">{placeholder}</span>
          ) : props.multiple ? (
            <span className="chip-row">
              {chosen.map((v) => (
                <span key={v} className="chip-choice">
                  {labelOf(v)}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${labelOf(v)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onChange(props.value.filter((x) => x !== v));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        props.onChange(props.value.filter((x) => x !== v));
                      }
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </span>
          ) : (
            labelOf(chosen[0] ?? "")
          )}
        </span>
        <span className="menu-caret" aria-hidden="true" />
      </button>
      {open ? (
        <div className="menu-panel" id={panelId} role="listbox" aria-multiselectable={props.multiple} aria-labelledby={labelId}>
          {searchable ? (
            <input
              type="search"
              className="menu-search"
              autoFocus
              value={query}
              placeholder="Search…"
              aria-label={`Search ${label}`}
              onChange={(e) => setQuery(e.target.value)}
            />
          ) : null}
          <div className="menu-options">
            {shown.every((g) => g.options.length === 0) ? <p className="muted small menu-empty">Nothing matches.</p> : null}
            {shown.map((group) => (
              <div key={group.label} className="menu-group">
                {group.label ? <div className="group-label">{group.label}</div> : null}
                {group.options.map((o) => {
                  const on = chosen.includes(o.value);
                  return (
                    <div
                      key={`${group.label}-${o.value}`}
                      role="option"
                      aria-selected={on}
                      tabIndex={0}
                      className={on ? "menu-option menu-option-on" : "menu-option"}
                      onClick={() => pick(o.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          pick(o.value);
                        }
                      }}
                    >
                      <span className="menu-tick" aria-hidden="true">{on ? "✓" : ""}</span>
                      <span>
                        <span className="menu-option-label">{o.label}</span>
                        {o.note ? <span className="menu-option-note">{o.note}</span> : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {props.children}
        </div>
      ) : null}
      </div>
      {hint ? <p className="menu-hint muted small">{hint}</p> : null}
    </div>
  );
}
