import { validateApiKey } from "@/lib/auth/validate-api-key";
import { queueEventsForPolling } from "@/modules/events/queue-events-for-polling";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/queue-watched-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate API key
        const authError = validateApiKey(request);
        if (authError) {
          return authError;
        }

        const result = await queueEventsForPolling();

        return new Response(
          JSON.stringify({
            message: "Successfully polled events.",
            watchList: result.watchList,
            popular: result.popular,
            saleSoon: result.saleSoon,
            total: result.total,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
