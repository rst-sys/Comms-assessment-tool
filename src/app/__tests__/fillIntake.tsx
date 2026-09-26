// @vitest-environment jsdom
import { fireEvent, screen, within } from "@testing-library/react";

/**
 * Fills the intake by hand: the three demo buttons that used to do it in one
 * click were removed with the rest of the demo mode, so the tests answer the
 * eight questions the way a user does.
 */

/** A draft comfortably over the 50-word floor, so the Evaluate button is the thing under test. */
export const LONG_DRAFT = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");

/**
 * Opens one of the six dropdowns in step 2 and returns a picker for its
 * options. The control's accessible name is the question plus whatever is
 * chosen, so it is matched on the question alone.
 */
export function menu(question: string | RegExp) {
  const control = screen.getByRole("button", { name: typeof question === "string" ? new RegExp(`^${question}`) : question });
  if (control.getAttribute("aria-expanded") !== "true") fireEvent.click(control);
  const panel = screen.getByRole("listbox", { name: question });
  return {
    control,
    pick(option: string | RegExp) {
      // An event can sit in Most common and in its own group, and a country
      // can be a quick pick and a country; either copy will do.
      fireEvent.click(within(panel).getAllByRole("option", { name: option })[0]!);
    },
    close() {
      fireEvent.keyDown(document, { key: "Escape" });
    },
  };
}

/** Whether a dropdown currently shows this answer as chosen. */
export function chosen(question: string | RegExp, option: string | RegExp): boolean {
  const control = screen.getByRole("button", { name: typeof question === "string" ? new RegExp(`^${question}`) : question });
  const text = control.textContent ?? "";
  return typeof option === "string" ? text.includes(option) : option.test(text);
}

/**
 * Answers every required question for a layoff memo and pastes a draft over
 * the word floor, which is what the "Restructuring memo" demo button used to
 * set up. Leaves the audiences as the format pre-selected them.
 */
export function fillLayoffIntake(draft: string = LONG_DRAFT): void {
  fireEvent.click(screen.getByRole("radio", { name: "Private company" }));
  menu("Headquarters").pick("United States");
  menu("What's happening?").pick("Layoffs or job cuts");
  menu("What are you drafting?").pick(/Employee announcement/);
  menu("Where do things stand?").pick(/Not yet public/);
  const where = menu("Where is this happening?");
  where.pick("United States");
  where.close();
  menu(/What is this mainly trying to do/).pick(/Announce a decision or change/);
  fireEvent.change(screen.getByLabelText("Draft text"), { target: { value: draft } });
}
