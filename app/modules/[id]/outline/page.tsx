import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Same instant-navigation tradeoff as app/sign-in/page.tsx and
// app/new-module/page.tsx: reads cookies() to check auth and ownership, so
// there's no static shell worth prerendering.
export const instant = false;

/**
 * Read-only for now (T-022's boundary): shows the outline a module was
 * just created with. Remove-chapter, regenerate, and "start chapter 1"
 * (design/Outline.dc.html) are T-023/T-024 — not built yet, so this page
 * has no actions. RLS (T-012) is what actually stops one user from loading
 * another's module; `.single()` on a module that doesn't exist or isn't
 * this user's throws, which `notFound()` below turns into a 404 rather
 * than leaking which case it was.
 *
 * Not covered by a test here, like app/sign-in/page.tsx — it depends on
 * next/headers' request-scoped cookies() and a dynamic route param, neither
 * meaningful under Bun's test runner outside a real request.
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
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display font-bold text-[32px] leading-[38px]">{moduleRow.title ?? "Your course"}</h1>
        {moduleRow.summary && <p className="m-0 text-base leading-6 text-muted">{moduleRow.summary}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {(chapters ?? []).map((chapter, i) => (
          <div key={chapter.id} className="flex items-center gap-3 rounded-card border border-crema bg-foam p-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-pill bg-cappuccino text-sm font-semibold text-ink-hover">
              {i + 1}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-base font-semibold leading-[22px]">{chapter.title}</div>
              <div className="text-[13px] text-muted">{chapter.objectives}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
