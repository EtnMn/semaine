/**
 * Shared helpers to build consistent, safe error responses for Edge Functions.
 *
 * - `errorResponse` is for expected client-facing errors (missing/invalid input,
 *   authentication/authorization failures, "not found") where the message is
 *   already safe to show to the user.
 * - `serverErrorResponse` is for unexpected server-side failures (database
 *   errors, Auth admin API errors, thrown exceptions). It always logs the raw
 *   details with `console.error` and returns a generic message to the client,
 *   so raw SQL/Auth errors never leak to the browser.
 */

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Client-safe error response, e.g. validation or auth errors. */
export function errorResponse(
  status: number,
  message: string,
  corsHeaders: Record<string, string>,
): Response {
  return jsonResponse({ error: message }, status, corsHeaders);
}

/**
 * Generic 500 error response. Logs `details` server-side and never forwards
 * raw SQL/Auth error details to the client.
 */
export function serverErrorResponse(
  corsHeaders: Record<string, string>,
  details: unknown,
  context?: string,
): Response {
  console.error(context ? `[${context}]` : "Unhandled error:", details);
  return jsonResponse({ error: "Internal server error" }, 500, corsHeaders);
}
