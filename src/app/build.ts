/**
 * Which build this page is.
 *
 * Baked in at build time rather than fetched from the server, because the
 * question it answers is "is the page in front of me the one that was just
 * deployed?" — and a tab left open across a deploy keeps its old code while
 * the server moves on. A stamp read from the server would say "new" on a page
 * that is anything but.
 *
 * It exists because a deploy takes a few minutes on the host, and a review run
 * inside that window hits whichever build is still up. That cost an afternoon
 * of chasing a fault that had already been fixed.
 */
declare const __BUILD_ID__: string | undefined;

export const BUILD_ID: string =
  typeof __BUILD_ID__ === "string" && __BUILD_ID__.length > 0 ? __BUILD_ID__ : "dev";

declare const __BUILD_INFO__: { commit: string | null; builtAt: string; year: number } | undefined;

const INFO = typeof __BUILD_INFO__ === "object" && __BUILD_INFO__ !== null ? __BUILD_INFO__ : null;

/** The short commit this page was built from, or null where no build could tell. */
export const BUILD_COMMIT: string | null = INFO && typeof INFO.commit === "string" && INFO.commit.length > 0 ? INFO.commit : null;

/**
 * The year for the copyright line: the build's, so a live page never shows a
 * stale one. Outside a build (a test run without the define), this year.
 */
export const BUILD_YEAR: number = INFO && Number.isInteger(INFO.year) ? INFO.year : new Date().getUTCFullYear();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The build date as "28 Sep 2026", in UTC so every tester sees the same day.
 * Months are spelled out here rather than through the browser's locale, which
 * would print "Sept" in one browser and "sept." in another. Null where the
 * build carried no date, so the footer can leave it out rather than print a
 * blank.
 */
export const BUILD_DATE_LABEL: string | null = (() => {
  if (!INFO || typeof INFO.builtAt !== "string") return null;
  const d = new Date(INFO.builtAt);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
})();
