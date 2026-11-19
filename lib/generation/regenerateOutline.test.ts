import { describe, expect, mock, test } from "bun:test";
import { regenerateOutline, type ModuleForRegeneration, type RegenerateOutlineDeps } from "./regenerateOutline";
import type { Outline } from "./schemas";

const baseModule: ModuleForRegeneration = {
  id: "module-1",
  status: "outlining",
  topic: "Stoicism",
  level: "beginner",
  length: "short",
};

const baseOutline: Outline = {
  title: "Stoicism",
  summary: "A short course on Stoicism.",
  chapters: [
    { title: "Where it began", objectives: "Explain the origins." },
    { title: "Control what you can", objectives: "Apply the dichotomy of control." },
    { title: "Stoicism today", objectives: "Connect it to modern life." },
  ],
};

function fakeDeps(overrides: Partial<RegenerateOutlineDeps> = {}): RegenerateOutlineDeps {
  return {
    generateOutline: async () => baseOutline,
    replaceChapters: async () => [
      { id: "c1", order: 0, title: "Where it began" },
      { id: "c2", order: 1, title: "Control what you can" },
      { id: "c3", order: 2, title: "Stoicism today" },
    ],
    ...overrides,
  };
}

describe("regenerateOutline", () => {
  test("refuses when the module has moved past outlining, without generating or replacing", async () => {
    const generateOutline = mock(fakeDeps().generateOutline);
    const replaceChapters = mock(fakeDeps().replaceChapters);
    const deps = fakeDeps({ generateOutline, replaceChapters });

    const result = await regenerateOutline(deps, { ...baseModule, status: "generating" });

    expect(result).toEqual({ status: "forbidden", reason: "This module's outline can no longer be edited." });
    expect(generateOutline).not.toHaveBeenCalled();
    expect(replaceChapters).not.toHaveBeenCalled();
  });

  test("returns failed when outline generation throws, without replacing", async () => {
    const replaceChapters = mock(fakeDeps().replaceChapters);
    const deps = fakeDeps({
      generateOutline: async () => {
        throw new Error("boom");
      },
      replaceChapters,
    });

    const result = await regenerateOutline(deps, baseModule);

    expect(result).toEqual({ status: "failed", message: "Couldn't regenerate the outline. Try again." });
    expect(replaceChapters).not.toHaveBeenCalled();
  });

  test("passes the module's own chapter count to generateOutline", async () => {
    const seenChapterCounts: number[] = [];
    const deps = fakeDeps({
      generateOutline: async (request) => {
        seenChapterCounts.push(request.chapterCount);
        return baseOutline;
      },
    });

    await regenerateOutline(deps, { ...baseModule, length: "long" });

    expect(seenChapterCounts).toEqual([8]);
  });

  test("replaces the chapters and returns the regenerated outline", async () => {
    const result = await regenerateOutline(fakeDeps(), baseModule);

    expect(result).toEqual({
      status: "regenerated",
      title: baseOutline.title,
      summary: baseOutline.summary,
      chapters: [
        { id: "c1", order: 0, title: "Where it began" },
        { id: "c2", order: 1, title: "Control what you can" },
        { id: "c3", order: 2, title: "Stoicism today" },
      ],
    });
  });
});
