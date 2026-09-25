import { BUILD_ID } from "../build.js";
import { COPYRIGHT } from "../copy.js";

/**
 * Footer of every screen and every print view (Section 9).
 *
 * The closing principle used to sit above the copyright on every screen. It
 * is still the line the tool is built on and still closes the PDF, but on
 * screen it was three lines of philosophy under every page, read once and
 * scrolled past forever after.
 *
 * The build stamp is here so a tester can answer "am I looking at the version
 * you just pushed?" without asking. It is baked into the page at build time,
 * so a tab left open across a deploy keeps showing the old stamp — which is
 * the answer you want, not a reassuring lie from the server.
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <p className="copyright" style={{ margin: 0 }}>{COPYRIGHT}</p>
      <p className="build-stamp" style={{ margin: 0 }}>Build {BUILD_ID}</p>
    </footer>
  );
}
