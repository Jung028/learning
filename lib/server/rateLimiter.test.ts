import { describe, expect, test } from "bun:test";
import { createRateLimiter } from "./rateLimiter";

describe("createRateLimiter", () => {
  test("allows requests up to the limit within the window", () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(true);
    expect(limiter.check("a", 2)).toBe(true);
  });

  test("blocks a request once the limit is reached within the window", () => {
    const limiter = createRateLimiter(2, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(true);
    expect(limiter.check("a", 2)).toBe(false);
  });

  test("allows a request again once the window has passed", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 500)).toBe(false);
    expect(limiter.check("a", 1001)).toBe(true);
  });

  test("tracks separate keys independently", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("b", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(false);
    expect(limiter.check("b", 1)).toBe(false);
  });
});
