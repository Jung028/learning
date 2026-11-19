import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type IncrementAndCheck = (userId: string, bucket: string) => Promise<number>;

export async function checkDailyLimitWithCounter(
  userId: string,
  bucket: string,
  limit: number,
  incrementAndCheck: IncrementAndCheck,
): Promise<boolean> {
  const count = await incrementAndCheck(userId, bucket);
  return count <= limit;
}

/**
 * Real counter, backed by Supabase's `increment_usage_counter` function
 * (see supabase/migrations) which upserts and increments atomically so
 * concurrent requests can't race past the limit. Not covered by
 * dailyLimit.test.ts — it needs a real database; the counting logic above
 * (`checkDailyLimitWithCounter`) is what's unit tested.
 */
export async function incrementDailyUsage(
  supabase: SupabaseClient,
  userId: string,
  bucket: string,
): Promise<number> {
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc("increment_usage_counter", {
    p_user_id: userId,
    p_bucket: bucket,
    p_day: day,
  });
  if (error) throw error;
  return data as number;
}
