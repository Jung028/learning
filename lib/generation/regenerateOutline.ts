import type { SavedChapter } from "./createModule";
import { CHAPTER_COUNT_BY_LENGTH, type ModuleLength } from "./length";
import type { Level } from "./level";
import { canEditOutline, type ModuleStatus } from "./outlineEdit";
import type { Outline } from "./schemas";

export type ModuleForRegeneration = {
  id: string;
  status: ModuleStatus;
  topic: string;
  level: Level;
  length: ModuleLength;
};

export type RegenerateOutlineDeps = {
  generateOutline: (request: {
    topic: string;
    level: Level;
    length: ModuleLength;
    chapterCount: number;
  }) => Promise<Outline>;
  replaceChapters: (moduleId: string, outline: Outline) => Promise<SavedChapter[]>;
};

export type RegenerateOutlineResult =
  | { status: "forbidden"; reason: string }
  | { status: "failed"; message: string }
  | { status: "regenerated"; title: string; summary: string; chapters: SavedChapter[] };

/**
 * FR-2: a fresh outline for the same topic/level/length, replacing the
 * module's chapters. Mirrors createModule.ts's shape — nothing is replaced
 * unless generation succeeds — but there's no topic-safety call here: the
 * topic already passed it when the module was created.
 */
export async function regenerateOutline(
  deps: RegenerateOutlineDeps,
  module: ModuleForRegeneration,
): Promise<RegenerateOutlineResult> {
  const editCheck = canEditOutline(module.status);
  if (!editCheck.ok) {
    return { status: "forbidden", reason: editCheck.reason };
  }

  const chapterCount = CHAPTER_COUNT_BY_LENGTH[module.length];

  let outline: Outline;
  try {
    outline = await deps.generateOutline({
      topic: module.topic,
      level: module.level,
      length: module.length,
      chapterCount,
    });
  } catch {
    return { status: "failed", message: "Couldn't regenerate the outline. Try again." };
  }

  const chapters = await deps.replaceChapters(module.id, outline);

  return { status: "regenerated", title: outline.title, summary: outline.summary, chapters };
}
