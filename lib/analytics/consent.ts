const STORAGE_KEY = "swipelearn-analytics-consent";

export type ConsentState = "unset" | "granted" | "denied";

const listeners = new Set<() => void>();

export function getConsent(): ConsentState {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "granted" || stored === "denied" ? stored : "unset";
}

export function setConsent(state: "granted" | "denied"): void {
  localStorage.setItem(STORAGE_KEY, state);
  listeners.forEach((listener) => listener());
}

// Lets ConsentBanner use useSyncExternalStore for a hydration-safe read of
// localStorage; the browser's own "storage" event only fires in *other*
// tabs, so same-tab updates need this separate notification.
export function subscribeToConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
