# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read this file first, every session, before writing any code.** It points to the documents that hold the real decisions and the real backlog — read those too before starting work, and update them (not just this file) as work completes.

## What this repo is

SwipeLearn (working name): learn any topic by swiping through a short, Claude-written course of swipeable cards, with a 5-question quiz after every chapter. Full product description: [README.md](README.md).

**Status as of 2026-11-14: planning and design are done. No application code exists yet.** This repo currently holds only product docs (`docs/`) and a static design prototype (`design/`). The first app code (Next.js scaffold) has not been created.

## Source of truth — read before deciding anything

Don't re-derive these from scratch or guess; they're already decided:

| Question | Read |
| --- | --- |
| What are we building, for whom, with what requirements? | [docs/system-analysis.md](docs/system-analysis.md) — actors, use cases, FR-1 to FR-31, NFRs, screens, state machines |
| Why did we choose this stack / this design? | [docs/decisions.md](docs/decisions.md) — ADR-001 to ADR-019, each with rejected alternatives. Status column matters: **Accepted** is binding, **Proposed** needs sign-off before relying on it, **Open** is not decided |
| How do the pieces fit together? | [docs/architecture.md](docs/architecture.md) — components, request flow, generation pipeline, data model, cost/perf targets |
| What's done, what's next? | [docs/tasks.md](docs/tasks.md) — phased backlog, task IDs (`T-nnn`) traced to requirement IDs (`FR-n`) and ADRs. **Checkboxes are the real status — check it before claiming something is or isn't built, and tick items off as you finish them.** |
| What does every screen look like? | `design/*.dc.html` — 17 phone screens (390×844) + 9 desktop screens (1280×800, `Desktop-*.dc.html`), plus `design/Main.dc.html` for the design system (exact colors, type, spacing, button specs) and the full button → destination map |

Still genuinely open (don't invent answers; ask or flag): final app name/domain, hard vs. soft quiz gate (ADR-012), speech provider (ADR-015), free-tier limits and Plus price (ADR-018), background job runner (ADR-009).

## Planned stack (not yet scaffolded)

Next.js + React + TypeScript + Tailwind CSS, server routes on Vercel, Supabase (Postgres/Auth/RLS), Claude API called server-side only with structured JSON output, PostHog analytics, Stripe later. Reasons and rejected alternatives for each are in `decisions.md` (ADR-001 through ADR-006).

Per `~/.claude/CLAUDE.md` (user-global): use **Bun**, not Node/npm, for everything once the app exists — `bun install`, `bun run dev`, `bun test`, `bunx <pkg>`. This repo has no `package.json` yet; once one exists, this section should be replaced with the actual commands (`bun run dev`, `bun test`, `bun run build`, etc.) read from it, not guessed.

## Non-negotiable constraints carried from the docs

These come up in nearly every task, so they're repeated here instead of re-read every time — but `decisions.md` is still the authority if this summary and that file ever disagree:

- Claude is called **only from server routes** — the API key never reaches the browser (ADR-006).
- Every Claude call has a JSON schema; invalid output is retried once, then shown as a retry button — **never a half-built chapter** (ADR-006, architecture.md §4).
- Quiz questions are generated **only from that chapter's own cards**, never from unseen material (ADR-011).
- Generate-ahead: write the outline + chapters 1–2 up front, write the next two at each chapter-start checkpoint, keep the rest locked (ADR-008).
- Row-level security on every Supabase table; cached module content is copied per user, never shared by reference (ADR-004, ADR-010).
- Accessibility is WCAG 2.1 AA: no gesture-only controls, 4.5:1 contrast, right/wrong answers always carry an icon **and** a word, never color alone (system-analysis.md §5, design/Main.dc.html §1).
- Design tokens (coffee palette, Fraunces/Inter, 52px pill buttons, 44px min touch targets) come from `design/Main.dc.html` — match it exactly, don't eyeball colors from screenshots.

## Working here

- `docs/tasks.md` is the backlog **and** the project's memory of what's been done — tick a box the moment its task is actually finished, not before.
- If a decision in `decisions.md` is `Proposed` or `Open` and a task needs it resolved, surface that rather than quietly picking an answer.
- When a plan or phase of work is committed to, it should still live under `docs/tasks.md`'s phase structure (Phase 1: foundation, Phase 2: generation, etc.) — don't invent a parallel backlog.
