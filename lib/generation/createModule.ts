import type { CreateModuleRequest } from "./createModuleRequest";
import { CHAPTER_COUNT_BY_LENGTH } from "./length";
import type { OutlineRequest } from "./outline";
import type { Outline } from "./schemas";
import type { TopicSafetyResult } from "./topicSafety";

export type SavedChapter = { id: string; order: number; title: string };

export type CreateModuleDeps = {
  checkTopicSafety: (topic: string) => Promise<TopicSafetyResult>;
  generateOutline: (request: OutlineRequest) => Promise<Outline>;
  saveModule: (
    userId: string,
    input: CreateModuleRequest,
    outline: Outline,
  ) => Promise<{ moduleId: string; chapters: SavedChapter[] }>;
};

export type CreateModuleResult =
  | { status: "refused"; reason: string }
  | { status: "failed"; message: string }
  | {
      status: "created";
      moduleId: string;
      title: string;
      summary: string;
      advisoryCategory: "medical" | "legal" | "money" | "none";
      chapters: SavedChapter[];
    };

/**
 * Pure orchestration for FR-1: topic safety check, then the outline call,
 * then persistence — each step injected so this is testable without a
 * network request or database. Nothing is saved unless the topic is
 * allowed and the outline validates (architecture.md's reliability rule:
 * "failed call shows retry, never a half chapter").
 */
export async function createModule(
  deps: CreateModuleDeps,
  userId: string,
  input: CreateModuleRequest,
): Promise<CreateModuleResult> {
  const safety = await deps.checkTopicSafety(input.topic);
  if (safety.refused) {
    return { status: "refused", reason: safety.reason };
  }

  const chapterCount = CHAPTER_COUNT_BY_LENGTH[input.length];

  let outline: Outline;
  try {
    outline = await deps.generateOutline({ ...input, chapterCount });
  } catch {
    return { status: "failed", message: "Couldn't write the outline. Try again." };
  }

  const saved = await deps.saveModule(userId, input, outline);

  return {
    status: "created",
    moduleId: saved.moduleId,
    title: outline.title,
    summary: outline.summary,
    advisoryCategory: safety.advisoryCategory,
    chapters: saved.chapters,
  };
}
