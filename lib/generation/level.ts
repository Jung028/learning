/** Matches the design's three level chips (design/Create.dc.html, Settings.dc.html) and `profiles.default_level`'s stored case. */
export const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export type Level = (typeof LEVELS)[number];
