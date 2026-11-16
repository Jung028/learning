# T-012: Supabase Project, Schema and RLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the SwipeLearn Supabase project with the full data model from the architecture doc, lock every table down with row-level security, and give the Next.js app a typed way to get a Supabase client, so T-013 (sign-in) and the generation pipeline (Phase 2) have a database to write to.

**Architecture:** One new Supabase project holds 10 tables mirroring architecture.md §5's ER diagram (profiles extend `auth.users`; modules/chapters/cards/quizzes/questions nest under a module; progress/attempts/stash_items/feedback hang off a user directly). Every table gets RLS: tables with a direct `user_id` column filter on `user_id = auth.uid()`; tables that nest under a module filter through an `EXISTS` subquery up to the owning module. The app talks to Supabase through two small factory functions (`lib/supabase/client.ts` for the browser, `lib/supabase/server.ts` for Server Components/Route Handlers), both reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the environment.

**Tech Stack:** Supabase (Postgres + Auth), `@supabase/supabase-js`, `@supabase/ssr`, Bun (`bun add`, `bun test` — no npm/yarn/pnpm, no dotenv), Next.js 16 App Router, TypeScript.

**Spec:** [docs/architecture.md §5 Data model](../../architecture.md#5-data-model), [docs/decisions.md ADR-004](../../decisions.md#adr-004-supabase-for-data-and-sign-in)

## Global Constraints

- Row-level security on every table, no exceptions (ADR-004).
- Cached/generated content is copied per user, never shared by reference — no join/sharing table may let two `user_id`s see the same module row (ADR-004, architecture.md §5).
- Use Bun for all installs and tests: `bun add`, `bun test` (user CLAUDE.md). Never `npm`/`yarn`/`pnpm`/`node`.
- Bun auto-loads `.env`; do not add or use `dotenv`.
- This plan creates the `auth.users`-referencing columns only. Sign-in flows (email link, Apple, Google) are T-013 and out of scope here.
- Supabase org to use: `Jung028's Org` (`organization_id: tcxntnzgfnanikdcbytm`) — the only org on the account. Project name: `swipelearn`. Region: `us-east-1`.

## Review Focus

- Cross-user isolation: a second user's `SELECT` against modules/chapters/cards/quizzes/questions/progress/attempts/stash_items/feedback must return zero of the first user's rows, not an error or a partial leak.
- Default-deny for unauthenticated access: the `anon` role has no policy on any of the 10 tables, so an unauthenticated query returns zero rows rather than throwing or leaking row existence.
- Cascading delete on account deletion: removing a user's `auth.users` row must cascade-remove every row that user owns, directly or through a module, across all 9 dependent tables (export/delete is a required feature per ADR-004's consequences).
- Missing environment variables: `getSupabaseBrowserClient()` and `getSupabaseServerClient()` must throw a specific, readable error instead of silently building a client pointed at `undefined`.
- No shared-by-reference caching: the final table set must be exactly the 10 architecture.md entities — no extra sharing/membership table that would let a module be visible to more than one owning user.

---

### Task 1: Provision the Supabase project and capture its credentials

**Files:**
- Create: `.env.example`

**Interfaces:**
- Produces: a live Supabase project (`project_id`), its API URL, and a publishable key, consumed by Task 2/3 (via `project_id`) and Task 4/5 (via the env vars written here).

- [ ] **Step 1: Load the Supabase MCP tools**

Call `ToolSearch` with `select:mcp__claude_ai_Supabase__create_project,mcp__claude_ai_Supabase__get_project,mcp__claude_ai_Supabase__get_project_url,mcp__claude_ai_Supabase__get_publishable_keys,mcp__claude_ai_Supabase__apply_migration,mcp__claude_ai_Supabase__list_tables,mcp__claude_ai_Supabase__get_advisors,mcp__claude_ai_Supabase__execute_sql` if these tools are not already loaded.

- [ ] **Step 2: Create the project**

