alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.chapters enable row level security;
alter table public.cards enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.progress enable row level security;
alter table public.attempts enable row level security;
alter table public.stash_items enable row level security;
alter table public.feedback enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own modules" on public.modules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own progress" on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own attempts" on public.attempts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own stash items" on public.stash_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own feedback" on public.feedback
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own chapters" on public.chapters
  for all using (
    exists (
      select 1 from public.modules m
      where m.id = chapters.module_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.modules m
      where m.id = chapters.module_id and m.user_id = auth.uid()
    )
  );

create policy "own cards" on public.cards
  for all using (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = cards.chapter_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = cards.chapter_id and m.user_id = auth.uid()
    )
  );

create policy "own quizzes" on public.quizzes
  for all using (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = quizzes.chapter_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.chapters c join public.modules m on m.id = c.module_id
      where c.id = quizzes.chapter_id and m.user_id = auth.uid()
    )
  );

create policy "own questions" on public.questions
  for all using (
    exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = questions.quiz_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.quizzes q
      join public.chapters c on c.id = q.chapter_id
      join public.modules m on m.id = c.module_id
      where q.id = questions.quiz_id and m.user_id = auth.uid()
    )
  );
