import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  test("renders the placeholder", () => {
    render(<Home />);
    expect(screen.getByText("SwipeLearn")).toBeInTheDocument();
  });
});
