import { describe, expect, test, mock } from "bun:test";
import { determineRedirectPath } from "./route";

describe("determineRedirectPath", () => {
  test("exchanges a present code and redirects home on success", async () => {
    const exchange = mock(async () => ({ error: null }));
    expect(await determineRedirectPath("abc123", exchange)).toBe("/");
    expect(exchange).toHaveBeenCalledWith("abc123");
  });

  test("redirects to sign-in with an error marker when the exchange fails", async () => {
    const exchange = mock(async () => ({ error: { message: "invalid code" } }));
    expect(await determineRedirectPath("bad", exchange)).toBe("/sign-in?error=auth_failed");
  });

  test("redirects to sign-in with an error marker when there is no code", async () => {
    const exchange = mock(async () => ({ error: null }));
    expect(await determineRedirectPath(null, exchange)).toBe("/sign-in?error=missing_code");
    expect(exchange).not.toHaveBeenCalled();
  });
});
