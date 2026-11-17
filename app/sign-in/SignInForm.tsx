"use client";

import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface SignInFormProps {
  getClient?: () => SupabaseClient;
}

export function SignInForm({ getClient = getSupabaseBrowserClient }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: "apple" | "google") {
    setError(null);
    const { error } = await getClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    const { error } = await getClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="dark" onClick={() => handleOAuth("apple")}>
        Continue with Apple
      </Button>
      <Button variant="outline" onClick={() => handleOAuth("google")}>
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-muted text-[13px]">
        <div className="flex-1 h-px bg-crema" />
        or
        <div className="flex-1 h-px bg-crema" />
      </div>
      <form
        onSubmit={handleEmailSubmit}
        className="flex flex-col gap-3"
      >
        <label
          htmlFor="email"
          className="text-sm font-semibold"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="box-border h-[52px] rounded-option border border-crema bg-foam text-ink font-sans text-base px-4"
        />
        <Button
          type="submit"
          variant="primary"
        >
          Send me a sign-in link
        </Button>
      </form>
      {status === "sent" && (
        <p
          role="status"
          className="text-sm text-muted text-center"
        >
          Check your email for a sign-in link.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-sm text-cherry text-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}
