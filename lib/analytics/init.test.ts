import { beforeEach, describe, expect, test } from "bun:test";
import { posthogMock } from "../../test/posthog-mock";
import { getConsent, setConsent } from "./consent";
import { initAnalytics, setAnalyticsConsent } from "./init";

const ORIGINAL_ENV = { ...process.env };

function clearPosthogMock() {
  posthogMock.init.mockClear();
  posthogMock.opt_in_capturing.mockClear();
  posthogMock.opt_out_capturing.mockClear();
}

describe("initAnalytics", () => {
  beforeEach(() => {
    localStorage.clear();
    clearPosthogMock();
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.com";
  });

  test("does nothing when PostHog env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    initAnalytics();
    expect(posthogMock.init).not.toHaveBeenCalled();
  });

  test("initializes PostHog opted out by default when env vars are present", () => {
    initAnalytics();
    expect(posthogMock.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://posthog.example.com",
        opt_out_capturing_by_default: true,
      }),
    );
  });

  test("opts in immediately if consent was already granted", () => {
    setConsent("granted");
    initAnalytics();
    expect(posthogMock.opt_in_capturing).toHaveBeenCalledTimes(1);
  });

  test("does not opt in if consent has not been granted", () => {
    initAnalytics();
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled();
  });
});

describe("setAnalyticsConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    clearPosthogMock();
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.com";
    initAnalytics();
    clearPosthogMock();
  });

  test("stores granted consent and opts in", () => {
    setAnalyticsConsent("granted");
    expect(getConsent()).toBe("granted");
    expect(posthogMock.opt_in_capturing).toHaveBeenCalledTimes(1);
    expect(posthogMock.opt_out_capturing).not.toHaveBeenCalled();
  });

  test("stores denied consent and opts out", () => {
    setAnalyticsConsent("denied");
    expect(getConsent()).toBe("denied");
    expect(posthogMock.opt_out_capturing).toHaveBeenCalledTimes(1);
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled();
  });
});
