import { validateApiKey } from "@/lib/auth/validate-api-key";
import { scanWatchedEvents } from "@/lib/aws/dynamo";
import { sendEventToQueue } from "@/lib/aws/sqs";
import { createFileRoute } from "@tanstack/react-router";

const MAX_QUEUE_LENGTH = 4000;

export const Route = createFileRoute("/api/queue-watched-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate API key
        const authError = validateApiKey(request);
        if (authError) {
          return authError;
        }

        const watchListResults = await queueWatchList();

        const numberOfFillerEvents = MAX_QUEUE_LENGTH - watchListResults.length;
        const popularEventsResults =
          await queuePopularEvents(numberOfFillerEvents);

        const numberOfSaleSoonEvents =
          numberOfFillerEvents - popularEventsResults.length;
        const saleSoonEventsResults = await queueSaleSoonEvents(
          numberOfSaleSoonEvents,
        );

        const totalProcessed =
          watchListResults.length +
          popularEventsResults.length +
          saleSoonEventsResults.length;

        console.info("total events queued", totalProcessed);

        return new Response(
          JSON.stringify({
            message: "Successfully polled events.",
            watchList: watchListResults.length,
            popular: popularEventsResults.length,
            saleSoon: saleSoonEventsResults.length,
            total: totalProcessed,
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

const queueWatchList = async () => {
  let Items = await scanWatchedEvents();

  if (!Items || Items.length === 0) {
    return [];
  }

  console.info("watch list count", Items.length);

  if (Items.length > MAX_QUEUE_LENGTH) {
    Items = Items.slice(0, MAX_QUEUE_LENGTH);
    console.warn(
      `Watch list has ${Items.length} events. Only queuing ${MAX_QUEUE_LENGTH} events.`,
    );
  }

  const eventIds = Items.map((item) => item.event_id);
  console.info("watch list eventIds", eventIds);

  const promises = eventIds.map(async (event_id) => {
    return await sendEventToQueue(event_id);
  });

  return Promise.all(promises);
};

const queuePopularEvents = async (numberOfEvents: number) => {
  const EVENTS_PER_PAGE = 20;
  const TIME_BETWEEN_REQUESTS = 2000;

  const eventPromises = Array(Math.ceil(numberOfEvents / EVENTS_PER_PAGE))
    .fill(null)
    .map(async (_, index) => {
      const page = index + 1;
      const size = EVENTS_PER_PAGE;

      if (page * size > 1000) {
        return [];
      }

      const delay = page * TIME_BETWEEN_REQUESTS;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events?apikey=${process.env.TICKETMASTER_API_KEY}&size=${size}&page=${page}`,
      );

      const data = await response.json();
      const { _embedded } = data;

      if (!_embedded?.events) {
        return [];
      }

      return _embedded.events.map((event: any) => event.id);
    });

  const eventIdsByPage = await Promise.all(eventPromises);
  const eventIds = eventIdsByPage.flat().slice(0, numberOfEvents);

  console.info("popular events count", eventIds.length);
  console.info("popular eventIds", eventIds);

  const queuePromises = eventIds.map(async (event_id) => {
    return await sendEventToQueue(event_id);
  });

  return Promise.all(queuePromises);
};

const queueSaleSoonEvents = async (numberOfEvents: number) => {
  const EVENTS_PER_PAGE = 20;
  const TIME_BETWEEN_REQUESTS = 2000;

  const eventPromises = Array(Math.ceil(numberOfEvents / EVENTS_PER_PAGE))
    .fill(null)
    .map(async (_, index) => {
      const page = index + 1;
      const size = EVENTS_PER_PAGE;

      if (page * size > 1000) {
        return [];
      }

      const delay = page * TIME_BETWEEN_REQUESTS;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events?apikey=${process.env.TICKETMASTER_API_KEY}&size=${size}&page=${page}&sort=onSaleStartDate,asc`,
      );

      const data = await response.json();
      const { _embedded } = data;

      if (!_embedded?.events) {
        return [];
      }

      return _embedded.events.map((event: any) => event.id);
    });

  const eventIdsByPage = await Promise.all(eventPromises);
  const eventIds = eventIdsByPage.flat().slice(0, numberOfEvents);

  console.info("on sale soon events count", eventIds.length);
  console.info("on sale soon eventIds", eventIds);

  const queuePromises = eventIds.map(async (event_id) => {
    return await sendEventToQueue(event_id);
  });

  return Promise.all(queuePromises);
};
