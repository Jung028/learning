import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

type CookieToSet = { name: string; value: string; options?: object };

export type CookieStore = {
  getAll(): { name: string; value: string }[];
  setAll(cookies: CookieToSet[]): void;
};

/**
 * Low-level factory that takes an explicit `{ getAll, setAll }` adapter.
 * Used directly by tests (with a fake cookie store) and by anything that
 * builds its own adapter with full control over headers, e.g. a
 * session-refresh proxy/middleware.
 */
export function createSupabaseServerClient(cookieStore: CookieStore): SupabaseClient {
  const { url, key } = getSupabaseEnv();
  return createServerClient(url, key, { cookies: cookieStore });
}

/**
 * Convenience factory for Server Components and Route Handlers: reads
 * cookies from `next/headers` and adapts them to the shape `@supabase/ssr`
 * expects. The try/catch around `setAll` is the documented Supabase pattern
 * for Next.js — https://supabase.com/docs/guides/auth/server-side/nextjs —
 * `cookieStore.set` throws when called from a Server Component, and that's
 * fine because session-refresh middleware/proxy handles the actual write.
 *
 * Not covered by `server.test.ts`: it depends on `next/headers`' request-scoped
 * behavior, which isn't testable without a real request context under Bun's
 * test runner. The explicit-adapter factory above is what's unit tested.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createSupabaseServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Called from a Server Component; session refresh middleware/proxy handles it.
      }
    },
  });
}
