/**
 * Which parts of the tool are switched on for the current round of testing
 * (revision 16).
 *
 * The owner turned four things off so the first group of testers concentrates
 * on the one thing being tested: reviewing a draft. Nothing is deleted. Each
 * control stays visible and disabled with a "Coming soon" note, so a tester
 * can see the tool is meant to do it and knows not to report it missing.
 *
 * Heightened review stays ON. It costs almost nothing, and it is what makes
 * the tool stricter on layoffs, safety and privacy; switching it off would
 * have had testers reviewing with a softer engine than the real one.
 *
 * To switch one back on, change false to true here and rebuild. That is the
 * only place to change.
 */
export interface Features {
  /** Save a review to a file, to compare a later draft against. */
  saveReview: boolean;
  /** Load a saved review and compare a new draft with it. */
  compareRevisions: boolean;
  /** The stricter thresholds for sensitive subjects. */
  heightenedReview: boolean;
  /** Attach documents the audience already has or will receive. */
  audienceDocuments: boolean;
  /** Search the public web for context (costs an extra provider call). */
  publicContextSearch: boolean;
}

export const FEATURES: Features = {
  saveReview: false,
  compareRevisions: false,
  heightenedReview: true,
  audienceDocuments: false,
  publicContextSearch: false,
};

/** The note shown beside anything switched off. */
export const COMING_SOON = "Coming soon — switched off for this round of testing.";
