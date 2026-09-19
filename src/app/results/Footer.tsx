import { CORE_PRINCIPLE, DECISION_SUPPORT_DISCLAIMER } from "../copy.js";

/** Footer of every results page and every print view (Section 9). */
export function Footer() {
  return (
    <footer className="site-footer">
      <blockquote>{CORE_PRINCIPLE}</blockquote>
      <p style={{ margin: 0 }}>{DECISION_SUPPORT_DISCLAIMER}</p>
    </footer>
  );
}
