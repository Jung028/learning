export type ModuleStatus = "outlining" | "generating" | "ready" | "archived" | "done";

export type OutlineEditCheck = { ok: true } | { ok: false; reason: string };

/** FR-2: the outline can only be edited before any chapter has started generating (system-analysis.md §7's state machine starts a module at "outlining"). */
export function canEditOutline(status: ModuleStatus): OutlineEditCheck {
  if (status !== "outlining") {
    return { ok: false, reason: "This module's outline can no longer be edited." };
  }
  return { ok: true };
}

export function canRemoveChapter(status: ModuleStatus, remainingChapterCount: number): OutlineEditCheck {
  const editCheck = canEditOutline(status);
  if (!editCheck.ok) return editCheck;

  if (remainingChapterCount <= 1) {
    return { ok: false, reason: "A course needs at least one chapter." };
  }
  return { ok: true };
}
