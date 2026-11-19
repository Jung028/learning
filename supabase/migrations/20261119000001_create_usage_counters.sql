create table public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  day date not null,
  count integer not null default 0,
  primary key (user_id, bucket, day)
);

alter table public.usage_counters enable row level security;

create policy "own usage counters" on public.usage_counters
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Upserts and increments atomically so concurrent requests from the same
-- user can't both read the same count and both slip under the limit.
create or replace function public.increment_usage_counter(p_user_id uuid, p_bucket text, p_day date)
returns integer
language sql
security invoker
set search_path = ''
as $$
  insert into public.usage_counters (user_id, bucket, day, count)
  values (p_user_id, p_bucket, p_day, 1)
  on conflict (user_id, bucket, day)
  do update set count = public.usage_counters.count + 1
  returning count;
$$;

grant execute on function public.increment_usage_counter(uuid, text, date) to authenticated;
