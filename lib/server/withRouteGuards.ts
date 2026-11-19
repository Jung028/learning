import "server-only";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "../supabase/server";
import { jsonErrorResponse } from "./apiError";
import { checkDailyLimitWithCounter, incrementDailyUsage } from "./dailyLimit";
import { createRateLimiter } from "./rateLimiter";
import { guardRequest } from "./routeGuard";

const USER_RATE_LIMIT = Number(process.env.API_USER_RATE_LIMIT ?? 20);
const USER_RATE_WINDOW_MS = Number(process.env.API_USER_RATE_WINDOW_MS ?? 60_000);
const IP_RATE_LIMIT = Number(process.env.API_IP_RATE_LIMIT ?? 60);
const IP_RATE_WINDOW_MS = Number(process.env.API_IP_RATE_WINDOW_MS ?? 60_000);

/**
 * "3" is ADR-018's tentative free-tier number, carried over as a placeholder
 * default — ADR-018 is still Proposed and T-008 ("confirm free-tier limits")
 * is open. Override with DAILY_GENERATION_LIMIT once that's decided.
 */
const DAILY_GENERATION_LIMIT = Number(process.env.DAILY_GENERATION_LIMIT ?? 3);

// Module-level so the window is shared across requests handled by the same
// serverless instance, not reset per request. See rateLimiter.ts for why
// this is best-effort rather than an exact count.
const userRateLimiter = createRateLimiter(USER_RATE_LIMIT, USER_RATE_WINDOW_MS);
const ipRateLimiter = createRateLimiter(IP_RATE_LIMIT, IP_RATE_WINDOW_MS);

function getClientIp(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export type RouteHandler<Extra = Record<string, unknown>> = (
  request: NextRequest,
  context: { userId: string } & Extra,
) => Promise<Response>;

/**
 * Wraps a Next.js route handler with the auth check, rate limits, and daily
 * cap from T-016 (ADR-004, architecture.md §9-10), returning the shared
 * `{ error: { code, message } }` shape on failure. `bucket` scopes the
 * daily cap (e.g. "generation") so different kinds of guarded routes don't
 * share one counter. `Extra` lets a dynamic route (e.g. `{ params }`) flow
 * through to the handler untouched — Next.js passes it as `guarded`'s
 * second argument. Not unit tested directly — it's Next.js/Supabase
 * wiring over `guardRequest`, which is (see routeGuard.test.ts).
 */
export function withRouteGuards<Extra = Record<string, unknown>>(bucket: string, handler: RouteHandler<Extra>) {
  return async function guarded(request: NextRequest, extra?: Extra): Promise<Response> {
    const supabase = await getSupabaseServerClient();

    const result = await guardRequest({
      getUserId: async () => {
        const { data } = await supabase.auth.getUser();
        return data.user?.id ?? null;
      },
      checkRateLimit: async (key) => (key.startsWith("ip:") ? ipRateLimiter : userRateLimiter).check(key),
      checkDailyLimit: (userId) =>
        checkDailyLimitWithCounter(userId, bucket, DAILY_GENERATION_LIMIT, (uid, b) =>
          incrementDailyUsage(supabase, uid, b),
        ),
      clientIp: getClientIp(request),
    });

    if (!result.ok) {
      return jsonErrorResponse(result.status, result.code, result.message);
    }

    return handler(request, { userId: result.userId, ...(extra as Extra) });
  };
}
