import { describe, expect, test } from "bun:test";
import { jsonErrorResponse } from "./apiError";

describe("jsonErrorResponse", () => {
  test("sets the given status code", () => {
    const response = jsonErrorResponse(401, "unauthenticated", "Sign in to continue.");
    expect(response.status).toBe(401);
  });

  test("sets a JSON content type", () => {
    const response = jsonErrorResponse(401, "unauthenticated", "Sign in to continue.");
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  test("bodies use the { error: { code, message } } shape", async () => {
    const response = jsonErrorResponse(429, "rate_limited", "Too many requests.");
    const body = await response.json();
    expect(body).toEqual({ error: { code: "rate_limited", message: "Too many requests." } });
  });
});
