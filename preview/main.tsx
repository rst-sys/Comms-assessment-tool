/**
 * A local preview of the results page, rendered from a captured review.
 *
 * Not part of either shipped build. It exists because the results page cannot
 * otherwise be seen without spending a real provider call, which made design
 * changes impossible to check. `npm run preview:results` builds it.
 */
import { createRoot } from "react-dom/client";
import { ResultsPage } from "../src/app/results/ResultsPage.js";
import { DEMO_1 } from "../src/engine/fixtures.js";
import type { EvaluationResult } from "../src/engine/evaluate.js";
import "../src/app/styles.css";

const captured = import.meta.glob("../fixture-reports/demo1-*.json", { eager: true });
const first = Object.values(captured)[0] as { default: EvaluationResult } | undefined;
if (!first) throw new Error("no captured demo1 review in fixture-reports/");

createRoot(document.getElementById("root")!).render(
  <ResultsPage result={first.default} request={DEMO_1.request} />,
);
