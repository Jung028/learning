export type SupabaseEnv = { url: string; key: string };

/**
 * Reads the two Supabase env vars shared by the browser and server client
 * factories. The `process.env.NEXT_PUBLIC_*` accesses must stay literal
 * property expressions (not destructured from a dynamic key) because
 * Next.js only inlines `NEXT_PUBLIC_*` vars at build time when it sees
 * them written that way.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return { url, key };
}
