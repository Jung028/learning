import { describe, expect, test } from "bun:test";
import { parseCreateModuleRequest } from "./createModuleRequest";

describe("parseCreateModuleRequest", () => {
  test("accepts a well-formed request", () => {
    const result = parseCreateModuleRequest({ topic: "Stoicism", level: "beginner", length: "short" });
    expect(result).toEqual({ ok: true, data: { topic: "Stoicism", level: "beginner", length: "short" } });
  });

  test("trims the topic", () => {
    const result = parseCreateModuleRequest({ topic: "  Stoicism  ", level: "beginner", length: "short" });
    expect(result).toEqual({ ok: true, data: { topic: "Stoicism", level: "beginner", length: "short" } });
  });

  test("rejects a non-object body", () => {
    const result = parseCreateModuleRequest("not an object");
    expect(result.ok).toBe(false);
  });

  test("rejects a missing topic", () => {
    const result = parseCreateModuleRequest({ level: "beginner", length: "short" });
    expect(result.ok).toBe(false);
  });

  test("rejects an empty topic", () => {
    const result = parseCreateModuleRequest({ topic: "   ", level: "beginner", length: "short" });
    expect(result.ok).toBe(false);
  });

  test("rejects a topic over 200 characters", () => {
    const result = parseCreateModuleRequest({ topic: "a".repeat(201), level: "beginner", length: "short" });
    expect(result.ok).toBe(false);
  });

  test("accepts a topic of exactly 200 characters", () => {
    const result = parseCreateModuleRequest({ topic: "a".repeat(200), level: "beginner", length: "short" });
    expect(result.ok).toBe(true);
  });

  test("rejects an unknown level", () => {
    const result = parseCreateModuleRequest({ topic: "Stoicism", level: "expert", length: "short" });
    expect(result.ok).toBe(false);
  });

  test("rejects an unknown length", () => {
    const result = parseCreateModuleRequest({ topic: "Stoicism", level: "beginner", length: "huge" });
    expect(result.ok).toBe(false);
  });
});
