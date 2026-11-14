# Foundation: Project Scaffold and Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js app and implement the coffee-palette design system (colors, fonts, shape/spacing, and the shared button/chip/toggle/card/progress/tab-bar/sheet components) as real, tested code, matching `design/Main.dc.html` exactly.

**Architecture:** A single Next.js (App Router) project at the repo root, Tailwind CSS v4 theming the design tokens via a `@theme` block in `app/globals.css`, and a `components/ui/` folder of small, independent presentational components, each with its own `bun test` suite using `@testing-library/react` over `happy-dom`. No backend, no Supabase, no deploy yet — this plan only covers tasks T-010 and T-011 from `docs/tasks.md`.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS v4, Bun (package manager, runner, test runner), `@testing-library/react` + `@testing-library/jest-dom` + `happy-dom` for component tests.

**Spec:** `docs/system-analysis.md`, `docs/architecture.md`, `docs/decisions.md` (ADR-001, ADR-002), `design/Main.dc.html` (design system board — exact colors, type, shape, button specs), `docs/tasks.md` (T-010, T-011).

**Out of scope for this plan:** `docs/tasks.md` T-012 (Supabase project/RLS), T-013 (sign-in), T-014 (Vercel deploy), T-015 (PostHog) all need an external account the AI cannot create — a Supabase project, a Vercel project, Google/Apple OAuth app registrations, a PostHog project. Once those exist, write a follow-up plan for the rest of Phase 1. T-016 (server route wrapper) is code-only but depends on the auth shape T-013 settles, so it waits too.

## Global Constraints

- Package manager and runtime: **Bun only** — `bun install`, `bun run <script>`, `bun test`, `bunx <pkg>`. Never `npm`/`yarn`/`pnpm`/`node`/`ts-node`.
- Stack: Next.js (App Router), React, TypeScript, Tailwind CSS (ADR-002).
- Design tokens — exact hex values, from `design/Main.dc.html` §1: latte `#F5EDE3`, foam `#FFFBF6`, ink `#2B1A12`, ink-hover `#4A2E1E`, muted `#6F5A4C`, mocha `#6F4630`, cappuccino `#EADBC8`, caramel `#C98B4B`, crema `#E0D2C0`, matcha `#3F6B3A`, matcha-soft `#E5EFDD`, cherry `#A23B2A`, cherry-soft `#F8E3DD`.
- Fonts, from `design/Main.dc.html` §2: Fraunces 600/700 for display/titles, Inter 400/500/600 for body/buttons/captions.
- Shape, from `design/Main.dc.html` §3–4: buttons/inputs height 52px, pill radius `999px`; cards radius `24px`, swipe card radius `32px`; quiz-option radius `14px`; chapter-row radius `16px`; chips/badges height 40px, fully round; icon buttons 44×44; touch targets ≥44px.
- Accessibility, from `docs/system-analysis.md` §5 and `design/Main.dc.html` button notes: every icon-only control needs an accessible label; no control may rely on color alone to convey state; no gesture-only interaction.
- Test runner, decided in Task 1 and binding on every later task: `bun test` with `happy-dom` (DOM) + `@testing-library/react` + `@testing-library/jest-dom` (assertions).

## Review Focus

- IconButton must get a real, specific `aria-label` for its action, not a generic fallback — a screen reader user otherwise hears "button" and nothing else (design/Main.dc.html icon-button spec). Test owned by Task 3.
- Toggle must be keyboard-operable by being a genuine `<button role="switch">`, not a styled `<div>` — "no gesture-only controls" (system-analysis.md §5). Test owned by Task 5.
- BottomSheet must close on Escape and on backdrop click, and return focus to whatever opened it, or a keyboard user gets stranded inside it. Test owned by Task 9.
- Chip's selected state must be exposed through `aria-pressed`, not only a border/background color change — "never shown by colour alone" (design/Main.dc.html §1) applied to selection, not just correctness. Test owned by Task 4.
- BottomTabBar's active tab must be exposed through `aria-current="page"`, not only a color change, for the same reason. Test owned by Task 8.

---

## File Structure

