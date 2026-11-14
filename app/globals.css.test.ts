import { describe, expect, test } from "bun:test";

const css = await Bun.file("app/globals.css").text();

const tokens: Record<string, string> = {
  "--color-latte": "#F5EDE3",
  "--color-foam": "#FFFBF6",
  "--color-ink": "#2B1A12",
  "--color-ink-hover": "#4A2E1E",
  "--color-muted": "#6F5A4C",
  "--color-mocha": "#6F4630",
  "--color-cappuccino": "#EADBC8",
  "--color-caramel": "#C98B4B",
  "--color-crema": "#E0D2C0",
  "--color-matcha": "#3F6B3A",
  "--color-matcha-soft": "#E5EFDD",
  "--color-cherry": "#A23B2A",
  "--color-cherry-soft": "#F8E3DD",
  "--radius-pill": "999px",
  "--radius-card": "24px",
  "--radius-card-lg": "32px",
  "--radius-option": "14px",
  "--radius-row": "16px",
};

describe("design tokens in app/globals.css", () => {
  for (const [name, value] of Object.entries(tokens)) {
    test(`${name} is ${value}`, () => {
      expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
    });
  }
});
