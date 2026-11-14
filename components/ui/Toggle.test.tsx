import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  test("is a real <button> with role=switch, so Enter/Space work natively", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Daily reminder" />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl.tagName).toBe("BUTTON");
  });

  test("reflects checked via aria-checked", () => {
    render(<Toggle checked={true} onChange={() => {}} label="Daily reminder" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  test("exposes the label to assistive tech", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Daily reminder" />);
    expect(screen.getByLabelText("Daily reminder")).toBeInTheDocument();
  });

  test("calls onChange with the inverted value when clicked", async () => {
    const onChange = mock();
    render(<Toggle checked={false} onChange={onChange} label="Daily reminder" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
