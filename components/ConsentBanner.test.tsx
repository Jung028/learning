import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsentBanner } from "./ConsentBanner";
import { getConsent, setConsent } from "../lib/analytics/consent";

describe("ConsentBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("shows the banner when consent has not been decided", () => {
    render(<ConsentBanner />);
    expect(screen.getByRole("region", { name: "Analytics consent" })).toBeInTheDocument();
  });

  test("does not show the banner when consent was already granted", () => {
    setConsent("granted");
    render(<ConsentBanner />);
    expect(screen.queryByRole("region", { name: "Analytics consent" })).not.toBeInTheDocument();
  });

  test("does not show the banner when consent was already denied", () => {
    setConsent("denied");
    render(<ConsentBanner />);
    expect(screen.queryByRole("region", { name: "Analytics consent" })).not.toBeInTheDocument();
  });

  test("accepting stores granted consent and hides the banner", async () => {
    render(<ConsentBanner />);
    await userEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(getConsent()).toBe("granted");
    expect(screen.queryByRole("region", { name: "Analytics consent" })).not.toBeInTheDocument();
  });

  test("declining stores denied consent and hides the banner", async () => {
    render(<ConsentBanner />);
    await userEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(getConsent()).toBe("denied");
    expect(screen.queryByRole("region", { name: "Analytics consent" })).not.toBeInTheDocument();
  });
});
