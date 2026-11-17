import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "./SignInForm";

// The auth callback route redirects here with `?error=<code>` when a magic
// link has expired, was already used, or arrived without a code. Map the
// known codes to plain-language messages; anything else (including absent)
// shows no initial error.
function errorMessageFor(code: string | undefined): string | null {
  switch (code) {
    case "missing_code":
      return "That sign-in link is missing a code. Request a new one.";
    case "auth_failed":
      return "That sign-in link didn't work — it may have expired or already been used. Request a new one.";
    default:
      return null;
  }
}

// Not covered by a test: `getSupabaseServerClient()` depends on `next/headers`'
// request-scoped `cookies()`, which has no meaningful behavior outside an
// actual Next.js request and isn't testable under Bun's test runner — same
// limitation documented in `lib/supabase/server.ts`/`server.test.ts`.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const { error } = await searchParams;
  const initialError = errorMessageFor(error);

  return (
    <main className="min-h-full flex flex-col bg-latte text-ink px-5 pt-[72px] pb-8 gap-5">
      <div className="flex flex-col gap-3">
        <div
          className="w-16 h-16 rounded-card-lg bg-mocha text-foam flex items-center justify-center shadow-[0_6px_16px_rgba(94,59,40,0.28)]"
          aria-hidden="true"
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
            <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
            <path d="M8 3c-.8 1 .8 1.6 0 2.6M12 3c-.8 1 .8 1.6 0 2.6" />
          </svg>
        </div>
        <h1 className="m-0 font-display font-bold text-[36px] leading-[42px]">
          Learn anything,
          <br />
          one swipe at a time.
        </h1>
        <p className="m-0 text-base leading-6 text-muted">
          Type a topic. Claude builds the course. A quiz after every chapter makes it stick.
        </p>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-3">
        <SignInForm initialError={initialError} />
        <p className="text-xs leading-[18px] text-muted text-center">
          By continuing you agree to the Terms and Privacy Policy. Courses are written by AI and can contain
          mistakes.
        </p>
      </div>
    </main>
  );
}
