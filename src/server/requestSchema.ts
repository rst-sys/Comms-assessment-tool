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
