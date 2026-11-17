import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SignInForm } from "./SignInForm";

function fakeClient(
  overrides: Partial<{ signInWithOAuth: unknown; signInWithOtp: unknown }> = {},
): SupabaseClient {
  return {
    auth: {
      signInWithOAuth: mock(async () => ({ error: null })),
      signInWithOtp: mock(async () => ({ error: null })),
      ...overrides,
    },
  } as unknown as SupabaseClient;
}

describe("SignInForm", () => {
  test("clicking Continue with Apple calls signInWithOAuth with provider apple", async () => {
    const client = fakeClient();
    render(<SignInForm getClient={() => client} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue with Apple" }));
    expect(client.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    const call = (client.auth.signInWithOAuth as ReturnType<typeof mock>).mock.calls[0][0];
    expect(call.provider).toBe("apple");
    expect(call.options.redirectTo).toContain("/auth/callback");
  });

  test("clicking Continue with Google calls signInWithOAuth with provider google", async () => {
    const client = fakeClient();
    render(<SignInForm getClient={() => client} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    const call = (client.auth.signInWithOAuth as ReturnType<typeof mock>).mock.calls[0][0];
    expect(call.provider).toBe("google");
  });

  test("submitting a valid email calls signInWithOtp and shows a confirmation", async () => {
    const client = fakeClient();
    render(<SignInForm getClient={() => client} />);
    await userEvent.type(screen.getByLabelText("Email"), "learner@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send me a sign-in link" }));
    expect(client.auth.signInWithOtp).toHaveBeenCalledTimes(1);
    const call = (client.auth.signInWithOtp as ReturnType<typeof mock>).mock.calls[0][0];
    expect(call.email).toBe("learner@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent(/check your email/i);
  });

  test("submitting with no email makes no auth call", async () => {
    const client = fakeClient();
    render(<SignInForm getClient={() => client} />);
    await userEvent.click(screen.getByRole("button", { name: "Send me a sign-in link" }));
    expect(client.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  test("shows an error message when signInWithOAuth fails", async () => {
    const client = fakeClient({ signInWithOAuth: mock(async () => ({ error: { message: "provider not enabled" } })) });
    render(<SignInForm getClient={() => client} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue with Apple" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("provider not enabled");
  });

  test("shows an error message when signInWithOtp fails", async () => {
    const client = fakeClient({ signInWithOtp: mock(async () => ({ error: { message: "rate limited" } })) });
    render(<SignInForm getClient={() => client} />);
    await userEvent.type(screen.getByLabelText("Email"), "learner@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send me a sign-in link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("rate limited");
  });

  test("shows an initial error passed in via the initialError prop", async () => {
    const client = fakeClient();
    render(<SignInForm getClient={() => client} initialError="That sign-in link didn't work." />);
    expect(await screen.findByRole("alert")).toHaveTextContent("That sign-in link didn't work.");
  });

  test("shows a generic error message when signInWithOAuth rejects", async () => {
    const client = fakeClient({
      signInWithOAuth: mock(async () => {
        throw new Error("network failure");
      }),
    });
    render(<SignInForm getClient={() => client} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue with Apple" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  });

  test("shows a generic error message when signInWithOtp rejects", async () => {
    const client = fakeClient({
      signInWithOtp: mock(async () => {
        throw new Error("network failure");
      }),
    });
    render(<SignInForm getClient={() => client} />);
    await userEvent.type(screen.getByLabelText("Email"), "learner@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send me a sign-in link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  });
});
