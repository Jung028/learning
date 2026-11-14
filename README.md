# SwipeLearn (working name)

Learn any topic by swiping. Type what you want to learn, and Claude writes a short course you read as swipeable cards. Every chapter ends with a 5-question quiz on what you just read.

Think Deepstash, but the library is whatever you ask for.

> Status: planning and design. No application code yet. This repo holds the product, architecture and design documentation.

## What it does

- **Create a module.** Type any topic, pick a level and length, review the outline, then start.
- **Swipe to read.** One idea per card. Swipe up for the next card, down to go back.
- **Quiz after every chapter.** Five multiple-choice questions written from that chapter only, with a reason for each answer.
- **Resume anywhere.** "Continue" takes you to the exact card you stopped on, on any device.
- **Stay ahead cheaply.** Chapter titles show up front. Content is written one step ahead of you and locked until you get there.
- **Go deeper.** Ask Claude to explain simpler or give an example, save cards to your Stash, review missed questions daily, talk a chapter through with a hold-to-speak discussion, and drill flashcards.

## Documents

| Document | What it covers |
| --- | --- |
| [docs/system-analysis.md](docs/system-analysis.md) | Actors, use cases, requirements, data model, screen map, state machines, risks |
| [docs/architecture.md](docs/architecture.md) | Components, request flow, generation pipeline, security, cost and deployment |
| [docs/decisions.md](docs/decisions.md) | Architecture decision records (ADR-001 onward) with reasons and rejected options |
| [docs/tasks.md](docs/tasks.md) | Phased backlog with task IDs traced to requirements |

## Planned stack

| Area | Choice |
| --- | --- |
| App | Mobile-first web app (installable PWA), Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js server routes on Vercel |
| Data and sign-in | Supabase (Postgres, Auth, row-level security) |
| AI | Claude API, called only from the server, structured JSON output |
| Analytics | PostHog |
| Payments (later) | Stripe |

Why a web app and not native: one codebase, no store fees or review delays, and it runs on any phone. A native wrapper can come later.

## Design

The clickable prototype has 16 screens and a design system (colours, fonts, shapes, every button type, and a table of where each button leads). It is a private design canvas, not stored in this repo. The screen list and navigation map are in [docs/system-analysis.md](docs/system-analysis.md#6-screens-and-navigation).

Visual basics:

- Coffee palette: latte background `#F5EDE3`, milk-foam cards `#FFFBF6`, espresso text `#2B1A12`, mocha `#6F4630` for the main action, caramel `#C98B4B` for streaks, matcha and cherry for right and wrong.
- Pill-shaped 52px buttons and soft, rounded cards.
- Source files for the prototype are in `design/` (17 phone screens at 390x844 and 9 desktop screens at 1280x800, `Desktop-*.dc.html`). Desktop uses a left sidebar instead of the bottom tab bar.
- Fraunces for titles, Inter for reading and buttons.
- Buttons 52 px tall with 14 px corners, touch targets at least 44 px.
- Right and wrong answers always carry an icon and a word, never colour alone.

## Roadmap

1. **MVP:** sign-in, create module, outline edit, swipe reader, chapter quiz, resume, progress, library, settings, feedback.
2. **v1.1:** Stash, highlights, Ask Claude on any card, daily review, reminders and streaks, flashcards, hold-to-speak discussion.
3. **Later:** final exam, 12-week courses, sharing, offline reading, web-grounded sources, subscription.

Full backlog: [docs/tasks.md](docs/tasks.md).

## Open questions

- Final app name and domain.
- Hard-gate the next chapter behind a passing quiz, or keep a soft nudge (soft is drafted).
- Which speech-to-text and text-to-speech providers to use for voice discussions.
- Free-tier limits and Plus price.

## License

See [LICENSE](LICENSE).
