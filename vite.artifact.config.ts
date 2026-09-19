import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Build of the claude.ai page: relative asset paths, its own entry, its own output folder. */
export default defineConfig({
  plugins: [react()],
  root: "src/artifact",
  base: "./",
  build: {
    outDir: "../../dist-artifact",
    emptyOutDir: true,
  },
});
