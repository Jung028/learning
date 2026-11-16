import { afterEach, beforeEach, expect, test } from "bun:test";
import { createSupabaseServerClient } from "./server";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

const fakeCookieStore = { getAll: () => [], setAll: () => {} };

test("throws when env vars are missing", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  expect(() => createSupabaseServerClient(fakeCookieStore)).toThrow(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
});

test("returns a client when env vars are present", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  const client = createSupabaseServerClient(fakeCookieStore);
  expect(typeof client.auth.getUser).toBe("function");
});

// Note: the no-arg `getSupabaseServerClient()` (Server Component / Route
// Handler variant) is not tested here — it depends on `next/headers`'
// request-scoped `cookies()`, which has no meaningful behavior outside an
// actual Next.js request and isn't testable under Bun's test runner.
