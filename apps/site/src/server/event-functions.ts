/**
 * Server-only function definitions
 *
 * These functions import from @tixtrend/core and are only included in the server bundle.
 * Client-side code should import from this file, not directly from @tixtrend/core.
 */
import { createServerFn } from "@tanstack/react-start";
import {
  findEventHandler,
  findEventByUrlHandler,
  getEventHandler,
  getPricesHandler,
  watchEventHandler,
} from "@tixtrend/core";

/**
 * Get event details by ID
 */
export const getEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(({ data }) => getEventHandler(data.event_id));

/**
 * Find events by keyword and page
 */
export const findEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { keyword: string; page: number }) => data)
  .handler(({ data }) => findEventHandler(data.keyword, data.page));

/**
 * Find event by Ticketmaster URL
 */
export const findEventByUrl = createServerFn({ method: "GET" })
  .inputValidator((data: { url: string }) => data)
  .handler(({ data }) => findEventByUrlHandler(data.url));

/**
 * Get price history for an event
 */
export const getPrices = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(({ data }) => getPricesHandler(data.event_id));

/**
 * Mark an event as watched (increments watch count)
 */
export const watchEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(({ data }) => watchEventHandler(data.event_id));
