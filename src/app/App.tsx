import { useState } from "react";
import { TAGLINE } from "./copy.js";
import { ResultsPage } from "./results/ResultsPage.js";
import { SAMPLES } from "./samples.js";

/**
 * Step 2 shell: shows the results page for a captured sample analysis. The
 * intake screen (step 3) replaces the sample picker with a live evaluation.
 */
export function App() {
  const [key, setKey] = useState(SAMPLES[0]?.key ?? "");
  const sample = SAMPLES.find((s) => s.key === key);
  return (
    <>
      <header className="page no-print" style={{ paddingBottom: 0 }}>
        <h1 style={{ marginBottom: 4 }}>Accountable Communications Review</h1>
        <p className="muted" style={{ marginTop: 0 }}>{TAGLINE}</p>
        <label>
          Sample analysis{" "}
          <select value={key} onChange={(e) => setKey(e.target.value)}>
            {SAMPLES.map((s) => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
        </label>
      </header>
      {sample ? <ResultsPage result={sample.result} request={sample.request} /> : <p className="page">No sample analyses found.</p>}
    </>
  );
}
