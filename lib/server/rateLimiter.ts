export type RateLimiter = {
  /**
   * Returns true when `key` is still within its limit for the current
   * window, recording this call toward it either way. `now` is injectable
   * so tests don't depend on real time.
   */
  check: (key: string, now?: number) => boolean;
};

/**
 * In-memory sliding-window limiter. State lives per serverless instance, so
 * it's a best-effort defense against abuse, not an accurate count — the
 * business-critical daily cap lives in Supabase instead (see dailyLimit.ts).
 */
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now: number = Date.now()): boolean {
      const windowStart = now - windowMs;
      const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

      if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return false;
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return true;
    },
  };
}
