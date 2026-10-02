/**
 * Loads a local .env file (KEY=VALUE lines) into process.env for keys that
 * are not already set. Only ACR_ and ANTHROPIC_ keys are read, so the file
 * cannot change anything else about the process. The file is gitignored.
 */
import { existsSync, readFileSync } from "node:fs";

export function parseEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (/^(ACR_|ANTHROPIC_)[A-Z0-9_]+$/.test(key)) out[key] = value;
  }
  return out;
}

export function loadEnvFile(path = ".env", env: NodeJS.ProcessEnv = process.env): string[] {
  if (!existsSync(path)) return [];
  const loaded: string[] = [];
  for (const [key, value] of Object.entries(parseEnv(readFileSync(path, "utf8")))) {
    if (!env[key]) {
      env[key] = value;
      loaded.push(key);
    }
  }
  return loaded;
}
