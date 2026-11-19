import type { NextRequest } from "next/server";
import { jsonErrorResponse } from "@/lib/server/apiError";
import { withRouteGuards } from "@/lib/server/withRouteGuards";
import { createModule } from "@/lib/generation/createModule";
import { parseCreateModuleRequest } from "@/lib/generation/createModuleRequest";
import { getClaudeClient } from "@/lib/generation/client";
import { callOutlineGeneration } from "@/lib/generation/outline";
import { saveModuleWithChapters } from "@/lib/generation/saveModule";
import { callTopicSafetyCheck, decideTopicSafety } from "@/lib/generation/topicSafety";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * FR-1: create a module from a topic, level and length. Guarded (T-016) on
 * the "generation" bucket, so this is the first real consumer of
 * withRouteGuards, and of every lib/generation/ piece built since. Thin
 * wiring only — the testable decision logic lives in createModule.ts.
 */
export const POST = withRouteGuards("generation", async (request: NextRequest, { userId }) => {
  const body = await request.json().catch(() => null);
  const parsed = parseCreateModuleRequest(body);
  if (!parsed.ok) {
    return jsonErrorResponse(400, "invalid_request", parsed.error);
  }

  const claude = getClaudeClient();
  const supabase = await getSupabaseServerClient();

  const result = await createModule(
    {
      checkTopicSafety: async (topic) => decideTopicSafety(await callTopicSafetyCheck(claude, topic)),
      generateOutline: (outlineRequest) => callOutlineGeneration(claude, outlineRequest),
      saveModule: (uid, input, outline) => saveModuleWithChapters(supabase, uid, input, outline),
    },
    userId,
    parsed.data,
  );

  if (result.status === "failed") {
    return jsonErrorResponse(502, "generation_failed", result.message);
  }

  return Response.json(result);
});
