/**
 * Validates the API key from the request headers
 * @param request The incoming request
 * @returns Response with 401 if invalid, null if valid
 */
export function validateApiKey(request: Request): Response | null {
  const apiKey = request.headers.get("X-API-Key");
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    console.error("INTERNAL_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Internal server configuration error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    console.warn("Invalid or missing API key in request");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
