import { useEffect, useState } from "react";

/**
 * What the reader sees while a review runs (revision 17).
 *
 * A review takes a minute or more, and a button reading "Evaluating…" for that
 * long reads as a hung page. This says what is happening, counts the seconds
 * so the page is visibly alive, and sets the expectation up front. It does not
 * pretend to know the engine's real progress: the stages are described in the
 * order the prompt asks for them, and the last one holds until the reply
 * arrives rather than creeping towards a fake hundred per cent.
 */
const STAGES: { at: number; text: string }[] = [
  { at: 0, text: "Reading your draft and the context you gave" },
  { at: 12, text: "Checking what account the draft gives: decision, agency, cause, impact" },
  { at: 32, text: "Scoring the ten dimensions and gathering the evidence for each" },
  { at: 55, text: "Writing the findings and the Devil's Advocate reading" },
  { at: 80, text: "Finishing the review and checking it over" },
];

/** Expected time for a review, from the runs measured so far. */
const TYPICAL_SECONDS = 90;

export function Progress({ label = "Reviewing your draft" }: { label?: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stage = [...STAGES].reverse().find((s) => seconds >= s.at) ?? STAGES[0]!;
  const overrun = seconds > TYPICAL_SECONDS * 1.6;
  // Never shows a full bar while still waiting: it eases towards 95% and stops.
  const percent = Math.min(95, Math.round((seconds / TYPICAL_SECONDS) * 95));

  return (
    <section className="card progress" role="status" aria-live="polite" aria-labelledby="progress-heading">
      <h2 id="progress-heading" style={{ marginTop: 0 }}>{label}</h2>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-stage">{stage.text}…</p>
      <p className="muted small">
        {seconds}s elapsed. A full review usually takes about a minute and a half, because the engine reads the draft
        closely rather than skimming it. You can leave this tab open and come back.
      </p>
      {overrun ? (
        <p className="muted small">
          This one is taking longer than usual. It is still running — nothing has failed. If it passes five minutes,
          something has gone wrong and it is worth starting again.
        </p>
      ) : null}
    </section>
  );
}
