import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesignSystemPage from "./page";

describe("design system showcase page", () => {
  test("renders without throwing and shows the primary button", () => {
    render(<DesignSystemPage />);
    expect(screen.getByText("New module")).toBeInTheDocument();
  });

  test("the two chips are mutually exclusive", async () => {
    render(<DesignSystemPage />);
    const selectedChip = screen.getByRole("button", { name: "Selected" });
    const unselectedChip = screen.getByRole("button", { name: "Unselected" });

    expect(selectedChip).toHaveAttribute("aria-pressed", "true");
    expect(unselectedChip).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(unselectedChip);

    expect(selectedChip).toHaveAttribute("aria-pressed", "false");
    expect(unselectedChip).toHaveAttribute("aria-pressed", "true");
  });
});
