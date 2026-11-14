import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  test("renders its children", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("default variant uses 24px radius", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("rounded-card");
  });

  test("swipe variant uses 32px radius", () => {
    render(<Card variant="swipe">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("rounded-card-lg");
  });

  test("merges a caller-supplied className", () => {
    render(<Card className="mt-4">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("mt-4");
  });
});
