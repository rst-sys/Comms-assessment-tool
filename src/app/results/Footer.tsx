import { COPYRIGHT, CORE_PRINCIPLE } from "../copy.js";

/** Footer of every results page and every print view (Section 9). */
export function Footer() {
  return (
    <footer className="site-footer">
      <blockquote>{CORE_PRINCIPLE}</blockquote>
      <p className="copyright" style={{ margin: 0 }}>{COPYRIGHT}</p>
    </footer>
  );
}
