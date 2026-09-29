/**
 * Validation of the intake request before it reaches the engine. Only the
 * fields Section 3 defines are accepted; unknown fields are rejected so
 * nothing unexpected is forwarded to the provider.
 */
import { Ajv } from "ajv";
import { countWords, MIN_DRAFT_WORDS } from "../engine/limits.js";
import {
  AUDIENCES,
  COMMUNICATION_EVENTS,
  COMMUNICATION_FORMATS,
  DOCUMENT_KINDS,
  DOCUMENT_REACH,
  MAX_AUDIENCE_DOCUMENT_CHARS,
  MAX_AUDIENCE_DOCUMENTS,
  ORGANIZATION_TYPES,
  PURPOSES,
  SITUATION_STATUSES,
  type EvaluationRequest,
} from "../engine/types.js";

const enumOf = (values: readonly string[]) => ({ type: "string", enum: [...values] });

export const REQUEST_SCHEMA = {
  type: "object",
  properties: {
    draft: { type: "string", minLength: 1, maxLength: 60_000 },
    organization: {
      type: "object",
      properties: {
        type: enumOf(ORGANIZATION_TYPES),
        listed_where: { type: "string", maxLength: 200 },
        headquarters: { type: "string", maxLength: 200 },
      },
      required: ["type", "headquarters"],
      additionalProperties: false,
    },
    communication_event: enumOf(COMMUNICATION_EVENTS),
    event_description: { type: "string", maxLength: 500 },
    communication_format: enumOf(COMMUNICATION_FORMATS),
    format_description: { type: "string", maxLength: 500 },
    main_announcement: { type: "string", maxLength: 20_000 },
    audiences: { type: "array", minItems: 1, maxItems: AUDIENCES.length, items: enumOf(AUDIENCES) },
    situation: enumOf(SITUATION_STATUSES),
    people_at_risk: { type: "boolean" },
    counsel_limited: { type: "boolean" },
    locations: { type: "array", minItems: 1, maxItems: 40, items: { type: "string", minLength: 1, maxLength: 100 } },
    purpose: enumOf(PURPOSES),
    context: { type: "string", maxLength: 10_000 },
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
  },
  required: [
    "draft",
    "organization",
    "communication_event",
    "communication_format",
    "audiences",
    "situation",
    "people_at_risk",
    "counsel_limited",
    "locations",
    "purpose",
    "context",
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
  const request = body as EvaluationRequest;
  // The word floor, not just a non-empty string. JSON Schema counts
  // characters, and the browser's check can be skipped, so a hand-made call
  // would otherwise spend a provider credit on two words. Same number and the
  // same count as the intake, from the engine, so the two cannot disagree.
  if (countWords(request.draft) < MIN_DRAFT_WORDS) {
    throw new RequestValidationError("/draft");
  }
  return request;
}
