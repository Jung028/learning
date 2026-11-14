import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  test("exposes progressbar semantics", () => {
    render(<ProgressBar value={3} max={5} label="Card 3 of 5" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-label", "Card 3 of 5");
  });

  test("fills proportionally to value/max", () => {
    render(<ProgressBar value={3} max={5} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("60%");
  });

  test("clamps the fill at 100% when value exceeds max", () => {
    render(<ProgressBar value={9} max={5} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  test("renders 0% when max is 0 instead of NaN", () => {
    render(<ProgressBar value={0} max={0} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  test("clamps the fill at 0% when value is negative", () => {
    render(<ProgressBar value={-2} max={5} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });
});
