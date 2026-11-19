import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getConsent, setConsent, subscribeToConsent } from "./consent";

describe("getConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("defaults to unset when nothing has been stored", () => {
    expect(getConsent()).toBe("unset");
  });

  test("returns a previously granted consent", () => {
    setConsent("granted");
    expect(getConsent()).toBe("granted");
  });

  test("returns a previously denied consent", () => {
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  test("ignores a corrupted stored value and reports unset", () => {
    localStorage.setItem("swipelearn-analytics-consent", "not-a-real-value");
    expect(getConsent()).toBe("unset");
  });
});

describe("subscribeToConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("notifies subscribers when consent is set", () => {
    const listener = mock();
    subscribeToConsent(listener);
    setConsent("granted");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("stops notifying after unsubscribing", () => {
    const listener = mock();
    const unsubscribe = subscribeToConsent(listener);
    unsubscribe();
    setConsent("granted");
    expect(listener).not.toHaveBeenCalled();
  });
});
