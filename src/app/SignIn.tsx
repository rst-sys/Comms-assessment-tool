import { useRef, useState, type FormEvent } from "react";
import { ApiError, signIn } from "./api.js";
import { APP_NAME, SIGNIN_INTRO } from "./copy.js";

/** Only a wrong password gets this; a server that can't be reached keeps its own message. */
const WRONG_PASSWORD = "That password didn’t work. Check it and try again.";
const EMPTY_PASSWORD = "Enter the password to continue.";

/**
 * The shared-password screen for a hosted deployment (revision 15). Not an
 * account: there is one password, the owner gives it to the testers, and it
 * exists so that a public address cannot spend the owner's provider credit.
 * The claude.ai page never shows this, because it runs on the viewer's own
 * Claude account.
 *
 * Built from the same pieces as the intake: the card, the label, the shared
 * input and focus ring, the primary button and the error panel. The button is
 * never greyed out for an empty field; pressing it says what is missing
 * instead, which is easier to understand than a button that does nothing.
 */
export function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!password.trim()) {
      setError(EMPTY_PASSWORD);
      input.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(password);
      onDone();
    } catch (err) {
      // The typed text stays, so a near-miss can be corrected rather than retyped.
      setError(err instanceof ApiError && err.status === 401 ? WRONG_PASSWORD : err instanceof ApiError ? err.message : "Could not check the password. Try again.");
      setBusy(false);
      input.current?.focus();
    }
  };

  return (
    <main className="page signin" aria-labelledby="signin-heading">
      <h1 id="signin-heading">{APP_NAME}</h1>
      <p className="welcome-intro">{SIGNIN_INTRO}</p>

      <section className="card step signin-card" aria-labelledby="password-heading">
        <h2 id="password-heading">Tester access</h2>
        <p>This prototype is open to a small group of testers. Enter the password you were given.</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor="password-input" className="label">Password</label>
          <div className="password-field">
            <input
              ref={input}
              id="password-input"
              type={shown ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="current-password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "password-error" : undefined}
              autoFocus
            />
            <button
              type="button"
              className="linklike password-toggle"
              aria-pressed={shown}
              aria-controls="password-input"
              onClick={() => setShown((v) => !v)}
            >
              {shown ? "Hide" : "Show"}
            </button>
          </div>
          {error ? (
            <p id="password-error" className="error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="signin-actions">
            <button type="submit" className="primary" disabled={busy}>
              {busy ? "Checking…" : "Continue"}
            </button>
          </div>
        </form>
        <p className="muted small signin-note">
          Everyone testing shares this password. It isn’t an account, and nothing about you is stored. Please ask
          before passing it on.
        </p>
      </section>
    </main>
  );
}
