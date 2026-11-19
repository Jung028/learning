import { LEVELS, type Level } from "./level";
import { type ModuleLength } from "./length";

const LENGTHS = ["short", "medium", "long"] as const satisfies readonly ModuleLength[];

export type CreateModuleRequest = { topic: string; level: Level; length: ModuleLength };

export type ParseResult = { ok: true; data: CreateModuleRequest } | { ok: false; error: string };

/** FR-1: a free-text topic up to 200 characters, plus level and length. Validated here before anything is sent to Claude or saved. */
export function parseCreateModuleRequest(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be an object." };
  }

  const { topic, level, length } = body as Record<string, unknown>;

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return { ok: false, error: "Topic is required." };
  }
  const trimmedTopic = topic.trim();
  if (trimmedTopic.length > 200) {
    return { ok: false, error: "Topic must be 200 characters or fewer." };
  }

  if (typeof level !== "string" || !LEVELS.includes(level as Level)) {
    return { ok: false, error: `Level must be one of: ${LEVELS.join(", ")}.` };
  }

  if (typeof length !== "string" || !LENGTHS.includes(length as ModuleLength)) {
    return { ok: false, error: `Length must be one of: ${LENGTHS.join(", ")}.` };
  }

  return { ok: true, data: { topic: trimmedTopic, level: level as Level, length: length as ModuleLength } };
}
