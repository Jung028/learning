import { afterEach, beforeEach, expect, test } from "bun:test";
import { getSupabaseBrowserClient } from "./client";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test("throws when env vars are missing", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  expect(() => getSupabaseBrowserClient()).toThrow(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
});

test("returns a client when env vars are present", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  const client = getSupabaseBrowserClient();
  expect(typeof client.auth.getSession).toBe("function");
});
