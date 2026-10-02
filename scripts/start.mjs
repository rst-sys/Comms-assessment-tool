// One-step start for people who do not use a terminal: checks Node, installs
// dependencies, builds the app, asks for the API key once (saved to .env,
// which is never committed), starts the server and opens the browser.
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
process.chdir(root);

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.log(`This app needs Node.js 20 or newer. You have ${process.versions.node}. Install the LTS version from https://nodejs.org and try again.`);
  process.exit(1);
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

if (!existsSync(join(root, "node_modules"))) run("npm install");
if (!existsSync(join(root, "dist", "index.html"))) run("npm run build");

const envPath = join(root, ".env");
const hasKey = existsSync(envPath) && /^ACR_API_KEY=\S+/m.test(readFileSync(envPath, "utf8"));
if (!hasKey && !process.env.ACR_API_KEY) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const key = await new Promise((resolve) => rl.question("\nPaste your Anthropic API key and press Enter (it is saved only in a local file named .env): ", resolve));
  rl.close();
  if (!key.trim()) {
    console.log("No key entered. The app cannot evaluate drafts without one.");
    process.exit(1);
  }
  writeFileSync(envPath, `ACR_API_KEY=${key.trim()}\n`, { mode: 0o600 });
  console.log("Saved.");
}

const port = process.env.PORT ?? "8787";
const url = `http://localhost:${port}/`;
console.log(`\nStarting Trust Assessment Assistant at ${url}\nLeave this window open while you use the app. Close it to stop.\n`);
const server = spawn(process.execPath, [join(root, "node_modules", "tsx", "dist", "cli.mjs"), join(root, "src", "server", "server.ts")], {
  stdio: "inherit",
  env: { ...process.env, ACR_SERVE_STATIC: "1", PORT: port },
});
setTimeout(() => {
  const opener = process.platform === "darwin" ? `open "${url}"` : process.platform === "win32" ? `start "" "${url}"` : `xdg-open "${url}"`;
  try {
    execSync(opener);
  } catch {
    console.log(`Open ${url} in your browser.`);
  }
}, 2500);
server.on("exit", (code) => process.exit(code ?? 0));
