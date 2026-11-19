import { describe, expect, test } from "bun:test";
import Ajv from "ajv";
import {
  CARD_COUNT_MAX,
  CARD_COUNT_MIN,
  QUIZ_QUESTION_COUNT,
  cardsSchema,
  outlineSchema,
  quizCheckSchema,
  quizSchema,
  topicSafetySchema,
} from "./schemas";

const ajv = new Ajv();

describe("outlineSchema", () => {
  test("accepts an outline with exactly the requested chapter count", () => {
    const validate = ajv.compile(outlineSchema(3));
    const outline = {
      title: "Stoicism",
      summary: "A short course on Stoic philosophy.",
      chapters: [
        { title: "Chapter 1", objectives: "Understand the core idea." },
        { title: "Chapter 2", objectives: "Understand the core idea." },
        { title: "Chapter 3", objectives: "Understand the core idea." },
      ],
    };
    expect(validate(outline)).toBe(true);
  });

  test("rejects an outline with the wrong chapter count", () => {
    const validate = ajv.compile(outlineSchema(3));
    const outline = {
      title: "Stoicism",
      summary: "A short course on Stoic philosophy.",
      chapters: [{ title: "Chapter 1", objectives: "Understand the core idea." }],
    };
    expect(validate(outline)).toBe(false);
  });

  test("rejects an outline missing a required field", () => {
    const validate = ajv.compile(outlineSchema(1));
    expect(validate({ title: "Stoicism", chapters: [{ title: "Chapter 1", objectives: "x" }] })).toBe(false);
  });

  test("rejects an outline with an unexpected extra field", () => {
    const validate = ajv.compile(outlineSchema(1));
    const outline = {
      title: "Stoicism",
      summary: "A short course.",
      chapters: [{ title: "Chapter 1", objectives: "x" }],
      extra: "nope",
    };
    expect(validate(outline)).toBe(false);
  });
});

describe("cardsSchema", () => {
  const validate = ajv.compile(cardsSchema);

  function makeCards(count: number) {
    return {
      cards: Array.from({ length: count }, (_, i) => ({
        title: `Card ${i + 1}`,
        body: "A short idea explained plainly.",
      })),
    };
  }

  test(`accepts ${CARD_COUNT_MIN} cards (the minimum)`, () => {
    expect(validate(makeCards(CARD_COUNT_MIN))).toBe(true);
  });

  test(`accepts ${CARD_COUNT_MAX} cards (the maximum)`, () => {
    expect(validate(makeCards(CARD_COUNT_MAX))).toBe(true);
  });

  test("rejects fewer cards than the minimum", () => {
    expect(validate(makeCards(CARD_COUNT_MIN - 1))).toBe(false);
  });

  test("rejects more cards than the maximum", () => {
    expect(validate(makeCards(CARD_COUNT_MAX + 1))).toBe(false);
  });

  test("accepts an optional example on a card", () => {
    const cards = makeCards(CARD_COUNT_MIN);
    (cards.cards[0] as { example?: string }).example = "Like a captain who can't control the storm.";
    expect(validate(cards)).toBe(true);
  });
});

describe("quizSchema", () => {
  const validate = ajv.compile(quizSchema);

  function makeQuestion(overrides: Record<string, unknown> = {}) {
    return {
      stem: "What is the core idea?",
      options: ["A", "B", "C", "D"],
      correctIndex: 1,
      reason: "B is correct because...",
      sourceCardIndex: 0,
      ...overrides,
    };
  }

  function makeQuiz(questionCount: number, overrides: Record<string, unknown> = {}) {
    return { questions: Array.from({ length: questionCount }, () => makeQuestion(overrides)) };
  }

  test(`accepts exactly ${QUIZ_QUESTION_COUNT} well-formed questions`, () => {
    expect(validate(makeQuiz(QUIZ_QUESTION_COUNT))).toBe(true);
  });

  test("rejects a quiz with the wrong number of questions", () => {
    expect(validate(makeQuiz(QUIZ_QUESTION_COUNT - 1))).toBe(false);
  });

  test("rejects a question without exactly 4 options", () => {
    expect(validate(makeQuiz(QUIZ_QUESTION_COUNT, { options: ["A", "B", "C"] }))).toBe(false);
  });

  test("rejects a correctIndex outside 0-3", () => {
    expect(validate(makeQuiz(QUIZ_QUESTION_COUNT, { correctIndex: 4 }))).toBe(false);
  });

  test("rejects a negative sourceCardIndex", () => {
    expect(validate(makeQuiz(QUIZ_QUESTION_COUNT, { sourceCardIndex: -1 }))).toBe(false);
  });
});

describe("quizCheckSchema", () => {
  const validate = ajv.compile(quizCheckSchema);

  function makeResults(questionCount: number, overrides: Record<string, unknown> = {}) {
    return {
      results: Array.from({ length: questionCount }, (_, i) => ({
        questionIndex: i,
        status: "ok",
        ...overrides,
      })),
    };
  }

  test(`accepts exactly ${QUIZ_QUESTION_COUNT} results, one per question`, () => {
    expect(validate(makeResults(QUIZ_QUESTION_COUNT))).toBe(true);
  });

  test("accepts a flagged result with a reason", () => {
    const results = makeResults(QUIZ_QUESTION_COUNT, {
      status: "flagged",
      reason: "Two options are both defensible.",
    });
    expect(validate(results)).toBe(true);
  });

  test("rejects an unknown status value", () => {
    expect(validate(makeResults(QUIZ_QUESTION_COUNT, { status: "maybe" }))).toBe(false);
  });

  test("rejects a result count that doesn't match the question count", () => {
    expect(validate(makeResults(QUIZ_QUESTION_COUNT - 1))).toBe(false);
  });
});

describe("topicSafetySchema", () => {
  const validate = ajv.compile(topicSafetySchema);

  test("accepts a refused topic with a reason", () => {
    expect(validate({ refused: true, refusalReason: "Not something we can teach safely.", advisoryCategory: "none" })).toBe(
      true,
    );
  });

  test("accepts an allowed topic with an advisory category", () => {
    expect(validate({ refused: false, advisoryCategory: "medical" })).toBe(true);
  });

  test("rejects an unknown advisory category", () => {
    expect(validate({ refused: false, advisoryCategory: "finance" })).toBe(false);
  });

  test("rejects a missing refused field", () => {
    expect(validate({ advisoryCategory: "none" })).toBe(false);
  });
});
