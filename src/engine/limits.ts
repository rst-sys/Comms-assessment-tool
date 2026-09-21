/**
 * Output budget (step 3 of the protocol architecture).
 *
 * Output is the expensive half of a review: the model writes it a word at a
 * time, at roughly a second for every forty words on this build. Instructions
 * are cheap by comparison — they are read in parallel and cached. So the
 * protocol library can grow without making the tool slower, but only if the
 * amount the model WRITES is fixed rather than growing with it.
 *
 * Without a cap, every protocol added would lengthen both the wait and the
 * results page, undoing the redesign that cut the page down in the first
 * place. With one, a protocol competes for space instead of adding to it, and
 * the model has to decide what matters most — which is the judgement the
 * reader wanted anyway.
 *
 * The numbers live here so the prompt that asks for them, the normalizer that
 * trims an overrun and the validator that reports it cannot drift apart.
 */

/**
 * The most findings a review may carry. Real reviews of the demo fixtures
 * produce six to eleven, so ten holds today's worst case while leaving a
 * protocol no room to inflate it.
 */
export const MAX_FINDINGS = 10;

/**
 * The most questions a review may carry. The old ceiling was twelve and every
 * fixture ran straight into it, which is what a ceiling set too high looks
 * like: no ranking, just a list that stops. Eight forces a choice between the
 * core's questions, the event protocol's and the draft's own.
 */
export const MAX_QUESTIONS = 8;

/** Below this, a review is suspiciously thin rather than clean. */
export const MIN_QUESTIONS = 5;
