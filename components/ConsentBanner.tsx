"use client";

import { useSyncExternalStore } from "react";
import { Button } from "./ui/Button";
import { getConsent, subscribeToConsent } from "../lib/analytics/consent";
import { setAnalyticsConsent } from "../lib/analytics/init";

function getServerSnapshot() {
  return "unset" as const;
}

export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsent, getServerSnapshot);

  if (consent !== "unset") return null;

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-40 bg-foam border-t border-crema px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink">
        We use analytics to see how SwipeLearn is used, so we can improve it. No course content is
        ever sent.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setAnalyticsConsent("denied")}>
          Decline
        </Button>
        <Button variant="primary" onClick={() => setAnalyticsConsent("granted")}>
          Accept
        </Button>
      </div>
    </div>
  );
}
