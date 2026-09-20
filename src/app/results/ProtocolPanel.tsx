import type { ProtocolReview, ProtocolStatus } from "../../engine/types.js";
import { Panel } from "./Panel.js";

const STATUS_CLASS: Record<ProtocolStatus, string> = {
  Present: "verdict-resolved",
  Partial: "verdict-partly",
  Absent: "verdict-open",
};

/**
 * A type-specific protocol check (revision 14), such as the six elements of
 * an effective apology. Element by element, with the published source named.
 */
export function ProtocolPanel({ review }: { review: ProtocolReview }) {
  const present = review.elements.filter((e) => e.status === "Present").length;
  return (
    <Panel
      id="protocol-review"
      title={review.protocol}
      note={`${present} of ${review.elements.length} present`}
    >
      <ul className="verdict-list">
        {review.elements.map((e) => (
          <li key={e.name} className="verdict-item">
            <span className={`chip ${STATUS_CLASS[e.status] ?? ""}`}>{e.status}</span>
            <div>
              <div><strong>{e.name}</strong></div>
              <div className="muted small">{e.note}</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="muted small prose">
        These elements are a lens on the ten dimensions, not a separate score. Source: {review.source}
      </p>
    </Panel>
  );
}
