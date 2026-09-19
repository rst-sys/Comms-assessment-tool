/**
 * Calls to the application server. Errors carry the server's plain message;
 * nothing here logs request or response bodies.
 */
import type { EvaluationResult } from "../engine/evaluate.js";
import type { RedraftResult } from "../engine/redraft.js";
import type { Analysis, CommunicationType, EvaluationRequest } from "../engine/types.js";
import type { PrivacyConfig } from "./PrivacyPanel.js";

export interface ImportedPage {
  source_url: string;
  title: string | null;
  published: string | null;
  text: string;
  suggested_type: CommunicationType | null;
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

export function evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
  return post<EvaluationResult>("/api/evaluate", request, "The evaluation failed. Try again.");
}

export function redraft(request: EvaluationRequest, analysis: Analysis): Promise<RedraftResult> {
  return post<RedraftResult>("/api/redraft", { request, analysis }, "The revision failed. Try again.");
}

export function importUrl(url: string): Promise<ImportedPage> {
  return post<ImportedPage>("/api/import", { url }, "Couldn't extract readable text from this page. Paste the text instead.");
}

export async function fetchConfig(): Promise<PrivacyConfig | null> {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return null;
    return (await res.json()) as PrivacyConfig;
  } catch {
    return null;
  }
}
