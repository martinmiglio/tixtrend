import { createFileRoute } from "@tanstack/react-router";
import { pollEventHandler, validateApiKey } from "@tixtrend/core";

export const Route = createFileRoute("/api/poll-event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate API key
        const authError = validateApiKey(request);
        if (authError) {
          return authError;
        }

        try {
          const { event_id } = await request.json();

          if (!event_id || typeof event_id !== "string") {
            return new Response(
              JSON.stringify({
                error: "event_id is required and must be a string",
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const result = await pollEventHandler(event_id);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