```
package.json, tsconfig.json, next.config.ts, eslint.config.mjs, postcss.config.mjs   (create-next-app output)
bunfig.toml                      test preload config
test/setup.ts                    happy-dom + jest-dom registration, RTL cleanup
app/layout.tsx                   root layout, loads fonts, applies them to <body>
app/fonts.ts                     next/font/google loaders: fraunces, inter
app/page.tsx                     minimal placeholder home ("SwipeLearn")
app/page.test.tsx                smoke test for the placeholder
app/globals.css                  Tailwind import + @theme design tokens
app/globals.css.test.ts          string assertions on the token values
app/design-system/page.tsx       showcase page assembling every component
app/design-system/page.test.tsx  smoke test for the showcase page
components/ui/Button.tsx         Button + IconButton
components/ui/Button.test.tsx
components/ui/Chip.tsx
components/ui/Chip.test.tsx
components/ui/Toggle.tsx
components/ui/Toggle.test.tsx
components/ui/Card.tsx
components/ui/Card.test.tsx
components/ui/ProgressBar.tsx
components/ui/ProgressBar.test.tsx
components/ui/BottomTabBar.tsx
components/ui/BottomTabBar.test.tsx
components/ui/BottomSheet.tsx
components/ui/BottomSheet.test.tsx
```

---

### Task 1: Project scaffold and test infrastructure

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `public/*` (all via `create-next-app`)
- Modify: `app/page.tsx` (overwrite the generated placeholder with our own minimal one)
- Create: `bunfig.toml`, `test/setup.ts`, `app/page.test.tsx`

**Interfaces:**
- Produces: a working `bun test` pipeline (happy-dom + Testing Library) that every later task's `*.test.tsx` relies on without repeating setup.

- [ ] **Step 1: Scaffold the Next.js app at the repo root**

Run: `bunx create-next-app@latest . --ts --tailwind --app --eslint --use-bun --import-alias "@/*" --yes --disable-git`

This repo is already a git repo with `docs/`, `design/`, `README.md`, `LICENSE` present — `--disable-git` stops it from trying to re-init git; it only writes Next.js's own files (`package.json`, `app/`, `public/`, configs) and leaves the rest alone.

- [ ] **Step 2: Replace the generated placeholder home page**

In `app/page.tsx`:

```tsx
export default function Home() {
  return <main>SwipeLearn</main>;
}
```

- [ ] **Step 3: Add test dependencies**

Run: `bun add -d happy-dom @testing-library/react @testing-library/jest-dom @testing-library/dom`

- [ ] **Step 4: Configure Bun's test preload**

Create `bunfig.toml`:

```toml
[test]
preload = ["./test/setup.ts"]
```

- [ ] **Step 5: Write the test setup file**

Create `test/setup.ts`:

