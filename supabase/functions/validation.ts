import { corsHeaders } from "jsr:@supabase/supabase-js/cors";
import { errorResponse } from "./error-response.ts";

/**
 * Parse and validate JSON request body with size limit
 * @param req - The HTTP request
 * @param maxSizeBytes - Maximum allowed body size (default: 1KB)
 * @returns Parsed body object or error Response
 */
export async function parseRequestBody(
  req: Request,
  maxSizeBytes = 1024,
): Promise<Record<string, unknown> | Response> {
  try {
    const rawBody = await req.text();

    // Check body size
    if (rawBody.length > maxSizeBytes) {
      return errorResponse(413, "Request body too large", corsHeaders);
    }

    // Parse JSON
    const body = JSON.parse(rawBody);

    // Validate it's an object
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "Request body must be a JSON object", corsHeaders);
    }

    return body as Record<string, unknown>;
  } catch {
    return errorResponse(400, "Invalid JSON in request body", corsHeaders);
  }
}
