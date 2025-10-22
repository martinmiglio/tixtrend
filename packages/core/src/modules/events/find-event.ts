import { getEventByID, getEventByKeyword } from "../../lib/ticketmaster/events";
import {
  isTicketmasterUrl,
  translateUrlToDiscoveryId,
} from "../../lib/ticketmaster/url-translator";

/**
 * Search for events by keyword
 *
 * @param keyword - Search keyword
 * @param page - Page number for pagination (defaults to 0)
 * @param pageSize - Number of results per page (defaults to 5, max 5 per Ticketmaster API limit)
 * @returns Array of matching events
 * @throws {Error} If no events found
 */
export const findEventHandler = async (
  keyword: string,
  page: number = 0,
  pageSize: number = 5,
) => {
  const events = await getEventByKeyword(keyword, page, pageSize);

  if (!events) {
    throw new Error("No events found");
  }

  return events;
};

/**
 * Find event by Ticketmaster URL
 *
 * Translates a Ticketmaster event URL to a Discovery API ID,
 * then fetches the full event details.
 *
 * @param url - Ticketmaster event URL
 * @returns Event data if found and URL is valid
 * @throws {Error} If URL is invalid or event not found
 *
 * @example
 * const event = await findEventByUrlHandler(
 *   "https://www.ticketmaster.com/bladee-martyr-tour-phoenix-arizona/event/19006291DE7F2F8F"
 * );
 */
export const findEventByUrlHandler = async (url: string) => {
  // Validate URL format
  if (!isTicketmasterUrl(url)) {
    throw new Error("Invalid Ticketmaster URL");
  }

  // Translate URL to Discovery API ID
  const discoveryId = await translateUrlToDiscoveryId(url);

  if (!discoveryId) {
    throw new Error("Event not found for the provided URL");
  }

  // Fetch full event details
  const event = await getEventByID(discoveryId);

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};
