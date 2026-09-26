/**
 * Calls to the application server. Errors carry the server's plain message;
 * nothing here logs request or response bodies.
 */
import type { EvaluationResult } from "../engine/evaluate.js";
import type { ComparisonResult } from "../engine/compare.js";
import type { PublicContextResult } from "../engine/publicContext.js";
import type { SavedReview } from "../engine/savedReview.js";
import type { CommunicationFormat, EvaluationRequest } from "../engine/types.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

export interface ImportedPage {
  source_url: string;
  title: string | null;
  published: string | null;
  text: string;
  suggested_format: CommunicationFormat | null;
}

export class ApiError extends Error {
  readonly name = "ApiError";
  constructor(
    message: string,
    readonly status: number,
    readonly kind: string,
    readonly requestId?: string,
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown, fallback: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("The server could not be reached.", 0, "network");
  }
  let data: { error?: string; message?: string; request_id?: string } | T | null = null;
  try {
    data = (await res.json()) as typeof data;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = (data ?? {}) as { error?: string; message?: string; request_id?: string };
    throw new ApiError(err.message ?? fallback, res.status, err.error ?? "error", err.request_id);
  }
  if (data === null) throw new ApiError(fallback, res.status, "empty");
  return data as T;
}

/** How the app reaches the engine. The default talks to the application server; another runtime can swap it. */
export interface ApiImplementation {
  evaluate(request: EvaluationRequest): Promise<EvaluationResult>;
  importUrl(url: string): Promise<ImportedPage>;
  fetchConfig(): Promise<PrivacyConfig | null>;
  /** Hands a generated file to the viewer. Resolves when the save was offered or completed. */
  saveFile(filename: string, data: Blob): Promise<void>;
  /** Searches the public web for a topic the user typed (hosted app only). */
  findPublicContext(query: string): Promise<PublicContextResult>;
  /** Compares a fresh review of the new draft against a saved review. */
  compare(saved: SavedReview, request: EvaluationRequest, fresh: EvaluationResult): Promise<ComparisonResult>;
  /** Sends the shared password. Resolves on success; throws ApiError otherwise. Hosted app only. */
  signIn(password: string): Promise<void>;
}

export const serverApi: ApiImplementation = {
  evaluate: (request) => post<EvaluationResult>("/api/evaluate", request, "The evaluation failed. Try again."),
  importUrl: (url) => post<ImportedPage>("/api/import", { url }, "Couldn't extract readable text from this page. Paste the text instead."),
  async fetchConfig() {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) return null;
      return (await res.json()) as PrivacyConfig;
    } catch {
      return null;
    }
  },
  findPublicContext: (query) => post<PublicContextResult>("/api/public-context", { query }, "The search failed. Try again."),
  compare: (saved, request, fresh) => post<ComparisonResult>("/api/compare", { saved, request, fresh }, "The comparison failed. Try again."),
  signIn: async (password) => {
    await post<{ ok: boolean }>("/api/login", { password }, "Could not check the password. Try again.");
  },
  async saveFile(filename, data) {
    const url = URL.createObjectURL(data);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
  },
};

let current: ApiImplementation = serverApi;

/** Replace the implementation before rendering (used by the claude.ai page build). */
export function configureApi(impl: ApiImplementation): void {
  current = impl;
}

export const evaluate = (request: EvaluationRequest) => current.evaluate(request);
export const importUrl = (url: string) => current.importUrl(url);
export const fetchConfig = () => current.fetchConfig();
export const saveFile = (filename: string, data: Blob) => current.saveFile(filename, data);
export const findPublicContext = (query: string) => current.findPublicContext(query);
export const signIn = (password: string) => current.signIn(password);
export const compare = (saved: SavedReview, request: EvaluationRequest, fresh: EvaluationResult) => current.compare(saved, request, fresh);
