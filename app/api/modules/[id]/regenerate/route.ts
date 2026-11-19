import type { NextRequest } from "next/server";
import { getClaudeClient } from "@/lib/generation/client";
import { callOutlineGeneration } from "@/lib/generation/outline";
import { replaceChapters } from "@/lib/generation/outlineEditOps";
import { regenerateOutline } from "@/lib/generation/regenerateOutline";
import { jsonErrorResponse } from "@/lib/server/apiError";
import { withRouteGuards } from "@/lib/server/withRouteGuards";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * FR-2: regenerate a module's outline for the same topic/level/length.
 * Shares the "generation" bucket (and so the daily cap) with
 * POST /api/modules — a regenerate call costs Claude the same as the
 * original outline call.
 */
export const POST = withRouteGuards<{ params: Promise<{ id: string }> }>(
  "generation",
  async (request: NextRequest, { params }) => {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    const { data: moduleRow, error: moduleError } = await supabase
      .from("modules")
      .select("id, status, topic, level, length")
      .eq("id", id)
      .single();
    if (moduleError || !moduleRow) {
      return jsonErrorResponse(404, "invalid_request", "Module not found.");
    }

    const claude = getClaudeClient();

    const result = await regenerateOutline(
      {
        generateOutline: (outlineRequest) => callOutlineGeneration(claude, outlineRequest),
        replaceChapters: (moduleId, outline) => replaceChapters(supabase, moduleId, outline),
      },
      moduleRow,
    );

    if (result.status === "forbidden") {
      return jsonErrorResponse(400, "invalid_request", result.reason);
    }
    if (result.status === "failed") {
      return jsonErrorResponse(502, "generation_failed", result.message);
    }

    return Response.json(result);
  },
);
