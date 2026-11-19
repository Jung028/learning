import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/**
 * Lazy singleton so importing this module (or anything that imports it)
 * never constructs a client — the constructor throws if no credential is
 * resolvable, which is true in every environment so far (no
 * ANTHROPIC_API_KEY is set locally or on Vercel yet). Call only from an
 * actual route handler, once a credential exists.
 */
export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}
