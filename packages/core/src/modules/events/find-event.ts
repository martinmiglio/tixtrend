import { getEventByKeyword } from "../../lib/ticketmaster/events";

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
