import { buildId } from "./buildId.mjs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId()) }, plugins: [react()], root: ".", build: { outDir: "dist-preview", rollupOptions: { input: "preview/index.html" } } });
