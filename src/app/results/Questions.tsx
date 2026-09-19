import { useState } from "react";
import { Panel } from "./Panel.js";

export function Questions({ questions }: { questions: string[] }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Panel id="questions" title="Questions before publication" note={`${questions.length}`}>
      <ol className="tight">
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
      <p className="no-print">
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy questions"}</button>
      </p>
    </Panel>
  );
}