```ts
import { GlobalRegistrator } from "happy-dom";
GlobalRegistrator.register();

import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 6: Write the failing smoke test**

Create `app/page.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  test("renders the placeholder", () => {
    render(<Home />);
    expect(screen.getByText("SwipeLearn")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test**

Run: `bun test app/page.test.tsx`
Expected: PASS (Step 2 already wrote the real implementation; this step confirms the whole pipeline — happy-dom, Testing Library, Bun's JSX transform — actually works end to end).

- [ ] **Step 8: Verify the production build compiles**

Run: `bun run build`
Expected: build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 9: Commit**

```bash
git add package.json bun.lock tsconfig.json next.config.ts eslint.config.mjs postcss.config.mjs bunfig.toml test/ app/ public/ .gitignore
git commit -m "chore: scaffold Next.js app with Bun test infrastructure"
```

---

### Task 2: Design tokens as the Tailwind theme

**Files:**
- Modify: `app/globals.css`
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`
- Create: `app/globals.css.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (every later component task consumes these exact Tailwind class names, generated by Tailwind v4 from the `@theme` tokens below): colors `bg-latte`, `bg-foam`, `text-ink`, `text-ink-hover`, `text-muted`, `bg-mocha`, `text-mocha`, `border-mocha`, `bg-cappuccino`, `bg-caramel`, `border-crema`, `bg-crema`, `bg-matcha`, `bg-matcha-soft`, `text-matcha`, `bg-cherry`, `bg-cherry-soft`, `text-cherry`, `border-cherry`; radii `rounded-pill`, `rounded-card`, `rounded-card-lg`, `rounded-option`, `rounded-row`; fonts `font-display`, `font-sans`.

- [ ] **Step 1: Write the failing token test**

Create `app/globals.css.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

const css = await Bun.file("app/globals.css").text();

const tokens: Record<string, string> = {
  "--color-latte": "#F5EDE3",
  "--color-foam": "#FFFBF6",
  "--color-ink": "#2B1A12",
  "--color-ink-hover": "#4A2E1E",
  "--color-muted": "#6F5A4C",
  "--color-mocha": "#6F4630",
  "--color-cappuccino": "#EADBC8",
  "--color-caramel": "#C98B4B",
  "--color-crema": "#E0D2C0",
  "--color-matcha": "#3F6B3A",
  "--color-matcha-soft": "#E5EFDD",
  "--color-cherry": "#A23B2A",
  "--color-cherry-soft": "#F8E3DD",
  "--radius-pill": "999px",
  "--radius-card": "24px",
  "--radius-card-lg": "32px",
  "--radius-option": "14px",
  "--radius-row": "16px",
};

describe("design tokens in app/globals.css", () => {
  for (const [name, value] of Object.entries(tokens)) {
    test(`${name} is ${value}`, () => {
      expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
    });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test app/globals.css.test.ts`
Expected: FAIL (tokens not yet in the file)

- [ ] **Step 3: Write the font loaders**

Create `app/fonts.ts`:

```ts
import { Fraunces, Inter } from "next/font/google";

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
```

- [ ] **Step 4: Write the theme into `app/globals.css`**

Replace the Tailwind-generated content with:

```css
@import "tailwindcss";

@theme {
  --color-latte: #F5EDE3;
  --color-foam: #FFFBF6;
  --color-ink: #2B1A12;
  --color-ink-hover: #4A2E1E;
  --color-muted: #6F5A4C;
  --color-mocha: #6F4630;
  --color-cappuccino: #EADBC8;
  --color-caramel: #C98B4B;
  --color-crema: #E0D2C0;
  --color-matcha: #3F6B3A;
  --color-matcha-soft: #E5EFDD;
  --color-cherry: #A23B2A;
  --color-cherry-soft: #F8E3DD;

  --radius-pill: 999px;
  --radius-card: 24px;
  --radius-card-lg: 32px;
  --radius-option: 14px;
  --radius-row: 16px;

  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}

body {
  background: var(--color-latte);
  color: var(--color-ink);
}
```

- [ ] **Step 5: Apply the fonts in the root layout**

In `app/layout.tsx`, import `fraunces, inter` from `./fonts` and apply `` `${fraunces.variable} ${inter.variable} font-sans` `` as the `<body>` `className`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `bun test app/globals.css.test.ts`
Expected: PASS

- [ ] **Step 7: Run the full suite and the build**

Run: `bun test && bun run build`
Expected: all PASS, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css app/fonts.ts app/layout.tsx app/globals.css.test.ts
git commit -m "feat: wire the coffee-palette design tokens into the Tailwind theme"
```

---

### Task 3: Button and IconButton

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-mocha`, `bg-cappuccino`, `text-mocha`, `text-ink-hover`, `border-cherry`, `text-cherry`, `rounded-pill`).
- Produces: `Button({ variant?: "primary" | "secondary" | "text" | "danger"; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void; children: React.ReactNode }): JSX.Element` (default `variant` `"primary"`, default `type` `"button"`) and `IconButton({ label: string; icon: React.ReactNode; onClick?: () => void }): JSX.Element`, both exported from `components/ui/Button.tsx`. Also installs `@testing-library/user-event` as a project devDependency — this task is the first to need it, and Tasks 4, 5, and 9 reuse it afterward without reinstalling.

- [ ] **Step 1: Install the shared `user-event` dependency**

Run: `bun add -d @testing-library/user-event`

- [ ] **Step 2: Write the failing tests**

Create `components/ui/Button.test.tsx`:

```tsx
import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, IconButton } from "./Button";

describe("Button", () => {
  test("renders its children", () => {
    render(<Button>New module</Button>);
    expect(screen.getByText("New module")).toBeInTheDocument();
  });

  test("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>New module</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  test.each([
    ["primary", "bg-mocha"],
    ["secondary", "bg-cappuccino"],
    ["text", "text-mocha"],
    ["danger", "border-cherry"],
  ])("variant=%s gets class %s", (variant, className) => {
    render(<Button variant={variant as any}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(className);
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("is a 52px pill", () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-[52px]");
    expect(button).toHaveClass("rounded-pill");
  });
});

describe("IconButton", () => {
  test("exposes the given label to assistive tech", () => {
    render(<IconButton label="Save card" icon={<span />} />);
    expect(screen.getByLabelText("Save card")).toBeInTheDocument();
  });

  test("is a 44x44 touch target", () => {
    render(<IconButton label="Close" icon={<span />} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-11");
    expect(button).toHaveClass("h-11");
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<IconButton label="Close" icon={<span />} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun test components/ui/Button.test.tsx`
Expected: FAIL (module does not exist)

- [ ] **Step 4: Implement `Button` and `IconButton` in `components/ui/Button.tsx`**

One line on the approach: a single internal `variantClasses` map keyed by `variant`, merged with the fixed `h-[52px] rounded-pill font-sans font-semibold` base classes; `IconButton` is a second, smaller component in the same file sharing no code with `Button` beyond the file (different fixed size/shape), with `label` passed straight through to `aria-label`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test components/ui/Button.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock components/ui/Button.tsx components/ui/Button.test.tsx
git commit -m "feat: add Button and IconButton components"
```

---

### Task 4: Chip

**Files:**
- Create: `components/ui/Chip.tsx`
- Create: `components/ui/Chip.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-foam`, `bg-cappuccino`, `border-mocha`, `border-crema`, `rounded-pill`).
- Produces: `Chip({ label: string; selected?: boolean; onClick?: () => void }): JSX.Element`.

- [ ] **Step 1: Write the failing tests**

Create `components/ui/Chip.test.tsx`:

```tsx
import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip", () => {
  test("renders its label", () => {
    render(<Chip label="Beginner" />);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  test("defaults to unselected: aria-pressed=false, unselected styling", () => {
    render(<Chip label="Beginner" />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveClass("bg-foam");
  });

  test("selected: aria-pressed=true, selected styling", () => {
    render(<Chip label="Intermediate" selected />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveClass("bg-cappuccino");
  });

  test("calls onClick when clicked", async () => {
    const onClick = mock();
    render(<Chip label="Beginner" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("is a 40px pill", () => {
    render(<Chip label="Beginner" />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveClass("h-10");
    expect(chip).toHaveClass("rounded-pill");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/Chip.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `Chip` in `components/ui/Chip.tsx`**

A real `<button type="button" aria-pressed={!!selected}>`; selected → `bg-cappuccino border-2 border-mocha font-semibold`, unselected → `bg-foam border border-crema font-medium`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/Chip.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/Chip.tsx components/ui/Chip.test.tsx
git commit -m "feat: add Chip component"
```

---

### Task 5: Toggle

**Files:**
- Create: `components/ui/Toggle.tsx`
- Create: `components/ui/Toggle.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-mocha`, `bg-foam`).
- Produces: `Toggle({ checked: boolean; onChange: (next: boolean) => void; label: string }): JSX.Element`.

- [ ] **Step 1: Write the failing tests**

Create `components/ui/Toggle.test.tsx`:

```tsx
import { describe, expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  test("is a real <button> with role=switch, so Enter/Space work natively", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Daily reminder" />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl.tagName).toBe("BUTTON");
  });

  test("reflects checked via aria-checked", () => {
    render(<Toggle checked={true} onChange={() => {}} label="Daily reminder" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  test("exposes the label to assistive tech", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Daily reminder" />);
    expect(screen.getByLabelText("Daily reminder")).toBeInTheDocument();
  });

  test("calls onChange with the inverted value when clicked", async () => {
    const onChange = mock();
    render(<Toggle checked={false} onChange={onChange} label="Daily reminder" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/Toggle.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `Toggle` in `components/ui/Toggle.tsx`**

`<button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}>` with an inner thumb `<span>`; track `bg-mocha` when checked, a muted background when unchecked, thumb always `bg-foam`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/Toggle.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/Toggle.tsx components/ui/Toggle.test.tsx
git commit -m "feat: add Toggle component"
```

---

### Task 6: Card

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Card.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-foam`, `border-crema`, `rounded-card`, `rounded-card-lg`).
- Produces: `Card({ children: React.ReactNode; variant?: "default" | "swipe"; className?: string }): JSX.Element` (default `variant` `"default"`).

- [ ] **Step 1: Write the failing tests**

Create `components/ui/Card.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  test("renders its children", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("default variant uses 24px radius", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("rounded-card");
  });

  test("swipe variant uses 32px radius", () => {
    render(<Card variant="swipe">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("rounded-card-lg");
  });

  test("merges a caller-supplied className", () => {
    render(<Card className="mt-4">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("mt-4");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/Card.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `Card` in `components/ui/Card.tsx`**

A `<div>` with base classes `bg-foam border border-crema p-6`, radius class picked by `variant` (`rounded-card` / `rounded-card-lg`), caller's `className` appended last so it can override.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/Card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/Card.tsx components/ui/Card.test.tsx
git commit -m "feat: add Card component"
```

---

### Task 7: ProgressBar

**Files:**
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/ProgressBar.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-crema`, `bg-mocha`, `rounded-pill`).
- Produces: `ProgressBar({ value: number; max: number; label?: string }): JSX.Element`.

- [ ] **Step 1: Write the failing tests**

Create `components/ui/ProgressBar.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  test("exposes progressbar semantics", () => {
    render(<ProgressBar value={3} max={5} label="Card 3 of 5" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-label", "Card 3 of 5");
  });

  test("fills proportionally to value/max", () => {
    render(<ProgressBar value={3} max={5} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("60%");
  });

  test("clamps the fill at 100% when value exceeds max", () => {
    render(<ProgressBar value={9} max={5} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/ProgressBar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `ProgressBar` in `components/ui/ProgressBar.tsx`**

Outer `<div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>` with class `h-2 rounded-pill bg-crema`, inner fill `<div>` with class `h-2 rounded-pill bg-mocha` and inline `style={{ width: \`${Math.min(100, (value / max) * 100)}%\` }}`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/ProgressBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/ProgressBar.tsx components/ui/ProgressBar.test.tsx
git commit -m "feat: add ProgressBar component"
```

---

### Task 8: BottomTabBar

**Files:**
- Create: `components/ui/BottomTabBar.tsx`
- Create: `components/ui/BottomTabBar.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-foam`, `border-crema`, `text-mocha`, `text-muted`); `Link` from `next/link`.
- Produces: `BottomTabBar({ tabs: Array<{ key: string; label: string; icon: React.ReactNode; href: string }>; activeKey: string }): JSX.Element`.

- [ ] **Step 1: Write the failing tests**

Create `components/ui/BottomTabBar.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { BottomTabBar } from "./BottomTabBar";

const tabs = [
  { key: "home", label: "Home", icon: <span />, href: "/" },
  { key: "library", label: "Library", icon: <span />, href: "/library" },
  { key: "stash", label: "Stash", icon: <span />, href: "/stash" },
  { key: "you", label: "You", icon: <span />, href: "/settings" },
];

describe("BottomTabBar", () => {
  test("renders a link per tab with the correct href", () => {
    render(<BottomTabBar tabs={tabs} activeKey="home" />);
    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Library/ })).toHaveAttribute("href", "/library");
  });

  test("marks the active tab with aria-current=page", () => {
    render(<BottomTabBar tabs={tabs} activeKey="library" />);
    expect(screen.getByRole("link", { name: /Library/ })).toHaveAttribute("aria-current", "page");
  });

  test("does not mark inactive tabs with aria-current", () => {
    render(<BottomTabBar tabs={tabs} activeKey="library" />);
    expect(screen.getByRole("link", { name: /Home/ })).not.toHaveAttribute("aria-current");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/BottomTabBar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `BottomTabBar` in `components/ui/BottomTabBar.tsx`**

A `<nav>` containing one `next/link` `Link` per tab in a 4-column grid; the tab whose `key === activeKey` gets `aria-current="page"` and `text-mocha font-semibold`, the rest get `text-muted font-medium` and no `aria-current` attribute at all (not `aria-current="false"` — its absence is the signal `toHaveAttribute`/`not.toHaveAttribute` checks).

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/BottomTabBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/BottomTabBar.tsx components/ui/BottomTabBar.test.tsx
git commit -m "feat: add BottomTabBar component"
```

---

### Task 9: BottomSheet

**Files:**
- Create: `components/ui/BottomSheet.tsx`
- Create: `components/ui/BottomSheet.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes from Task 2 (`bg-foam`, `rounded-card`).
- Produces: `BottomSheet({ open: boolean; onClose: () => void; title?: string; children: React.ReactNode }): JSX.Element | null`.

- [ ] **Step 1: Write the failing tests**

Create `components/ui/BottomSheet.test.tsx`:

```tsx
import { describe, expect, test, mock } from "bun:test";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet", () => {
  test("renders nothing when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("renders title and children when open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("clicking the backdrop calls onClose", async () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    await userEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking inside the panel does not call onClose", async () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    await userEvent.click(screen.getByText("Content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("pressing Escape calls onClose", () => {
    const onClose = mock();
    render(
      <BottomSheet open={true} onClose={onClose} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("moves focus into the panel on open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Ask Claude">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  test("restores focus to the trigger on close", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>Open</button>
          <BottomSheet open={open} onClose={() => setOpen(false)} title="Ask Claude">
            Content
          </BottomSheet>
        </div>
      );
    }
    render(<Harness />);
    const trigger = screen.getByText("Open");
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test components/ui/BottomSheet.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `BottomSheet` in `components/ui/BottomSheet.tsx`**

Return `null` when `!open`. Otherwise render a backdrop `<div data-testid="bottom-sheet-backdrop" onClick={onClose}>` containing a panel `<div role="dialog" aria-modal="true" aria-label={title} className="bg-foam rounded-t-card" onClick={(e) => e.stopPropagation()}>`. Two `useEffect`s: one registers/unregisters a `document` `keydown` listener for `"Escape"` calling `onClose` while `open`; the other, on the transition into `open`, stores `document.activeElement` in a `ref` and focuses the panel (`tabIndex={-1}` plus `.focus()` in the effect), and on the transition out of `open`, calls `.focus()` on the stored element.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test components/ui/BottomSheet.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/BottomSheet.tsx components/ui/BottomSheet.test.tsx
git commit -m "feat: add BottomSheet component"
```

---

### Task 10: Design-system showcase page and visual verification

**Files:**
- Create: `app/design-system/page.tsx`
- Create: `app/design-system/page.test.tsx`

**Interfaces:**
- Consumes: every component from Tasks 3–9 (`Button`, `IconButton`, `Chip`, `Toggle`, `Card`, `ProgressBar`, `BottomTabBar`, `BottomSheet`).
- Produces: a page at `/design-system` with no consumers of its own — this is the terminal task of the plan.

- [ ] **Step 1: Write the failing smoke test**

Create `app/design-system/page.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import DesignSystemPage from "./page";

describe("design system showcase page", () => {
  test("renders without throwing and shows the primary button", () => {
    render(<DesignSystemPage />);
    expect(screen.getByText("New module")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test app/design-system/page.test.tsx`
Expected: FAIL (page does not exist)

- [ ] **Step 3: Build the showcase page in `app/design-system/page.tsx`**

A client component (`"use client"`, since it needs `useState` for the toggle, chip selection, and sheet) laying out, section by section: all four `Button` variants plus one `IconButton`; two `Chip`s (one `selected`, one not) wired to toggle each other's `selected` state on click; one `Toggle` wired to its own `useState`; one default `Card` and one `swipe`-variant `Card`; one `ProgressBar` at `value=3 max=5`; one `BottomTabBar` with the four tabs `Home`/`Library`/`Stash`/`You`; a `Button` labeled `"Ask Claude"` that opens a `BottomSheet` containing placeholder text, wired to its own `useState`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test app/design-system/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the whole suite and the build**

Run: `bun test && bun run build`
Expected: all PASS, build succeeds.

- [ ] **Step 6: Visually verify in the browser**

Run `bun run dev` in the background, then use the Chrome browser tool to open `http://localhost:3000/design-system` and confirm, against `design/Main.dc.html`: the latte background and milk-foam cards render with the right warmth (not a generic off-white), the primary button is mocha-brown with foam text, Fraunces renders on any heading-sized text and Inter everywhere else, all buttons/chips are true pills, clicking a chip visibly toggles its selected state, clicking the toggle flips it, and clicking "Ask Claude" opens the bottom sheet from the bottom of the viewport and Escape closes it. Stop the dev server afterward.

- [ ] **Step 7: Commit**

```bash
git add app/design-system/page.tsx app/design-system/page.test.tsx
git commit -m "feat: add design-system showcase page"
```
