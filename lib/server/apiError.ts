export type ApiErrorCode =
  | "unauthenticated"
  | "rate_limited"
  | "daily_limit_reached"
  | "invalid_request"
  | "generation_failed";

export type ApiErrorBody = { error: { code: ApiErrorCode; message: string } };

export function jsonErrorResponse(status: number, code: ApiErrorCode, message: string): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
