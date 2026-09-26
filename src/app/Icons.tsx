/**
 * The line icons the interface uses. Inline SVG, stroked, round caps, sized
 * in ems so they follow their text; no icon font and no emoji, both of which
 * render differently on every machine.
 *
 * Every one is aria-hidden: each sits beside a label that already says what
 * it means, so a screen reader announcing it twice would be noise.
 */
const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

export function ShieldCheck({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M12 3 4.5 6v5.3c0 4.4 3 8.4 7.5 9.7 4.5-1.3 7.5-5.3 7.5-9.7V6Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  );
}

export function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} strokeWidth={2}>
      <path d="M4.5 12h15" />
      <path d="m13 5.5 6.5 6.5L13 18.5" />
    </svg>
  );
}

export function WarningTriangle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M12 4.2 2.8 19.2h18.4Z" />
      <path d="M12 9.6v4.2" />
      <path d="M12 16.6h.01" />
    </svg>
  );
}

export function Lock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <rect x="4" y="10" width="16" height="10.5" rx="2" />
      <path d="M7.75 10V7.2a4.25 4.25 0 0 1 8.5 0V10" />
    </svg>
  );
}

export function CircleSlash({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="m6.1 17.9 11.8-11.8" />
    </svg>
  );
}

export function Clock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3 1.8" />
    </svg>
  );
}
