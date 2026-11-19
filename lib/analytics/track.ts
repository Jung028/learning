import posthog from "posthog-js";
import { getConsent } from "./consent";

export type AnalyticsEvent =
  | "module_created"
  | "card_viewed"
  | "chapter_finished"
  | "quiz_started"
  | "quiz_passed"
  | "discussion_started"
  | "review_finished";

type AnalyticsProperties = Record<string, string | number | boolean>;

/**
 * Only structural properties belong here (ADR-017: no content in event
 * properties) — never topic text, card text, or anything the user typed
 * or Claude generated.
 */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (getConsent() !== "granted") return;
  posthog.capture(event, properties);
}
