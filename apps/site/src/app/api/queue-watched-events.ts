import { createFileRoute } from "@tanstack/react-router";
import { queueEventsForPolling, validateApiKey } from "@tixtrend/core";

export const Route = createFileRoute("/api/queue-watched-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate API key
        const authError = validateApiKey(request);
        if (authError) {
          return authError;
        }

        try {
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
