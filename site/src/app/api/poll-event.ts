import { pollEvent } from "@/domain/prices/poll-event";
import { validateApiKey } from "@/lib/auth/validate-api-key";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/poll-event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate API key
        const authError = validateApiKey(request);
        if (authError) {
          return authError;
        }

        const body = await request.json();
        const { event_id } = body;

        if (!event_id || typeof event_id !== "string") {
          return new Response(
            JSON.stringify({ error: "event_id is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const result = await pollEvent({ data: { event_id } });

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
