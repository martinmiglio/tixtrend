import { scanWatchedEvents } from "@/lib/aws/dynamo";
import { sendEventToQueue } from "@/lib/aws/sqs";
import {
  fetchEventIdsByPage,
  fetchEventIdsByPageSorted,
} from "@/lib/ticketmaster/events";

const MAX_QUEUE_LENGTH = 4000;

export type QueueEventsForPollingResult = {
  watchList: number;
  popular: number;
  saleSoon: number;
  total: number;
};

/**
 * Queue events for polling use case.
 *
 * Orchestrates queueing events in priority order:
 * 1. Watched events (highest priority)
 * 2. Popular events (filler)
 * 3. On-sale-soon events (remaining filler)
 *
 * @returns Statistics about queued events
 */
export const queueEventsForPolling =
  async (): Promise<QueueEventsForPollingResult> => {
    const watchListResults = await queueWatchList();

    const numberOfFillerEvents = MAX_QUEUE_LENGTH - watchListResults.length;
    const popularEventsResults = await queuePopularEvents(numberOfFillerEvents);

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

    return {
      watchList: watchListResults.length,
      popular: popularEventsResults.length,
      saleSoon: saleSoonEventsResults.length,
      total: totalProcessed,
    };
  };

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

      return await fetchEventIdsByPage(page, size);
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

      return await fetchEventIdsByPageSorted(page, size, "onSaleStartDate,asc");
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
