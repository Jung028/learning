/**
 * JSON Schemas for every Claude call in the generation pipeline (ADR-006:
 * "Call Claude only from server routes, with a JSON schema for every call").
 * These are plain JSON Schema objects — the same shape passed as a tool's
 * `input_schema` to the Claude API and usable with any JSON Schema
 * validator (see validate.ts) to check a response before it's trusted.
 *
 * Structural/type contract only. Rules that aren't naturally JSON-Schema
 * shaped — a card body staying under 45 words (architecture.md §4), a quiz
 * question's "exactly one defensible answer" — are checked in application
 * code, not encoded here; see T-026 (retry on invalid output).
 */
export type JsonSchema = Record<string, unknown>;

export const QUIZ_QUESTION_COUNT = 5;
export const CARD_COUNT_MIN = 8;
export const CARD_COUNT_MAX = 12;

export type Outline = {
  title: string;
  summary: string;
  chapters: { title: string; objectives: string }[];
};

/** `chapterCount` comes from the module's length (see length.ts) — it's a call parameter, not something Claude decides. */
export function outlineSchema(chapterCount: number): JsonSchema {
  return {
    type: "object",
    additionalProperties: false,
    required: ["title", "summary", "chapters"],
    properties: {
      title: { type: "string", minLength: 1 },
      summary: { type: "string", minLength: 1 },
      chapters: {
        type: "array",
        minItems: chapterCount,
        maxItems: chapterCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "objectives"],
          properties: {
            title: { type: "string", minLength: 1 },
            objectives: { type: "string", minLength: 1 },
          },
        },
      },
    },
  };
}

export type Cards = {
  cards: { title: string; body: string; example?: string }[];
};

/** 8 to 12 cards per chapter (system-analysis.md's generation pipeline table) — a fixed range, not parameterized per call. */
export const cardsSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["cards"],
  properties: {
    cards: {
      type: "array",
      minItems: CARD_COUNT_MIN,
      maxItems: CARD_COUNT_MAX,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: {
          title: { type: "string", minLength: 1 },
          body: { type: "string", minLength: 1 },
          example: { type: "string" },
        },
      },
    },
  },
};

export type Quiz = {
  questions: {
    stem: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    reason: string;
    sourceCardIndex: number;
  }[];
};

/**
 * `sourceCardIndex` is a 0-based index into the chapter's card list, not a
 * real card id — the cards don't have ids yet when the quiz is generated
 * (ADR-011: quiz input is that chapter's cards only). Saving the quiz
 * (T-025) resolves it to the real `source_card_id` once cards are persisted.
 */
export const quizSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: QUIZ_QUESTION_COUNT,
      maxItems: QUIZ_QUESTION_COUNT,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["stem", "options", "correctIndex", "reason", "sourceCardIndex"],
        properties: {
          stem: { type: "string", minLength: 1 },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string", minLength: 1 },
          },
          correctIndex: { type: "integer", minimum: 0, maximum: 3 },
          reason: { type: "string", minLength: 1 },
          sourceCardIndex: { type: "integer", minimum: 0 },
        },
      },
    },
  },
};

export type QuizCheck = {
  results: { questionIndex: number; status: "ok" | "flagged"; reason?: string }[];
};

/** One result per quiz question (ADR-011's second call: "checks each question has exactly one defensible answer"). */
export const quizCheckSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      minItems: QUIZ_QUESTION_COUNT,
      maxItems: QUIZ_QUESTION_COUNT,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["questionIndex", "status"],
        properties: {
          questionIndex: { type: "integer", minimum: 0, maximum: QUIZ_QUESTION_COUNT - 1 },
          status: { type: "string", enum: ["ok", "flagged"] },
          reason: { type: "string" },
        },
      },
    },
  },
};
