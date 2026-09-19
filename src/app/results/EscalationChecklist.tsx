import { specialistQuestions } from "./model.js";

/** Section 10: under heightened review, the questions that name a review function, above the findings. */
export function EscalationChecklist({ questions }: { questions: string[] }) {
  const items = specialistQuestions(questions);
  if (items.length === 0) return null;
  return (
    <section className="card" id="escalation" aria-labelledby="escalation-heading">
      <h2 id="escalation-heading">Resolve with specialists</h2>
      <p className="muted" style={{ marginTop: 4 }}>Heightened review is on. These questions name a review function and should be settled before this is issued.</p>
      <ol className="tight">
        {items.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
    </section>
  );
}
