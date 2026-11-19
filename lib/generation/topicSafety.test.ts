import { describe, expect, test } from "bun:test";
import { decideTopicSafety } from "./topicSafety";

describe("decideTopicSafety", () => {
  test("refuses with the given reason when the check refuses", () => {
    const result = decideTopicSafety({
      refused: true,
      refusalReason: "This topic can cause real harm.",
      advisoryCategory: "none",
    });
    expect(result).toEqual({ refused: true, reason: "This topic can cause real harm." });
  });

  test("falls back to a generic reason when refused with no reason given", () => {
    const result = decideTopicSafety({ refused: true, advisoryCategory: "none" });
    expect(result).toEqual({ refused: true, reason: "This topic can't be turned into a course." });
  });

  test("allows the topic and passes through the advisory category", () => {
    const result = decideTopicSafety({ refused: false, advisoryCategory: "medical" });
    expect(result).toEqual({ refused: false, advisoryCategory: "medical" });
  });

  test("allows a topic with no advisory category", () => {
    const result = decideTopicSafety({ refused: false, advisoryCategory: "none" });
    expect(result).toEqual({ refused: false, advisoryCategory: "none" });
  });
});
