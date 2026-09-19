/**
 * Validation of the intake request before it reaches the engine. Only the
 * fields Section 3 defines are accepted; unknown fields are rejected so
 * nothing unexpected is forwarded to the provider.
 */
import { Ajv } from "ajv";
import {
  AUDIENCE_SCOPES,
  COMMUNICATION_TYPES,
  CONTEXT_FIELDS,
  GOALS,
  MARKETS,
  DOCUMENT_KINDS,
  DOCUMENT_REACH,
  MAX_AUDIENCE_DOCUMENT_CHARS,
  MAX_AUDIENCE_DOCUMENTS,
  STANCES,
  PRIMARY_AUDIENCES,
  SETTINGS,
  type EvaluationRequest,
} from "../engine/types.js";

const enumOf = (values: readonly string[]) => ({ type: "string", enum: [...values] });

export const REQUEST_SCHEMA = {
  type: "object",
  properties: {
    draft: { type: "string", minLength: 1, maxLength: 60_000 },
    communication_type: enumOf(COMMUNICATION_TYPES),
    primary_audience: enumOf(PRIMARY_AUDIENCES),
    setting: enumOf(SETTINGS),
    market: enumOf(MARKETS),
    goal: enumOf(GOALS),
    audience_scope: enumOf(AUDIENCE_SCOPES),
    context: {
      type: "object",
      properties: Object.fromEntries(CONTEXT_FIELDS.map(([key]) => [key, { type: "string", maxLength: 10_000 }])),
      additionalProperties: false,
    },
    heightened_review: { type: "boolean" },
    already_published: { type: "boolean" },
    audience_documents: {
      type: "array",
      maxItems: MAX_AUDIENCE_DOCUMENTS,
      items: {
        type: "object",
        properties: {
          kind: enumOf(DOCUMENT_KINDS.map(([k]) => k)),
          title: { type: "string", maxLength: 200 },
          description: { type: "string", maxLength: 1000 },
          delivery: { type: "string", maxLength: 1000 },
          reach: enumOf(DOCUMENT_REACH.map(([k]) => k)),
          same_time: { type: "boolean" },
          text: { type: "string", minLength: 1, maxLength: MAX_AUDIENCE_DOCUMENT_CHARS },
        },
        required: ["kind", "title", "description", "delivery", "reach", "same_time", "text"],
        additionalProperties: false,
      },
    },
    stance: enumOf(STANCES),
    reacting_to: { type: "string", maxLength: 2000 },
  },
  required: [
    "draft",
    "communication_type",
    "primary_audience",
    "setting",
    "market",
    "goal",
    "audience_scope",
    "context",
    "heightened_review",
    "already_published",
  ],
  additionalProperties: false,
} as const;

const ajv = new Ajv({ allErrors: false, strict: true });
const validate = ajv.compile(REQUEST_SCHEMA);

export class RequestValidationError extends Error {
  readonly name = "RequestValidationError";
  constructor(readonly path: string) {
    super(`invalid request at ${path || "/"}`);
  }
}

export function parseEvaluationRequest(body: unknown): EvaluationRequest {
  if (!validate(body)) {
    throw new RequestValidationError(validate.errors?.[0]?.instancePath ?? "/");
  }
  return body as EvaluationRequest;
}
