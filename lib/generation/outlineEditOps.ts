import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedChapter } from "./createModule";
import { insertChaptersForOutline } from "./saveModule";
import type { Outline } from "./schemas";

/**
 * Real persistence for FR-2's two outline edits. Not covered by a test
 * here, same as saveModule.ts — both need a real database; regenerateOutline.ts
 * and the removal check in outlineEdit.ts are what's unit tested.
 */

/** Deletes all chapters of `moduleId` and inserts the new outline's, renumbered from 0. */
export async function replaceChapters(
  supabase: SupabaseClient,
  moduleId: string,
  outline: Outline,
): Promise<SavedChapter[]> {
  const { error: deleteError } = await supabase.from("chapters").delete().eq("module_id", moduleId);
  if (deleteError) throw deleteError;

  const { error: moduleError } = await supabase
    .from("modules")
    .update({ title: outline.title, summary: outline.summary })
    .eq("id", moduleId);
  if (moduleError) throw moduleError;

  return insertChaptersForOutline(supabase, moduleId, outline);
}

/** Deletes one chapter, then renumbers the rest to stay contiguous from 0. */
export async function removeChapter(
  supabase: SupabaseClient,
  moduleId: string,
  chapterId: string,
): Promise<SavedChapter[]> {
  const { error: deleteError } = await supabase.from("chapters").delete().eq("id", chapterId).eq("module_id", moduleId);
  if (deleteError) throw deleteError;

  const { data: remaining, error: fetchError } = await supabase
    .from("chapters")
    .select("id, order, title")
    .eq("module_id", moduleId)
    .order("order");
  if (fetchError || !remaining) throw fetchError ?? new Error("Failed to read remaining chapters.");

  const renumbered = remaining.map((chapter, index) => ({ ...chapter, order: index }));

  await Promise.all(
    renumbered.map((chapter) => supabase.from("chapters").update({ order: chapter.order }).eq("id", chapter.id)),
  );

  return renumbered;
}