Call `create_project` with `name: "swipelearn"`, `organization_id: "tcxntnzgfnanikdcbytm"`, `region: "us-east-1"`. If the tool returns a cost-confirmation requirement, follow its instructions to obtain a `confirm_cost_id` and retry — do not ask the human for cost confirmation in chat first, the tool handles it.

- [ ] **Step 3: Wait for the project to become active**

Poll `get_project(project_id)` every ~10s until `status` is `ACTIVE_HEALTHY`. If it reaches `INIT_FAILED` or doesn't become healthy within 5 minutes, stop and report the status rather than continuing.

- [ ] **Step 4: Retrieve the API URL and publishable key**

Call `get_project_url(project_id)` and `get_publishable_keys(project_id)`. Use the modern `sb_publishable_...` key (not a legacy JWT anon key) if both are present and not disabled.

- [ ] **Step 5: Write local env vars**

Write `NEXT_PUBLIC_SUPABASE_URL=<url>` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<key>` to `.env.local` at the repo root (already covered by the `.env*` line in `.gitignore` — do not commit it).

- [ ] **Step 6: Create `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 7: Commit**

```bash
git add .env.example
git commit -m "chore: document required Supabase env vars"
```

---

### Task 2: Core schema migration

**Files:**
- Create: `supabase/migrations/20261115000001_create_core_schema.sql`

**Interfaces:**
- Consumes: `project_id` from Task 1.
- Produces: tables `public.profiles`, `public.modules`, `public.chapters`, `public.cards`, `public.quizzes`, `public.questions`, `public.progress`, `public.attempts`, `public.stash_items`, `public.feedback`, consumed by Task 3's policies and by future generation-pipeline tasks (Phase 2).

- [ ] **Step 1: Write the migration file**

```sql
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
```

- [ ] **Step 2: Apply the migration**

Call `apply_migration(project_id, name: "create_core_schema", query: <file contents from Step 1>)`.

- [ ] **Step 3: Verify the table set**

