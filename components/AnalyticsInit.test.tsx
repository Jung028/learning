import { beforeEach, describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { posthogMock } from "../test/posthog-mock";
import { AnalyticsInit } from "./AnalyticsInit";

const ORIGINAL_ENV = { ...process.env };

describe("AnalyticsInit", () => {
  beforeEach(() => {
    posthogMock.init.mockClear();
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.com";
  });

  test("initializes analytics on mount", () => {
    render(<AnalyticsInit />);
    expect(posthogMock.init).toHaveBeenCalledTimes(1);
  });

  test("renders nothing", () => {
    const { container } = render(<AnalyticsInit />);
    expect(container).toBeEmptyDOMElement();
  });
});
