import { mock } from "bun:test";

// lib/analytics/init.ts is a real module several test files load (directly
// or via a component). Mocking "posthog-js" per test file registers
// competing replacements for the same module path — whichever file's
// mock.module call runs first silently wins for every other file too.
// Registering it once here, before any test file loads, avoids that.
export const posthogMock = {
  init: mock(),
  capture: mock(),
  opt_in_capturing: mock(),
  opt_out_capturing: mock(),
};

mock.module("posthog-js", () => ({ default: posthogMock }));
