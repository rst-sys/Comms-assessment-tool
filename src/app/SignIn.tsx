import { useState, type FormEvent } from "react";
import { ApiError, signIn } from "./api.js";
import { APP_NAME, INTRO } from "./copy.js";

/**
 * The shared-password screen for a hosted deployment (revision 15). Not an
 * account: there is one password, the owner gives it to the testers, and it
 * exists so that a public address cannot spend the owner's provider credit.
 * The claude.ai page never shows this, because it runs on the viewer's own
 * Claude account.
 */
export function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(password);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not check the password. Try again.");
      setBusy(false);
    }
  };

  return (
    <main className="page signin" aria-labelledby="signin-heading">
      <h1 id="signin-heading">{APP_NAME}</h1>
      <p className="welcome-intro">{INTRO}</p>

      <section className="card" aria-labelledby="password-heading">
        <h2 id="password-heading" style={{ marginTop: 0 }}>Enter the password</h2>
        <p className="prose">
          This is a prototype shared with a small group of testers. Enter the password you were given.
        </p>
        <form onSubmit={submit}>
          <label className="field">
            <span className="label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-label="Password"
              autoFocus
            />
          </label>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <p className="results-actions">
            <button type="submit" className="primary" disabled={busy || !password.trim()}>
              {busy ? "Checking…" : "Continue"}
            </button>
          </p>
        </form>
        <p className="muted small prose">
          The password is shared by everyone testing this prototype. It is not an account, and nothing about you is
          stored. Do not pass it on without asking the owner.
        </p>
      </section>
    </main>
  );
}
