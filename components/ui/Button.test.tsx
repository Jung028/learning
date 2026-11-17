import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, IconButton } from "./Button";
import type { ButtonVariant } from "./Button";

describe("Button", () => {
  test("renders its children", () => {
    render(<Button>New module</Button>);
    expect(screen.getByText("New module")).toBeInTheDocument();
  });

  test("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>New module</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  test.each([
    ["primary", "bg-mocha"],
    ["secondary", "bg-cappuccino"],
    ["text", "text-mocha"],
    ["danger", "border-cherry"],
    ["dark", "bg-ink"],
    ["outline", "border-crema"],
  ] satisfies [ButtonVariant, string][])("variant=%s gets class %s", (variant, className) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(className);
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("is a 52px pill", () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-[52px]");
    expect(button).toHaveClass("rounded-pill");
  });
});

describe("IconButton", () => {
  test("exposes the given label to assistive tech", () => {
    render(<IconButton label="Save card" icon={<span />} />);
    expect(screen.getByLabelText("Save card")).toBeInTheDocument();
  });

  test("is a 44x44 touch target", () => {
    render(<IconButton label="Close" icon={<span />} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-11");
    expect(button).toHaveClass("h-11");
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<IconButton label="Close" icon={<span />} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
