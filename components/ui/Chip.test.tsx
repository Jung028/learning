import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip", () => {
  test("renders its label", () => {
    render(<Chip label="Beginner" />);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  test("defaults to unselected: aria-pressed=false, unselected styling", () => {
    render(<Chip label="Beginner" />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveClass("bg-foam");
  });

  test("selected: aria-pressed=true, selected styling", () => {
    render(<Chip label="Intermediate" selected />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveClass("bg-cappuccino");
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<Chip label="Beginner" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("is a 40px pill", () => {
    render(<Chip label="Beginner" />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveClass("h-10");
    expect(chip).toHaveClass("rounded-pill");
  });
});