Call `list_tables(project_id, schemas: ["public"], verbose: true)`. Expected: exactly these 10 tables — `profiles`, `modules`, `chapters`, `cards`, `quizzes`, `questions`, `progress`, `attempts`, `stash_items`, `feedback` — no more, no fewer (confirms no sharing/membership table crept in), each with the columns listed in Step 1.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261115000001_create_core_schema.sql
git commit -m "feat: add core Supabase schema for modules, chapters, cards, quizzes and progress"
```

---

### Task 3: Row-level security and isolation verification

**Files:**
- Create: `supabase/migrations/20261115000002_row_level_security.sql`

**Interfaces:**
- Consumes: tables from Task 2.
- Produces: RLS policies that Task 4/5's client code relies on implicitly (every query the app makes is filtered by these policies, not by app code).

- [ ] **Step 1: Write the RLS migration**

```sql
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
```

- [ ] **Step 2: Apply the migration**

Call `apply_migration(project_id, name: "row_level_security", query: <file contents from Step 1>)`.

- [ ] **Step 3: Check the security advisor**

Call `get_advisors(project_id, type: "security")`. Expected: no "RLS disabled" or "RLS enabled, no policy" warnings for any of the 10 tables.

- [ ] **Step 4: Verify cross-user isolation, default-deny, and cascading delete**

Run via `execute_sql(project_id, ...)`, as one script (clean up at the end regardless of outcome):

```sql
-- seed two throwaway auth users
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data)
values
  (gen_random_uuid(), 'rls-test-a@example.com', crypt('x', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email"}', '{}'),
  (gen_random_uuid(), 'rls-test-b@example.com', crypt('x', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email"}', '{}')
returning id, email;
```

Capture the two returned ids as `user_a` and `user_b`. Then, for each user, insert one module as that user (set `request.jwt.claim.sub` and `role authenticated` before the insert):

```sql
set local role authenticated;
set local request.jwt.claim.sub = '<user_a>';
insert into public.modules (user_id, topic, level, length) values ('<user_a>', 'rls test a', 'beginner', 'short');
```

Repeat for `user_b`. Then, still as `user_a`, `select count(*) from public.modules` — expect `1` (only A's row). Switch `request.jwt.claim.sub` to `user_b` and repeat — expect `1` (only B's row, not A's). Then `set local role anon; reset request.jwt.claim.sub;` and `select count(*) from public.modules` — expect `0`. Finally, `reset role;` and `delete from auth.users where id = '<user_a>'`, then as a superuser `select count(*) from public.modules where user_id = '<user_a>'` — expect `0` (cascade worked), while `user_b`'s module still has count `1`. Clean up by deleting `user_b` too.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261115000002_row_level_security.sql
git commit -m "feat: lock every Supabase table down with row-level security"
```

---

### Task 4: Browser Supabase client

**Files:**
- Create: `lib/supabase/client.ts`
- Test: `lib/supabase/client.test.ts`

**Interfaces:**
- Produces: `getSupabaseBrowserClient(): SupabaseClient` — throws `new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")` if either `process.env.NEXT_PUBLIC_SUPABASE_URL` or `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is missing; otherwise returns a `createBrowserClient` instance from `@supabase/ssr`. Consumed by client components in later phases.

- [ ] **Step 1: Install dependencies**

```bash
bun add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Write the failing test**

```ts
import { afterEach, beforeEach, expect, test } from "bun:test";
import { getSupabaseBrowserClient } from "./client";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test("throws when env vars are missing", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  expect(() => getSupabaseBrowserClient()).toThrow(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
});

test("returns a client when env vars are present", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  const client = getSupabaseBrowserClient();
  expect(typeof client.auth.getSession).toBe("function");
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun test lib/supabase/client.test.ts`
Expected: FAIL — `client.ts` does not exist yet.

- [ ] **Step 4: Implement `getSupabaseBrowserClient()` in `lib/supabase/client.ts`**

Use `createBrowserClient` from `@supabase/ssr`, reading the two env vars named above, throwing the exact error string from Step 2 when either is falsy.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun test lib/supabase/client.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/client.test.ts package.json bun.lock
git commit -m "feat: add browser Supabase client factory"
```

---

### Task 5: Server Supabase client, and marking T-012 done

**Files:**
- Create: `lib/supabase/server.ts`
- Test: `lib/supabase/server.test.ts`
- Modify: `docs/tasks.md:20` (check off T-012)

**Interfaces:**
- Consumes: nothing from Task 4 (independent factory, same env vars).
- Produces: `getSupabaseServerClient(cookieStore: { getAll(): { name: string; value: string }[]; setAll(cookies: { name: string; value: string; options?: object }[]): void }): SupabaseClient` — same missing-env-var error as Task 4's function. Callers in Route Handlers/Server Components pass `await cookies()` from `next/headers`. Consumed by server-side data access in later phases (Phase 2 onward).

- [ ] **Step 1: Write the failing test**

```ts
import { afterEach, beforeEach, expect, test } from "bun:test";
import { getSupabaseServerClient } from "./server";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

const fakeCookieStore = { getAll: () => [], setAll: () => {} };

test("throws when env vars are missing", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  expect(() => getSupabaseServerClient(fakeCookieStore)).toThrow(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
});

test("returns a client when env vars are present", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  const client = getSupabaseServerClient(fakeCookieStore);
  expect(typeof client.auth.getUser).toBe("function");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test lib/supabase/server.test.ts`
Expected: FAIL — `server.ts` does not exist yet.

- [ ] **Step 3: Implement `getSupabaseServerClient()` in `lib/supabase/server.ts`**

Use `createServerClient` from `@supabase/ssr`, passing `{ cookies: cookieStore }` (the `getAll`/`setAll` shape matches `@supabase/ssr`'s `CookieMethodsServer`), reading the same two env vars, throwing the same error string as Task 4 when either is falsy.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test lib/supabase/server.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Check off T-012**

In `docs/tasks.md`, change line 20 from `- [ ] T-012 Set up Supabase project, tables and row-level security (ADR-004)` to `- [x] T-012 Set up Supabase project, tables and row-level security (ADR-004)`.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/server.test.ts docs/tasks.md
git commit -m "feat: add server Supabase client factory; mark T-012 done"
```
