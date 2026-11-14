# Task 8 Report: BottomTabBar

## Status: DONE

## What was done

Followed the brief's TDD steps exactly:

1. Wrote `components/ui/BottomTabBar.test.tsx` verbatim from the brief (3 tests: link hrefs, active tab gets `aria-current="page"`, inactive tabs have no `aria-current` attribute at all).
2. Ran `bun test components/ui/BottomTabBar.test.tsx` — confirmed it failed with "Cannot find module './BottomTabBar'" (module didn't exist yet).
3. Implemented `components/ui/BottomTabBar.tsx`:
   - `BottomTabBar({ tabs, activeKey })` exported function.
   - `<nav>` with a 4-column grid (`grid grid-cols-4`), `bg-foam border border-crema rounded-card p-2 shadow-sm` container.
   - One `next/link` `Link` per tab, each rendering a 22×22px icon slot above a 12px (`text-xs`) label, stacked vertically.
   - Active tab (`tab.key === activeKey`): `aria-current="page"`, `text-mocha font-semibold`.
   - Inactive tabs: `aria-current={undefined}` (so React omits the attribute entirely — not `"false"`), `text-muted font-medium`.
4. Ran `bun test components/ui/BottomTabBar.test.tsx` — all 3 tests passed.
5. Committed: `a165b9e feat: add BottomTabBar component`.

## Verification

- `bun test components/ui/BottomTabBar.test.tsx` — 3 pass, 0 fail.
- Full suite `bun test` — 51 pass, 0 fail, across 8 files (all prior components still green).
- `bunx tsc --noEmit` — no errors.

## Deviations / notes

- The brief's visual reference (design/Main.dc.html line 104) uses `rounded-24px` for the bar container; I used the existing Tailwind token `rounded-card` (which is defined as `24px` in `app/globals.css`'s `@theme`), per the instruction to use existing tokens rather than inventing new values. This matches the visual spec exactly while staying within the token system.
- Used `aria-current={isActive ? "page" : undefined}` — React drops the attribute entirely when the value is `undefined`, which is what makes `not.toHaveAttribute("aria-current")` pass on inactive tabs. This was the key Review Focus item called out in the task context, and it's verified correct by the passing test.
- No files touched outside the two specified (`components/ui/BottomTabBar.tsx`, `components/ui/BottomTabBar.test.tsx`).
- No subagents were dispatched; all work done directly in this session.

## Files changed

- `/Users/adam/VSCodeProjects/learning/.claude/worktrees/foundation-design-system/components/ui/BottomTabBar.tsx` (new)
- `/Users/adam/VSCodeProjects/learning/.claude/worktrees/foundation-design-system/components/ui/BottomTabBar.test.tsx` (new)

## Fix report: shadow matched to design spec

**Finding:** `shadow-sm` on the tab bar container did not match the design spec's exact shadow.

**Change:** Replaced `shadow-sm` with `shadow-[0_2px_12px_rgba(43,26,18,0.07)]` in `components/ui/BottomTabBar.tsx`, the same arbitrary-value approach `components/ui/Button.tsx` uses for its spec shadow. Nothing else changed.

**Verification:**
- `bun test components/ui/BottomTabBar.test.tsx` — 3 pass, 0 fail.
- `bun test` (full suite) — 51 pass, 0 fail, across 8 files.
- `bunx tsc --noEmit` — clean.
