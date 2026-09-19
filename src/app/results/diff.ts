/**
 * Word-level diff for the side-by-side redraft view. Sentences are aligned
 * first with a longest-common-subsequence pass, then changed sentence runs
 * are compared word by word. Both passes are small enough for drafts of up
 * to 5,000 words.
 */
export type DiffOp = { type: "equal" | "delete" | "insert"; text: string };

function lcsDiff<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): { type: "equal" | "delete" | "insert"; item: T }[] {
  const n = a.length;
  const m = b.length;
  const table: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i]![j] = eq(a[i]!, b[j]!) ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  const out: { type: "equal" | "delete" | "insert"; item: T }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(a[i]!, b[j]!)) {
      out.push({ type: "equal", item: a[i]! });
      i++;
      j++;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      out.push({ type: "delete", item: a[i]! });
      i++;
    } else {
      out.push({ type: "insert", item: b[j]! });
      j++;
    }
  }
  while (i < n) out.push({ type: "delete", item: a[i++]! });
  while (j < m) out.push({ type: "insert", item: b[j++]! });
  return out;
}

/** Splits text into words with their trailing whitespace attached (leading whitespace stands alone), so joining reproduces the text. */
export function tokenizeWords(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

/** Splits into sentence-ish chunks that include their trailing whitespace, so joining reproduces the text. */
export function tokenizeSentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?]*\s*|\n+/g) ?? [];
}

const norm = (s: string) => s.trim();

function mergeOps(ops: DiffOp[]): DiffOp[] {
  const merged: DiffOp[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) last.text += op.text;
    else merged.push({ ...op });
  }
  return merged.filter((op) => op.text.length > 0);
}

/** A diff of the two texts as runs of equal, deleted and inserted text. Deleted runs come before inserted runs. */
export function diffText(original: string, revised: string): DiffOp[] {
  const sentenceOps = lcsDiff(tokenizeSentences(original), tokenizeSentences(revised), (x, y) => norm(x) === norm(y));
  const ops: DiffOp[] = [];
  let i = 0;
  while (i < sentenceOps.length) {
    const op = sentenceOps[i]!;
    if (op.type === "equal") {
      ops.push({ type: "equal", text: op.item });
      i++;
      continue;
    }
    // Collect a run of deletes and inserts and diff them word by word.
    let deleted = "";
    let inserted = "";
    while (i < sentenceOps.length && sentenceOps[i]!.type !== "equal") {
      if (sentenceOps[i]!.type === "delete") deleted += sentenceOps[i]!.item;
      else inserted += sentenceOps[i]!.item;
      i++;
    }
    const dw = tokenizeWords(deleted);
    const iw = tokenizeWords(inserted);
    const wordOps = lcsDiff(dw, iw, (x, y) => norm(x) === norm(y));
    // A wholesale rewrite reads better as one replaced block than as scattered shared words.
    const shared = wordOps.filter((w) => w.type === "equal").length;
    if (shared < Math.max(dw.length, iw.length) * 0.5) {
      if (deleted) ops.push({ type: "delete", text: deleted });
      if (inserted) ops.push({ type: "insert", text: inserted });
    } else {
      for (const w of wordOps) ops.push({ type: w.type, text: w.item });
    }
  }
  return mergeOps(ops);
}
