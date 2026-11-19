import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NewModuleForm } from "./NewModuleForm";

// Same instant-navigation tradeoff as app/sign-in/page.tsx: this page
// reads cookies() (via getSupabaseServerClient()) to decide whether to
// redirect, so there's no static shell worth prerendering.
export const instant = false;

export default async function NewModulePage() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  return (
    <main className="min-h-full flex flex-col bg-latte text-ink px-5 pt-[72px] pb-8 gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display font-bold text-[32px] leading-[38px]">What do you want to learn?</h1>
        <p className="m-0 text-base leading-6 text-muted">
          Type anything. Claude builds a short course with a quiz after every chapter.
        </p>
      </div>
      <NewModuleForm />
    </main>
  );
}
