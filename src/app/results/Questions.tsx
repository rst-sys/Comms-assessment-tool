import { useState } from "react";
import { reviewTagsFor } from "./model.js";
import { Panel } from "./Panel.js";
import { NO_DRAFT_QUESTIONS } from "../copy.js";

/**
 * Questions worth asking (revision 21).
 *
 * One section, where there used to be two. "Questions for subject matter
 * reviewers" was never a separate list — it was this list filtered for
 * questions naming a review function, which meant a reader under heightened
 * review met some questions twice, in two places. Now each question that needs
 * a named reviewer carries a tag, and nothing is printed twice.
 */
export function Questions({ questions }: { questions: string[] }) {
  const [copied, setCopied] = useState(false);
  const tagged = questions.map((q) => ({ text: q, tags: reviewTagsFor(q) }));
  const needingReview = tagged.filter((q) => q.tags.length > 0).length;

  const copy = async () => {
    const text = tagged
      .map((q, i) => `${i + 1}. ${q.text}${q.tags.length ? ` [${q.tags.join(", ")}]` : ""}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel id="questions" title="Questions worth asking" note={`${questions.length}`}>
      {questions.length === 0 ? <p className="prose" style={{ marginTop: 0 }}>{NO_DRAFT_QUESTIONS}</p> : null}
      {needingReview > 0 ? (
        <p className="muted prose" style={{ marginTop: 0 }}>
          {needingReview} of these name a review function. Settle those before this is issued.
        </p>
      ) : null}
      <ol className="tight">
        {tagged.map((q, i) => (
          <li key={i}>
            {q.text}
            {q.tags.map((t) => (
              <span key={t} className="chip question-tag">{t}</span>
            ))}
          </li>
        ))}
      </ol>
      {questions.length > 0 ? (
        <p className="no-print">
          <button type="button" onClick={copy}>{copied ? "Copied" : "Copy questions"}</button>
        </p>
      ) : null}
    </Panel>
  );
}
