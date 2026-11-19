import { describe, expect, test } from "bun:test";
import { guardRequest } from "./routeGuard";

function fakeDeps({
  getUserId = async () => "user-1",
  rateLimitAllows = () => true,
  dailyLimitAllows = () => true,
  clientIp = "1.2.3.4" as string | null,
}: {
  getUserId?: () => Promise<string | null>;
  rateLimitAllows?: (key: string) => boolean;
  dailyLimitAllows?: (userId: string) => boolean;
  clientIp?: string | null;
} = {}) {
  const calls = {
    rateLimitKeys: [] as string[],
    dailyLimitUserIds: [] as string[],
  };

  const deps = {
    getUserId,
    checkRateLimit: async (key: string) => {
      calls.rateLimitKeys.push(key);
      return rateLimitAllows(key);
    },
    checkDailyLimit: async (userId: string) => {
      calls.dailyLimitUserIds.push(userId);
      return dailyLimitAllows(userId);
    },
    clientIp,
  };

  return { deps, calls };
}

describe("guardRequest", () => {
  test("fails with 401 unauthenticated when there is no signed-in user", async () => {
    const { deps, calls } = fakeDeps({ getUserId: async () => null });
    const result = await guardRequest(deps);
    expect(result).toEqual({ ok: false, status: 401, code: "unauthenticated", message: expect.any(String) });
    expect(calls.rateLimitKeys).toEqual([]);
    expect(calls.dailyLimitUserIds).toEqual([]);
  });

  test("fails with 429 rate_limited when the per-IP check fails, before checking the user", async () => {
    const { deps, calls } = fakeDeps({
      rateLimitAllows: (key) => key !== "ip:1.2.3.4",
    });
    const result = await guardRequest(deps);
    expect(result).toEqual({ ok: false, status: 429, code: "rate_limited", message: expect.any(String) });
    expect(calls.rateLimitKeys).toEqual(["ip:1.2.3.4"]);
    expect(calls.dailyLimitUserIds).toEqual([]);
  });

  test("fails with 429 rate_limited when the per-user check fails", async () => {
    const { deps, calls } = fakeDeps({
      rateLimitAllows: (key) => key !== "user:user-1",
    });
    const result = await guardRequest(deps);
    expect(result).toEqual({ ok: false, status: 429, code: "rate_limited", message: expect.any(String) });
    expect(calls.rateLimitKeys).toEqual(["ip:1.2.3.4", "user:user-1"]);
    expect(calls.dailyLimitUserIds).toEqual([]);
  });

  test("fails with 429 daily_limit_reached when the daily limit check fails", async () => {
    const { deps, calls } = fakeDeps({ dailyLimitAllows: () => false });
    const result = await guardRequest(deps);
    expect(result).toEqual({ ok: false, status: 429, code: "daily_limit_reached", message: expect.any(String) });
    expect(calls.dailyLimitUserIds).toEqual(["user-1"]);
  });

  test("skips the per-IP check when no client IP is given", async () => {
    const { deps, calls } = fakeDeps({ clientIp: null });
    await guardRequest(deps);
    expect(calls.rateLimitKeys).toEqual(["user:user-1"]);
  });

  test("succeeds with the user id when every check passes", async () => {
    const { deps } = fakeDeps();
    const result = await guardRequest(deps);
    expect(result).toEqual({ ok: true, userId: "user-1" });
  });
});
