import type { NextRequest } from "next/server";
import { canRemoveChapter } from "@/lib/generation/outlineEdit";
import { removeChapter } from "@/lib/generation/outlineEditOps";
import { jsonErrorResponse } from "@/lib/server/apiError";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * FR-2: remove one chapter from a module's outline. Not behind
 * withRouteGuards — that bundles the per-day AI-generation cap, which
 * doesn't fit here (no Claude call, just a database edit). Auth is still
 * required, same check as app/modules/[id]/outline/page.tsx; RLS (T-012)
 * is what actually stops editing another user's module — a module id that
 * doesn't exist or isn't this user's comes back as not found either way.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return jsonErrorResponse(401, "unauthenticated", "Sign in to continue.");
  }

  const { data: moduleRow, error: moduleError } = await supabase.from("modules").select("status").eq("id", id).single();
  if (moduleError || !moduleRow) {
    return jsonErrorResponse(404, "invalid_request", "Module not found.");
  }

  const { count, error: countError } = await supabase
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .eq("module_id", id);
  if (countError || count === null) {
    return jsonErrorResponse(500, "generation_failed", "Couldn't read the chapter count.");
  }

  const check = canRemoveChapter(moduleRow.status, count);
  if (!check.ok) {
    return jsonErrorResponse(400, "invalid_request", check.reason);
  }

  const chapters = await removeChapter(supabase, id, chapterId);
  return Response.json({ chapters });
}
