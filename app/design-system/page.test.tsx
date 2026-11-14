import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import DesignSystemPage from "./page";

describe("design system showcase page", () => {
  test("renders without throwing and shows the primary button", () => {
    render(<DesignSystemPage />);
    expect(screen.getByText("New module")).toBeInTheDocument();
  });
});
