import posthog from "posthog-js";
import { getConsent, setConsent } from "./consent";

let ready = false;

/**
 * No-ops until a PostHog project is actually provisioned (see T-015's
 * tasks.md note) — missing env vars mean analytics is simply off, not an
 * error.
 */
export function initAnalytics(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: false,
    opt_out_capturing_by_default: true,
  });
  ready = true;

  if (getConsent() === "granted") {
    posthog.opt_in_capturing();
  }
}

export function setAnalyticsConsent(state: "granted" | "denied"): void {
  setConsent(state);
  if (!ready) return;
  if (state === "granted") {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}
