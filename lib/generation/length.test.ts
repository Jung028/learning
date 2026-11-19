import { describe, expect, test } from "bun:test";
import { CHAPTER_COUNT_BY_LENGTH } from "./length";

describe("CHAPTER_COUNT_BY_LENGTH", () => {
  test("matches the three chapter-count chips in the New module design", () => {
    expect(CHAPTER_COUNT_BY_LENGTH).toEqual({ short: 3, medium: 5, long: 8 });
  });
});
