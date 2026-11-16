create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  default_level text not null default 'beginner',
  default_length text not null default 'short',
  text_size text not null default 'medium',
  reminder_time time,
  voice_enabled boolean not null default false,
  streak integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  level text not null,
  length text not null,
  title text,
  summary text,
  status text not null default 'generating',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  "order" integer not null,
  title text not null,
  objectives text,
  state text not null default 'locked'
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  "order" integer not null,
  title text not null,
  body text not null,
  example text
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  stem text not null,
  options jsonb not null,
  correct_index integer not null,
  reason text,
  source_card_id uuid references public.cards(id) on delete set null
);

create table public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  card_index integer not null default 0,
  state text not null default 'reading',
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id, chapter_id)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  answers jsonb not null,
  score numeric not null,
  time_taken_seconds integer,
  created_at timestamptz not null default now()
);

create table public.stash_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  highlight text,
  note text,
  review_due timestamptz,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('card', 'question')),
  target_id uuid not null,
  rating text,
  report_text text,
  created_at timestamptz not null default now()
);
