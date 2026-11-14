# Tasks

Backlog in build order. `FR-n` refers to the requirement IDs in [system-analysis.md](system-analysis.md). `ADR-n` refers to [decisions.md](decisions.md). Tick items as they finish.

## Phase 0: planning and design (done)

- [x] T-001 Write the product requirements (PRD)
- [x] T-002 Write the architecture decisions
- [x] T-003 Design system: colours, fonts, shapes, buttons, button-to-page map
- [x] T-004 Clickable prototype: 16 screens, every button linked (Home, New module, Generating, Outline, Reader, Quiz and results, Module, Discussion, Memorise, Library, Stash, Daily review, Settings, Upgrade, Sign in, Welcome)
- [x] T-005 Sequence diagram of the request flow (see architecture.md)
- [x] T-006 Write README, architecture, decisions, tasks, system analysis
- [ ] T-007 Pick the final app name and domain
- [ ] T-008 Confirm free-tier limits and Plus price (ADR-018)

## Phase 1: foundation

- [ ] T-010 Create the Next.js project with TypeScript and Tailwind; map design tokens to the theme (ADR-002)
- [ ] T-011 Build shared components: primary, secondary, text and icon buttons, chips, toggles, cards, progress bar, tab bar, bottom sheet
- [ ] T-012 Set up Supabase project, tables and row-level security (ADR-004)
- [ ] T-013 Sign-in with email link, Apple and Google (FR-11)
- [ ] T-014 Deploy to Vercel with a preview per pull request (ADR-005)
- [ ] T-015 Add analytics events and a consent notice (ADR-017)
- [ ] T-016 Server route wrapper: auth check, daily limits, rate limits, error format

## Phase 2: generation (MVP core)

- [ ] T-020 Define JSON schemas for outline, cards, quiz and quiz check (ADR-006)
- [ ] T-021 Topic safety check before outline (FR-25, ADR-019)
- [ ] T-022 Outline generation and the Generating screen (FR-1)
- [ ] T-023 Outline editing: remove chapters, regenerate (FR-2)
- [ ] T-024 Chapter card generation with streaming (FR-3)
- [ ] T-025 Quiz generation from the chapter's cards, then the check call (FR-7, ADR-011)
- [ ] T-026 Retry once on invalid output; retry button in the UI
- [ ] T-027 Cache by topic, level and length (ADR-010)
- [ ] T-028 Evaluate quiz quality on the smaller model before locking ADR-007

## Phase 3: reading, quiz and progress (MVP)

- [ ] T-030 Swipe reader with scroll-snap, tap targets, arrows and keyboard (FR-6, ADR-003)
- [ ] T-031 Save progress on every swipe and answer; Continue resumes the exact card (FR-4, FR-5)
- [ ] T-032 Chapter quiz screen: lock answer, icon plus word, reason (FR-7)
- [ ] T-033 Results screen: score, missed list, retry missed, review cards, next chapter (FR-8)
- [ ] T-034 Home: continue card, module list, streak
- [ ] T-035 Module page with open, next-up and locked chapters (FR-10, ADR-008)
- [ ] T-036 Library with search and filters; archive and delete (FR-10)
- [ ] T-037 Progress per module: chapters done, scores, time (FR-9)
- [ ] T-038 Settings: level, length, text size, reminder, voice switch, export, delete account (FR-23)
- [ ] T-039 Thumbs and report button on every card and question (FR-24)
- [ ] T-040 Welcome screen with daily goal and the AI-can-make-mistakes notice (ADR-019)

## Phase 4: generate ahead and lock (to-do: save tokens)

- [ ] T-050 Choose the background job runner (ADR-009)
- [ ] T-051 Write outline plus chapters 1 and 2 on first load (ADR-008)
- [ ] T-052 Checkpoint on starting a chapter writes the next two
- [ ] T-053 Chapter states: locked, next up, open, done; release rule
- [ ] T-054 Make jobs idempotent and resumable; test a closed tab mid-job
- [ ] T-055 Measure tokens per module with and without lookahead

## Phase 5: v1.1 learning features

- [ ] T-060 Stash: save a card, search, remove (FR-12)
- [ ] T-061 Highlights and notes on cards (FR-13)
- [ ] T-062 Ask Claude sheet: explain simpler, give an example, ask a question (FR-15)
- [ ] T-063 Daily review of missed questions and saved cards (FR-14)
- [ ] T-064 Reminders and streaks (FR-17)
- [ ] T-065 Quiz retake with a fresh question set (FR-18)
- [ ] T-066 Regenerate a chapter; Go deeper bonus chapter (FR-16)
- [ ] T-067 Memorise: flashcards from stored cards and answers (ADR-016)

## Phase 6: voice (to-do: controlled live discussion)

- [ ] T-070 Compare speech-to-text and text-to-speech providers (ADR-015)
- [ ] T-071 Hold-to-speak button with touch, mouse and Space key
- [ ] T-072 Discussion route: transcript to Claude with chapter cards as the only source
- [ ] T-073 10-minute session cap, daily minutes limit, transcript saved
- [ ] T-074 Typed fallback and microphone permission handling
- [ ] T-075 Presentation practice: talking points, rehearsal, coverage feedback (ADR-016)

## Phase 7: structure and business

- [ ] T-080 Full course type: overview plus 12 weekly modules with lecture, tutorial, discussion, assessment (ADR-013)
- [ ] T-081 Final exam of 10 questions across chapters (FR-19)
- [ ] T-082 Upgrade screen and Stripe checkout (ADR-018)
- [ ] T-083 Share a module outline or card by link (FR-20)
- [ ] T-084 Offline reading of downloaded modules (FR-21)
- [ ] T-085 Web-grounded mode with source links (FR-22)

## Quality and release

- [ ] T-090 Accessibility pass: screen reader, text size, contrast, non-gesture controls
- [ ] T-091 Test on five real phones; measure first card time and swipe smoothness
- [ ] T-092 Check performance targets (architecture.md section 11)
- [ ] T-093 Privacy review: export, delete, no content in analytics
- [ ] T-094 Dark mode (design system follow-up)

## Open decisions

- [ ] Final name and domain
- [ ] Hard or soft quiz gate (ADR-012)
- [ ] Speech provider (ADR-015)
- [ ] Free limits and price (ADR-018)
- [ ] Background job runner (ADR-009)
