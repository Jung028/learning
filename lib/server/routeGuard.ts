import type { ApiErrorCode } from "./apiError";

export type GuardResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; code: ApiErrorCode; message: string };

export type GuardDeps = {
  getUserId: () => Promise<string | null>;
  checkRateLimit: (key: string) => Promise<boolean>;
  checkDailyLimit: (userId: string) => Promise<boolean>;
  clientIp: string | null;
};

/**
 * Pure decision logic shared by every guarded route: auth, then rate limits
 * (IP before user, so an anonymous flood never reaches the per-user check),
 * then the daily cap. Each step is injected so it's testable without a real
 * request, Supabase client, or rate-limit store (see withRouteGuards.ts for
 * the real wiring).
 */
export async function guardRequest(deps: GuardDeps): Promise<GuardResult> {
  const userId = await deps.getUserId();
  if (!userId) {
    return { ok: false, status: 401, code: "unauthenticated", message: "Sign in to continue." };
  }

  if (deps.clientIp) {
    const ipAllowed = await deps.checkRateLimit(`ip:${deps.clientIp}`);
    if (!ipAllowed) {
      return { ok: false, status: 429, code: "rate_limited", message: "Too many requests. Try again shortly." };
    }
  }

  const userAllowed = await deps.checkRateLimit(`user:${userId}`);
  if (!userAllowed) {
    return { ok: false, status: 429, code: "rate_limited", message: "Too many requests. Try again shortly." };
  }

  const dailyAllowed = await deps.checkDailyLimit(userId);
  if (!dailyAllowed) {
    return {
      ok: false,
      status: 429,
      code: "daily_limit_reached",
      message: "Daily limit reached. Try again tomorrow.",
    };
  }

  return { ok: true, userId };
}
