# Architecture Decision Records

Format: context, decision, consequences, rejected options. Status is Accepted, Proposed (needs sign-off) or Open (not decided). Date: 2026-11-14 unless noted.

| ID | Decision | Status |
| --- | --- | --- |
| [ADR-001](#adr-001-web-first-installable-pwa) | Web-first installable PWA | Accepted |
| [ADR-002](#adr-002-nextjs-react-typescript-tailwind) | Next.js, React, TypeScript, Tailwind | Accepted |
| [ADR-003](#adr-003-css-scroll-snap-for-the-swipe-reader) | CSS scroll-snap for the swipe reader | Accepted |
| [ADR-004](#adr-004-supabase-for-data-and-sign-in) | Supabase for data and sign-in | Accepted |
| [ADR-005](#adr-005-serverless-on-vercel) | Serverless on Vercel | Accepted |
| [ADR-006](#adr-006-claude-api-server-side-with-structured-output) | Claude API, server side, structured output | Accepted |
| [ADR-007](#adr-007-two-model-tiers) | Two model tiers | Accepted |
| [ADR-008](#adr-008-generate-ahead-lock-the-rest) | Generate ahead, lock the rest | Accepted |
| [ADR-009](#adr-009-background-jobs-for-lookahead-generation) | Background jobs for lookahead generation | Proposed |
| [ADR-010](#adr-010-cache-modules-by-topic-level-and-length) | Cache modules by topic, level and length | Accepted |
| [ADR-011](#adr-011-quizzes-come-only-from-the-chapter-just-read) | Quizzes come only from the chapter just read | Accepted |
| [ADR-012](#adr-012-soft-quiz-gate) | Soft quiz gate | Proposed |
| [ADR-013](#adr-013-course-structure-follows-learning-research) | Course structure follows learning research | Accepted |
| [ADR-014](#adr-014-hold-to-speak-voice-discussions) | Hold-to-speak voice discussions | Accepted |
| [ADR-015](#adr-015-speech-providers) | Speech providers | Open |
| [ADR-016](#adr-016-memorise-and-presentation-practice-reuse-stored-content) | Memorise and presentation practice reuse stored content | Accepted |
| [ADR-017](#adr-017-posthog-for-analytics) | PostHog for analytics | Accepted |
| [ADR-018](#adr-018-free-tier-then-stripe) | Free tier, then Stripe | Proposed |
| [ADR-019](#adr-019-ai-honesty-and-safety-in-the-product) | AI honesty and safety in the product | Accepted |

---

## ADR-001: Web-first installable PWA

**Context.** The goal is to reach phones cheaply. Native apps cost two to three times as much to build and add store fees and review delays.
**Decision.** Build one mobile-first web app that installs to the home screen.
**Consequences.** One codebase. Push notifications are less reliable on web (email reminders are the fallback). A native wrapper can be added later.
**Rejected.** React Native or Swift/Kotlin for the MVP.

## ADR-002: Next.js, React, TypeScript, Tailwind

**Context.** Needs fast first load, server routes and easy theming.
**Decision.** Next.js with React and TypeScript. Tailwind CSS, with the design tokens (colours, type, radius, spacing) mapped to the Tailwind theme.
**Consequences.** Server rendering helps the first screen. Tokens in one place keep every screen consistent.
**Rejected.** Single-page app with a separate API server (more to run).

## ADR-003: CSS scroll-snap for the swipe reader

**Context.** The reader needs a native-feeling vertical swipe, and must work without gestures.
**Decision.** Vertical scroll-snap stack of full-screen cards, plus tap targets, arrow buttons and keyboard support.
**Consequences.** Little code and accessible by default. Fancier physics can come later if testing asks for it.
**Rejected.** A custom gesture library (more code, more accessibility work).

## ADR-004: Supabase for data and sign-in

**Context.** Needs sign-in, sync across devices and per-user privacy without running servers.
**Decision.** Supabase Postgres and Auth, with row-level security on every table.
**Consequences.** Fast to build. Ties data to a hosted provider. Export and delete are required features.
**Rejected.** Self-hosted database (ops work while usage is small).

## ADR-005: Serverless on Vercel

**Context.** Traffic will be small and spiky at first.
**Decision.** Host the web app and server routes on Vercel. Preview deployment per pull request.
**Consequences.** Scales to zero when idle. Long generations need streaming and background jobs (ADR-009).
**Rejected.** Always-on servers.

## ADR-006: Claude API, server side, structured output

**Context.** The Claude key must stay secret and the app needs parseable cards and quizzes.
**Decision.** Call Claude only from server routes, with a JSON schema for every call. Retry once on invalid output.
**Consequences.** No half-built chapters reach the user. Schemas are part of the contract and need versioning.
**Rejected.** Calling Claude from the browser. Free-text output parsed with rules.

## ADR-007: Two model tiers

**Context.** Cost and speed matter most for outlines and quizzes. Card writing is where quality shows.
**Decision.** Use a smaller, faster Claude model for outline, quiz and quiz check. Use a stronger model for card writing.
**Consequences.** Lower cost per module. Needs evaluation to confirm quiz quality holds on the smaller model.
**Rejected.** One model for everything.

## ADR-008: Generate ahead, lock the rest

**Context.** Writing a whole course up front wastes tokens when most learners stop early. (From the to-do list.)
**Decision.** Write the outline and chapters 1 and 2 first. Starting a chapter is a checkpoint that triggers writing the next two. All chapter titles are visible. Chapters stay locked until the learner reaches the one before.
**Consequences.** Cost follows real use. The Module page shows locked, next-up and open rows. A learner can never skip far ahead.
**Rejected.** Whole-course generation. Generating only on demand with no lookahead (a wait at every chapter).

## ADR-009: Background jobs for lookahead generation

**Context.** Lookahead writing must not block the learner or fail when the tab closes.
**Decision.** Run it as a background job started by the checkpoint request. Candidates: a Vercel background function or a Supabase queue with a worker.
**Consequences.** Jobs must be idempotent and resumable. Chapter state records progress.
**Status.** Proposed. Pick the runner in the first build sprint.

## ADR-010: Cache modules by topic, level and length

**Context.** Popular topics repeat.
**Decision.** Cache outlines and chapter content by topic, level and length. A hit is copied into the user's own rows. Users can always regenerate.
**Consequences.** Second request is nearly free. Cached content needs a way to be refreshed or retired when feedback flags errors.
**Rejected.** Sharing rows between users (breaks privacy and edits).

## ADR-011: Quizzes come only from the chapter just read

**Context.** Questions on unseen material feel unfair. Ambiguous questions hurt trust.
**Decision.** The quiz call receives only that chapter's cards. A second call checks each question has exactly one defensible answer. Each question stores its source card.
**Consequences.** Fair quizzes and a link from a missed question back to its card. One extra cheap call per quiz.

## ADR-012: Soft quiz gate

**Context.** Hard gates frustrate; no gate removes the point of the quiz.
**Decision.** Passing is 3 of 5. Failing shows a nudge, not a lock. The next chapter opens when the quiz is finished.
**Status.** Proposed. Revisit after user testing.

## ADR-013: Course structure follows learning research

**Context.** The to-do list asks for structure backed by evidence. Matching content to "learning styles" has not been supported by research.
**Decision.** Build around retrieval practice (quizzes), spaced review, worked examples and explaining aloud. For full subjects: an overview, then 12 weekly modules, each with a lecture (cards), tutorial (worked examples), discussion, and assessment, plus mid-course and final exams.
**Consequences.** Short topics keep the same parts at smaller size. Full courses are a Plus feature and follow ADR-008 so they are never written all at once.
**Rejected.** Learning-style personalisation.

## ADR-014: Hold-to-speak voice discussions

**Context.** Discussions with Claude help understanding, but open microphones cost money and raise privacy concerns.
**Decision.** Push-to-talk only. Record while the button is held. Sessions capped at 10 minutes, daily limit on the free plan, transcript saved, typed fallback, off switch in Settings. Claude answers only from the chapter's cards.
**Consequences.** Predictable cost and privacy. Slightly slower than open conversation.
**Rejected.** Always-on voice mode.

## ADR-015: Speech providers

**Context.** Voice needs speech to text and text to speech.
**Decision.** Not decided.
**Status.** Open. Compare quality, price, latency and streaming support before the v1.1 voice work.

## ADR-016: Memorise and presentation practice reuse stored content

**Context.** Memorisation and presenting were added to the to-do list.
**Decision.** Flashcards come from stored cards and quiz answers (no new Claude calls). "Again" cards return in the next day's review. Presentation practice drafts talking points from the chapter, then uses the ADR-014 voice flow for rehearsal and feedback.
**Consequences.** Cheap to run. Presentation practice counts toward voice minutes.

## ADR-017: PostHog for analytics

**Context.** The PRD defines success metrics (completion, quiz scores, retention).
**Decision.** Track events with PostHog: module created, card viewed, chapter finished, quiz started and passed, discussion started, review finished.
**Consequences.** Needs a consent notice and no content in event properties.

## ADR-018: Free tier, then Stripe

**Context.** AI cost needs a business model, but billing is not needed for the MVP.
**Decision.** Free plan of 3 modules, short voice sessions. Plus (unlimited modules, 12-week courses, final exams, longer voice) via Stripe after the MVP.
**Status.** Proposed. Price and limits to be set.

## ADR-019: AI honesty and safety in the product

**Context.** Generated courses can be wrong or harmful.
**Decision.** Show an "AI can make mistakes" notice at sign-up and first use. A report button on every card and question. Refuse harmful topics before generating. Show "general information, not advice" on medical, legal and money topics. Optional web-grounded mode with sources comes later.
**Consequences.** Feedback data drives cache retirement (ADR-010) and prompt fixes.
