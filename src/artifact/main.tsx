import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureApi } from "../app/api.js";
import { App } from "../app/App.js";
import { sampleApi } from "./sampleApi.js";
import "../app/styles.css";

configureApi(sampleApi);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      publicSearch={false}
      runtimeNote="Preview on claude.ai: evaluations run through your own Claude account and claude.ai will ask your permission the first time. Web search is not available here."
    />
  </StrictMode>,
);
