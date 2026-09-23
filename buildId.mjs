/**
 * The build stamp the app shows in its footer. Render sets RENDER_GIT_COMMIT;
 * locally we ask git; a checkout with neither is "dev".
 */
import { execSync } from "node:child_process";

export function buildId() {
  const fromHost = process.env.RENDER_GIT_COMMIT;
  if (fromHost) return `${fromHost.slice(0, 7)} ${stamp()}`;
  try {
    const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    return `${sha} ${stamp()}`;
  } catch {
    return `dev ${stamp()}`;
  }
}

function stamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ") + "Z";
}
