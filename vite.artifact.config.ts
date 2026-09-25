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
    // The claude.ai page is one HTML file; a font emitted as a separate asset
    // would not be served with it, so inline them.
    assetsInlineLimit: 200_000,
  },
});
