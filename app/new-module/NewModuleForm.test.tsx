import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewModuleForm } from "./NewModuleForm";

describe("NewModuleForm", () => {
  test("renders the topic field and the level and length chips", () => {
    render(<NewModuleForm navigate={() => {}} />);
    expect(screen.getByLabelText("Topic")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beginner" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Intermediate" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "3 chapters" })).toHaveAttribute("aria-pressed", "true");
  });

  test("clicking a level chip selects it and deselects the others", async () => {
    render(<NewModuleForm navigate={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Advanced" }));
    expect(screen.getByRole("button", { name: "Advanced" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Beginner" })).toHaveAttribute("aria-pressed", "false");
  });

  test("submitting with no topic makes no request", async () => {
    const submitCreateModule = mock(async () => ({ status: "created" as const, moduleId: "m1" }));
    render(<NewModuleForm submitCreateModule={submitCreateModule} navigate={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Generate outline" }));
    expect(submitCreateModule).not.toHaveBeenCalled();
  });

  test("submitting sends the topic, level and length, and navigates to the outline on success", async () => {
    const submitCreateModule = mock(async () => ({ status: "created" as const, moduleId: "module-42" }));
    const navigate = mock(() => {});
    render(<NewModuleForm submitCreateModule={submitCreateModule} navigate={navigate} />);

    await userEvent.type(screen.getByLabelText("Topic"), "Stoicism");
    await userEvent.click(screen.getByRole("button", { name: "Intermediate" }));
    await userEvent.click(screen.getByRole("button", { name: "8 chapters" }));
    await userEvent.click(screen.getByRole("button", { name: "Generate outline" }));

    expect(submitCreateModule).toHaveBeenCalledWith({ topic: "Stoicism", level: "intermediate", length: "long" });
    expect(await screen.findByRole("status")).toHaveTextContent(/stoicism/i);
    expect(navigate).toHaveBeenCalledWith("/modules/module-42/outline");
  });

  test("shows the refusal reason and returns to the form when the topic is refused", async () => {
    const submitCreateModule = mock(async () => ({ status: "refused" as const, reason: "Not safe to teach." }));
    render(<NewModuleForm submitCreateModule={submitCreateModule} navigate={() => {}} />);

    await userEvent.type(screen.getByLabelText("Topic"), "Something risky");
    await userEvent.click(screen.getByRole("button", { name: "Generate outline" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Not safe to teach.");
    expect(screen.getByLabelText("Topic")).toBeInTheDocument();
  });

  test("shows a server error message and returns to the form", async () => {
    const submitCreateModule = mock(async () => ({ error: { code: "generation_failed", message: "Couldn't write the outline. Try again." } }));
    render(<NewModuleForm submitCreateModule={submitCreateModule} navigate={() => {}} />);

    await userEvent.type(screen.getByLabelText("Topic"), "Stoicism");
    await userEvent.click(screen.getByRole("button", { name: "Generate outline" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't write the outline");
  });

  test("shows a generic error when the request itself throws", async () => {
    const submitCreateModule = mock(async () => {
      throw new Error("network down");
    });
    render(<NewModuleForm submitCreateModule={submitCreateModule} navigate={() => {}} />);

    await userEvent.type(screen.getByLabelText("Topic"), "Stoicism");
    await userEvent.click(screen.getByRole("button", { name: "Generate outline" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
