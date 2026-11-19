import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedChapter } from "./createModule";
import type { CreateModuleRequest } from "./createModuleRequest";
import type { Outline } from "./schemas";

/**
 * Real persistence for a just-generated outline: one `modules` row (status
 * "outlining" — the module-state machine's first state, system-analysis.md
 * §7; the column's own `default 'generating'` from T-012 predates that
 * state machine and is overridden here rather than migrated, since nothing
 * depends on the default), then one `chapters` row per outline chapter, all
 * "locked" (architecture.md §4's chapter states) until T-023/T-024 open
 * them. Not covered by a test here — it needs a real database; the
 * orchestration around it (createModule.ts) is what's unit tested.
 */
export async function saveModuleWithChapters(
  supabase: SupabaseClient,
  userId: string,
  input: CreateModuleRequest,
  outline: Outline,
): Promise<{ moduleId: string; chapters: SavedChapter[] }> {
  const { data: module, error: moduleError } = await supabase
    .from("modules")
    .insert({
      user_id: userId,
      topic: input.topic,
      level: input.level,
      length: input.length,
      title: outline.title,
      summary: outline.summary,
      status: "outlining",
    })
    .select("id")
    .single();

  if (moduleError || !module) {
    throw moduleError ?? new Error("Failed to create module.");
  }

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .insert(
      outline.chapters.map((chapter, index) => ({
        module_id: module.id,
        order: index,
        title: chapter.title,
        objectives: chapter.objectives,
        state: "locked",
      })),
    )
    .select("id, order, title")
    .order("order");

  if (chaptersError || !chapters) {
    throw chaptersError ?? new Error("Failed to create chapters.");
  }

  return { moduleId: module.id, chapters };
}
