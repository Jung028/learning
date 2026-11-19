import { describe, expect, test } from "bun:test";
import { outlineSchema } from "./schemas";
import { validateAgainstSchema } from "./validate";

describe("validateAgainstSchema", () => {
  const schema = outlineSchema(2);
  const validOutline = {
    title: "Stoicism",
    summary: "A short course.",
    chapters: [
      { title: "Chapter 1", objectives: "x" },
      { title: "Chapter 2", objectives: "y" },
    ],
  };

  test("returns valid: true with the data when it matches the schema", () => {
    const result = validateAgainstSchema(schema, validOutline);
    expect(result).toEqual({ valid: true, data: validOutline });
  });

  test("returns valid: false with a non-empty list of errors when it doesn't match", () => {
    const result = validateAgainstSchema(schema, { title: "Stoicism" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  test("does not throw on malformed input, e.g. a plain string instead of an object", () => {
    const result = validateAgainstSchema(schema, "not an object");
    expect(result.valid).toBe(false);
  });
});
