import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { BottomTabBar } from "./BottomTabBar";

const tabs = [
  { key: "home", label: "Home", icon: <span />, href: "/" },
  { key: "library", label: "Library", icon: <span />, href: "/library" },
  { key: "stash", label: "Stash", icon: <span />, href: "/stash" },
  { key: "you", label: "You", icon: <span />, href: "/settings" },
];

describe("BottomTabBar", () => {
  test("renders a link per tab with the correct href", () => {
    render(<BottomTabBar tabs={tabs} activeKey="home" />);
    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Library/ })).toHaveAttribute("href", "/library");
  });

  test("marks the active tab with aria-current=page", () => {
    render(<BottomTabBar tabs={tabs} activeKey="library" />);
    expect(screen.getByRole("link", { name: /Library/ })).toHaveAttribute("aria-current", "page");
  });

  test("does not mark inactive tabs with aria-current", () => {
    render(<BottomTabBar tabs={tabs} activeKey="library" />);
    expect(screen.getByRole("link", { name: /Home/ })).not.toHaveAttribute("aria-current");
  });
});
