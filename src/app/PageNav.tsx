import { useEffect, useState } from "react";

export interface PageSection {
  id: string;
  title: string;
}

/**
 * The "On this page" list the long explanatory pages carry.
 *
 * One component, used by the Tool Overview and the Standards Library. Both
 * are pages somebody opens with a question, and a contents list that tracks
 * where you are is what turns a long read into something you can skim to the
 * answer.
 */
export function PageNav({ sections }: { sections: PageSection[] }) {
  const active = useActiveSection(sections.map((s) => s.id));
  return (
    <nav className="toc no-print" aria-label="On this page">
      <p className="toc-label">On this page</p>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={active === s.id ? "toc-link toc-current" : "toc-link"}
              aria-current={active === s.id ? "true" : undefined}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Which section the reader is in.
 *
 * Measured on scroll rather than with an IntersectionObserver. The observer
 * version highlighted the wrong entry twice: two sections are often in the
 * band at once, and at the foot of the page the last section's heading has
 * already scrolled above it, so the reader sits in the last section while the
 * list still says the one before. This rule has neither problem — the current
 * section is the last one whose heading is above the fold, and the bottom of
 * the page is always the last section.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join(",");
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        setActive(ids[ids.length - 1] ?? null);
        return;
      }
      let current = ids[0] ?? null;
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= 120) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);
  return active;
}
