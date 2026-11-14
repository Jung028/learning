import { describe, expect, test, mock } from "bun:test";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet", () => {
  test("renders nothing when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("renders title and children when open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("clicking the backdrop calls onClose", async () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    await userEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking inside the panel does not call onClose", async () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    await userEvent.click(screen.getByText("Content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("pressing Escape calls onClose", () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("moves focus into the panel on open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  test("restores focus to the trigger on close", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>Open</button>
          <BottomSheet open={open} onClose={() => setOpen(false)} title="Ask Claude">
            Content
          </BottomSheet>
        </div>
      );
    }
    render(<Harness />);
    const trigger = screen.getByText("Open");
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });
});
