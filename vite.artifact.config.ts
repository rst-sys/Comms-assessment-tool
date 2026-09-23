import react from "@vitejs/plugin-react";
import { buildId } from "./buildId.mjs";
import { defineConfig } from "vite";

/** Build of the claude.ai page: relative asset paths, its own entry, its own output folder. */
export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId()) },
  plugins: [react()],
  root: "src/artifact",
  base: "./",
  build: {
    outDir: "../../dist-artifact",
    emptyOutDir: true,
  },
});
