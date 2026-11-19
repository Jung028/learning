import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { OutlineView } from "./OutlineView";

// Same instant-navigation tradeoff as app/sign-in/page.tsx and
// app/new-module/page.tsx: reads cookies() to check auth and ownership, so
// there's no static shell worth prerendering.
export const instant = false;

/**
 * FR-2: shows the outline a module was just created with, and lets the
 * learner remove a chapter or regenerate it (OutlineView.tsx — client-side
 * for the interactivity). "Start chapter 1" isn't here yet — T-024
 * (chapter/card generation) doesn't exist. RLS (T-012) is what actually
 * stops one user from loading another's module; `.single()` on a module
 * that doesn't exist or isn't this user's throws, which `notFound()` below
 * turns into a 404 rather than leaking which case it was.
 *
 * Not covered by a test here, like app/sign-in/page.tsx — it depends on
 * next/headers' request-scoped cookies() and a dynamic route param, neither
 * meaningful under Bun's test runner outside a real request. OutlineView's
 * own interactivity is covered by OutlineView.test.tsx.
 */
export default async function OutlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/sign-in");

  const { data: moduleRow, error: moduleError } = await supabase
    .from("modules")
    .select("id, title, summary")
    .eq("id", id)
    .single();
  if (moduleError || !moduleRow) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, order, title, objectives")
    .eq("module_id", id)
    .order("order");

  return (
    <main className="min-h-full flex flex-col bg-latte text-ink px-5 pt-[72px] pb-8 gap-5">
      <OutlineView
        moduleId={id}
        initialTitle={moduleRow.title ?? "Your course"}
        initialSummary={moduleRow.summary}
        initialChapters={chapters ?? []}
      />
    </main>
  );
}
