import { describe, expect, test } from "bun:test";
import { createModule, type CreateModuleDeps } from "./createModule";

const baseInput = { topic: "Stoicism", level: "beginner" as const, length: "short" as const };

const baseOutline = {
  title: "Stoicism",
  summary: "A short course on Stoic philosophy.",
  chapters: [
    { title: "Chapter 1", objectives: "x" },
    { title: "Chapter 2", objectives: "y" },
    { title: "Chapter 3", objectives: "z" },
  ],
};

function fakeDeps(overrides: Partial<CreateModuleDeps> = {}): CreateModuleDeps {
  return {
    checkTopicSafety: async () => ({ refused: false, advisoryCategory: "none" }),
    generateOutline: async () => baseOutline,
    saveModule: async () => ({
      moduleId: "module-1",
      chapters: baseOutline.chapters.map((c, i) => ({ id: `chapter-${i}`, order: i, title: c.title })),
    }),
    ...overrides,
  };
}

describe("createModule", () => {
  test("returns refused when the topic safety check refuses, without generating or saving anything", async () => {
    let generated = false;
    let saved = false;
    const deps = fakeDeps({
      checkTopicSafety: async () => ({ refused: true, reason: "Not safe to teach." }),
      generateOutline: async () => {
        generated = true;
        return baseOutline;
      },
      saveModule: async () => {
        saved = true;
        return { moduleId: "x", chapters: [] };
      },
    });

    const result = await createModule(deps, "user-1", baseInput);

    expect(result).toEqual({ status: "refused", reason: "Not safe to teach." });
    expect(generated).toBe(false);
    expect(saved).toBe(false);
  });

  test("returns failed when outline generation throws, without saving anything", async () => {
    let saved = false;
    const deps = fakeDeps({
      generateOutline: async () => {
        throw new Error("bad output");
      },
      saveModule: async () => {
        saved = true;
        return { moduleId: "x", chapters: [] };
      },
    });

    const result = await createModule(deps, "user-1", baseInput);

    expect(result).toEqual({ status: "failed", message: expect.any(String) });
    expect(saved).toBe(false);
  });

  test("passes the length's chapter count to generateOutline", async () => {
    const seenChapterCounts: number[] = [];
    const deps = fakeDeps({
      generateOutline: async (request) => {
        seenChapterCounts.push(request.chapterCount);
        return baseOutline;
      },
    });

    await createModule(deps, "user-1", baseInput);

    expect(seenChapterCounts).toEqual([3]);
  });

  test("saves the outline under the given user id and returns the created module", async () => {
    const seenUserIds: string[] = [];
    const deps = fakeDeps({
      saveModule: async (userId) => {
        seenUserIds.push(userId);
        return {
          moduleId: "module-42",
          chapters: [{ id: "chapter-1", order: 0, title: "Chapter 1" }],
        };
      },
    });

    const result = await createModule(deps, "user-1", baseInput);

    expect(seenUserIds).toEqual(["user-1"]);
    expect(result).toEqual({
      status: "created",
      moduleId: "module-42",
      title: baseOutline.title,
      summary: baseOutline.summary,
      advisoryCategory: "none",
      chapters: [{ id: "chapter-1", order: 0, title: "Chapter 1" }],
    });
  });

  test("passes the advisory category through to the created result", async () => {
    const deps = fakeDeps({ checkTopicSafety: async () => ({ refused: false, advisoryCategory: "medical" }) });
    const result = await createModule(deps, "user-1", baseInput);
    expect(result).toMatchObject({ status: "created", advisoryCategory: "medical" });
  });
});
