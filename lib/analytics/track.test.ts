import { beforeEach, describe, expect, test } from "bun:test";
import { posthogMock } from "../../test/posthog-mock";
import { setConsent } from "./consent";
import { track } from "./track";

describe("track", () => {
  beforeEach(() => {
    localStorage.clear();
    posthogMock.capture.mockClear();
  });

  test("does not capture when consent is unset", () => {
    track("module_created", { level: "beginner" });
    expect(posthogMock.capture).not.toHaveBeenCalled();
  });

  test("does not capture when consent was denied", () => {
    setConsent("denied");
    track("module_created", { level: "beginner" });
    expect(posthogMock.capture).not.toHaveBeenCalled();
  });

  test("captures the event once consent is granted", () => {
    setConsent("granted");
    track("module_created", { level: "beginner" });
    expect(posthogMock.capture).toHaveBeenCalledTimes(1);
    expect(posthogMock.capture).toHaveBeenCalledWith("module_created", { level: "beginner" });
  });

  test("captures with no properties", () => {
    setConsent("granted");
    track("discussion_started");
    expect(posthogMock.capture).toHaveBeenCalledWith("discussion_started", undefined);
  });
});
