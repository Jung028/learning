import { mock } from "bun:test";

// "server-only" throws on import unless resolved under the "react-server"
// export condition that Next.js's bundler sets up. Bun's test runner has no
// such condition, so lib/supabase/server.ts (which imports "server-only" to
// guard against client bundling) would fail on every test run without this.
// Preloading the mock, rather than mocking inside server.test.ts, ensures it
// is registered before server.test.ts's static import of "./server" runs.
mock.module("server-only", () => ({}));
