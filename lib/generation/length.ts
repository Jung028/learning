export type ModuleLength = "short" | "medium" | "long";

/**
 * Maps the DB's `modules.length` values to a chapter count. The design's
 * "How many chapters" chips (design/Create.dc.html, Settings.dc.html) only
 * ever offer 3, 5 or 8 — this is that same fixed mapping, not a guess.
 */
export const CHAPTER_COUNT_BY_LENGTH: Record<ModuleLength, number> = {
  short: 3,
  medium: 5,
  long: 8,
};
