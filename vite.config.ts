import react from "@vitejs/plugin-react";
import { buildId } from "./buildId.mjs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId()) },
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:8787" },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
