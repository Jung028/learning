import Ajv from "ajv";
import type { JsonSchema } from "./schemas";

const ajv = new Ajv({ allErrors: true });

export type ValidationResult<T> = { valid: true; data: T } | { valid: false; errors: string[] };

/**
 * Validates `data` (parsed JSON from a Claude call) against one of the
 * schemas in schemas.ts, so a malformed or off-contract response can be
 * caught and retried (ADR-006) instead of reaching the database or the
 * browser half-built.
 */
export function validateAgainstSchema<T>(schema: JsonSchema, data: unknown): ValidationResult<T> {
  const validate = ajv.compile(schema);
  if (validate(data)) {
    return { valid: true, data: data as T };
  }
  const errors = (validate.errors ?? []).map((e) => `${e.instancePath || "(root)"} ${e.message}`);
  return { valid: false, errors };
}
