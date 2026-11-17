import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Pure decision logic for the callback: given the `code` query param and an
 * injectable code-exchange function, decides where to send the browser next.
 * No Next.js runtime dependency, so it's unit tested directly.
 */
export async function determineRedirectPath(
  code: string | null,
  exchangeCodeForSession: (code: string) => Promise<{ error: { message: string } | null }>,
): Promise<string> {
  if (!code) return "/sign-in?error=missing_code";

  try {
    const { error } = await exchangeCodeForSession(code);
    if (error) return "/sign-in?error=auth_failed";
  } catch {
    return "/sign-in?error=auth_failed";
  }

  return "/";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  const response = NextResponse.next();
  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet) =>
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
  });

  const path = await determineRedirectPath(code, (c) =>
    supabase.auth.exchangeCodeForSession(c).then((r) => ({ error: r.error })),
  );

  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));

  return redirectResponse;
}
