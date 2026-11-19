import { describe, expect, test } from "bun:test";
import { checkDailyLimitWithCounter } from "./dailyLimit";

describe("checkDailyLimitWithCounter", () => {
  test("allows the request when the incremented count is at or under the limit", async () => {
    const incrementAndCheck = async () => 3;
    const allowed = await checkDailyLimitWithCounter("user-1", "generation", 3, incrementAndCheck);
    expect(allowed).toBe(true);
  });

  test("blocks the request once the incremented count exceeds the limit", async () => {
    const incrementAndCheck = async () => 4;
    const allowed = await checkDailyLimitWithCounter("user-1", "generation", 3, incrementAndCheck);
    expect(allowed).toBe(false);
  });

  test("passes the user id and bucket through to the counter", async () => {
    const seen: Array<{ userId: string; bucket: string }> = [];
    const incrementAndCheck = async (userId: string, bucket: string) => {
      seen.push({ userId, bucket });
      return 1;
    };
    await checkDailyLimitWithCounter("user-1", "generation", 3, incrementAndCheck);
    expect(seen).toEqual([{ userId: "user-1", bucket: "generation" }]);
  });
});
