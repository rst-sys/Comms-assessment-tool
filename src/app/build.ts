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
