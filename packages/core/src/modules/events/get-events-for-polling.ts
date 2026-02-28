import { scanWatchedEvents } from "../../lib/aws/dynamo";
import {
  fetchEventIdsByPage,
  fetchEventIdsByPageSorted,
} from "../../lib/ticketmaster/events";
import { shouldSkipEvent } from "../prices/track-failures";

const MAX_EVENTS = 4000;
const DYNAMO_BATCH_SIZE = 100; // Process DynamoDB queries in batches to avoid overwhelming the system

/**
 * Filter events by checking if they should be skipped, using batched DynamoDB queries
 * to avoid overwhelming the system with thousands of concurrent requests.
 */
async function filterEventsWithBatchedQueries(
  eventIds: string[],
): Promise<{ eventsToInclude: string[]; eventsToSkip: string[] }> {
  const filterResults: { event_id: string; skip: boolean }[] = [];

  // Process in batches to avoid overwhelming DynamoDB
  for (let i = 0; i < eventIds.length; i += DYNAMO_BATCH_SIZE) {
    const batch = eventIds.slice(i, i + DYNAMO_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (event_id) => {
        const skip = await shouldSkipEvent(event_id);
        return { event_id, skip };
      }),
    );
    filterResults.push(...batchResults);
  }

  const eventsToInclude = filterResults.filter((r) => !r.skip).map((r) => r.event_id);
  const eventsToSkip = filterResults.filter((r) => r.skip).map((r) => r.event_id);

  return { eventsToInclude, eventsToSkip };
}

export type GetEventsForPollingResult = {
  eventIds: string[];
  stats: {
    watchList: number;
    popular: number;
    saleSoon: number;
    skipped: number;
    total: number;
  };
};

/**
 * Get event IDs for automated price polling
 *
 * Collects events in priority order:
 * 1. Watched events (highest priority) - events users are tracking
 * 2. Popular events (filler) - trending events to fill remaining capacity
 * 3. On-sale-soon events (remaining filler) - events going on sale soon
 *
 * Filters out events that have failed 3+ times in the last 7 days.
 * Limits total to MAX_EVENTS (4000) to prevent overload.
 *
 * @returns Event IDs and statistics about collected events by category
 *
 * @example
 * ```typescript
 * const result = await getEventsForPolling();
 * console.log(`Collected ${result.stats.total} events`);
 * // Output: { eventIds: [...], stats: { watchList: 150, popular: 1800, saleSoon: 2050, skipped: 0, total: 4000 } }
 * ```
 */
export const getEventsForPolling =
  async (): Promise<GetEventsForPollingResult> => {
    const watchListResults = await collectWatchList();

    const numberOfFillerEvents = MAX_EVENTS - watchListResults.eventIds.length;
    const popularEventsResults = await collectPopularEvents(numberOfFillerEvents);

    const numberOfSaleSoonEvents =
      numberOfFillerEvents - popularEventsResults.eventIds.length;
    const saleSoonEventsResults = await collectSaleSoonEvents(
      numberOfSaleSoonEvents,
    );

    const eventIds = Array.from(new Set([
      ...watchListResults.eventIds,
      ...popularEventsResults.eventIds,
      ...saleSoonEventsResults.eventIds,
    ]));

    const totalSkipped =
      watchListResults.skipped +
      popularEventsResults.skipped +
      saleSoonEventsResults.skipped;

    console.info("total events collected", eventIds.length);
    console.info("total events skipped due to recent failures", totalSkipped);

    return {
      eventIds,
      stats: {
        watchList: watchListResults.eventIds.length,
        popular: popularEventsResults.eventIds.length,
        saleSoon: saleSoonEventsResults.eventIds.length,
        skipped: totalSkipped,
        total: eventIds.length,
      },
    };
  };

const collectWatchList = async () => {
  let Items = await scanWatchedEvents();

  if (!Items || Items.length === 0) {
    return { eventIds: [], skipped: 0 };
  }

  console.info("watch list count", Items.length);

  if (Items.length > MAX_EVENTS) {
    Items = Items.slice(0, MAX_EVENTS);
    console.warn(
      `Watch list has ${Items.length} events. Only collecting ${MAX_EVENTS} events.`,
    );
  }

  const eventIds = Items.map((item) => item.event_id);
  console.info("watch list eventIds", eventIds);

  // Filter out events that should be skipped due to recent failures (batched queries)
  const { eventsToInclude, eventsToSkip } =
    await filterEventsWithBatchedQueries(eventIds);

  if (eventsToSkip.length > 0) {
    console.info(
      `Skipping ${eventsToSkip.length} watched events due to recent failures:`,
      eventsToSkip,
    );
  }

  return {
    eventIds: eventsToInclude,
    skipped: eventsToSkip.length,
  };
};

const collectPopularEvents = async (numberOfEvents: number) => {
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

  // Filter out events that should be skipped due to recent failures (batched queries)
  const { eventsToInclude, eventsToSkip } =
    await filterEventsWithBatchedQueries(eventIds);

  if (eventsToSkip.length > 0) {
    console.info(
      `Skipping ${eventsToSkip.length} popular events due to recent failures:`,
      eventsToSkip,
    );
  }

  return {
    eventIds: eventsToInclude,
    skipped: eventsToSkip.length,
  };
};

const collectSaleSoonEvents = async (numberOfEvents: number) => {
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

  // Filter out events that should be skipped due to recent failures (batched queries)
  const { eventsToInclude, eventsToSkip } =
    await filterEventsWithBatchedQueries(eventIds);

  if (eventsToSkip.length > 0) {
    console.info(
      `Skipping ${eventsToSkip.length} on-sale-soon events due to recent failures:`,
      eventsToSkip,
    );
  }

  return {
    eventIds: eventsToInclude,
    skipped: eventsToSkip.length,
  };
};
