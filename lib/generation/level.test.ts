import { describe, expect, test } from "bun:test";
import { LEVELS } from "./level";

describe("LEVELS", () => {
  test("matches the three level chips in the New module design", () => {
    expect(LEVELS).toEqual(["beginner", "intermediate", "advanced"]);
  });
});
