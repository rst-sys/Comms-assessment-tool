import { BUILD_ID } from "../build.js";
import { COPYRIGHT, CORE_PRINCIPLE } from "../copy.js";

/**
 * Footer of every screen and every print view (Section 9).
 *
 * The build stamp is here so a tester can answer "am I looking at the version
 * you just pushed?" without asking. It is baked into the page at build time,
 * so a tab left open across a deploy keeps showing the old stamp — which is
 * the answer you want, not a reassuring lie from the server.
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <blockquote>{CORE_PRINCIPLE}</blockquote>
      <p className="copyright" style={{ margin: 0 }}>{COPYRIGHT}</p>
      <p className="build-stamp" style={{ margin: 0 }}>Build {BUILD_ID}</p>
    </footer>
  );
}
