-- Two fixes to the RLS policies from 20261115000002:
--
-- 1. Ownership-chain write hole (ADR-004, cross-user isolation): "own progress" /
--    "own attempts" / "own stash items" only checked `user_id = auth.uid()`, so an
--    authenticated user could point their own row's `module_id`/`chapter_id`/
--    `quiz_id`/`card_id` at another user's module/chapter/quiz/card. These three
--    policies are rebuilt to also require the referenced row trace back to a module
--    owned by the caller, AND'ed with the existing `user_id` check (not replacing
--    it), in both USING and WITH CHECK.
--
-- 2. `auth_rls_initplan` perf warning (Supabase advisor): every policy re-evaluated
--    `auth.uid()` per row instead of once via `(select auth.uid())`. Every policy is
--    recreated with the `(select ...)` form; the fix in (1) is unaffected since it's
--    a pure performance rewrite, not a logic change.

drop policy "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "own modules" on public.modules;
create policy "own modules" on public.modules
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "own feedback" on public.feedback;
create policy "own feedback" on public.feedback
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "own chapters" on public.chapters;
create policy "own chapters" on public.chapters
  for all using (
    exists (
      select 1 from public.modules m
      where m.id = chapters.module_id and m.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.modules m
      where m.id = chapters.module_id and m.user_id = (select auth.uid())
    )
  );

drop policy "own cards" on public.cards;
create policy "own cards" on public.cards
  for all using (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = cards.chapter_id and m.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = cards.chapter_id and m.user_id = (select auth.uid())
    )
  );

drop policy "own quizzes" on public.quizzes;
create policy "own quizzes" on public.quizzes
  for all using (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = quizzes.chapter_id and m.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = quizzes.chapter_id and m.user_id = (select auth.uid())
    )
  );

drop policy "own questions" on public.questions;
create policy "own questions" on public.questions
  for all using (
    exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = questions.quiz_id and m.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = questions.quiz_id and m.user_id = (select auth.uid())
    )
  );

drop policy "own progress" on public.progress;
create policy "own progress" on public.progress
  for all using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.modules m
      where m.id = progress.module_id and m.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.chapters c
      where c.id = progress.chapter_id and c.module_id = progress.module_id
    )
  ) with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.modules m
      where m.id = progress.module_id and m.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.chapters c
      where c.id = progress.chapter_id and c.module_id = progress.module_id
    )
  );

drop policy "own attempts" on public.attempts;
create policy "own attempts" on public.attempts
  for all using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = attempts.quiz_id and m.user_id = (select auth.uid())
    )
  ) with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = attempts.quiz_id and m.user_id = (select auth.uid())
    )
  );

drop policy "own stash items" on public.stash_items;
create policy "own stash items" on public.stash_items
  for all using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.cards cd
      join public.chapters c on c.id = cd.chapter_id
      join public.modules m on m.id = c.module_id
      where cd.id = stash_items.card_id and m.user_id = (select auth.uid())
    )
  ) with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.cards cd
      join public.chapters c on c.id = cd.chapter_id
      join public.modules m on m.id = c.module_id
      where cd.id = stash_items.card_id and m.user_id = (select auth.uid())
    )
  );
