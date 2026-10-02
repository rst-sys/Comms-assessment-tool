/**
 * A field path that is safe to write to the log.
 *
 * Validation errors name the failing field as a JSON pointer built from the
 * object keys and list positions in the data. The keys come from whoever sent
 * the data (the model's reply, or the browser's request), so in principle a
 * key could carry any text. This keeps only list positions and the field
 * names the schema itself declares, and replaces anything else with "*".
 */
export function safePointer(pointer: string, schema: unknown): string {
  const names = declaredNames(schema);
  if (!pointer) return "/";
  const segments = pointer.split("/").slice(1);
  return "/" + segments.map((s) => (/^\d{1,4}$/.test(s) || names.has(s) ? s : "*")).join("/");
}

const cache = new WeakMap<object, Set<string>>();

function declaredNames(schema: unknown): Set<string> {
  if (typeof schema !== "object" || schema === null) return new Set();
  const cached = cache.get(schema);
  if (cached) return cached;
  const names = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node !== "object" || node === null) return;
    const properties = (node as { properties?: unknown }).properties;
    if (typeof properties === "object" && properties !== null) {
      for (const key of Object.keys(properties)) names.add(key);
    }
    Object.values(node).forEach(walk);
  };
  walk(schema);
  cache.set(schema, names);
  return names;
}
