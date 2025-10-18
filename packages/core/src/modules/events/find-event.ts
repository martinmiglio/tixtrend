import { getEventByKeyword } from "../../lib/ticketmaster/events";

/**
 * Search for events by keyword
 *
 * @param keyword - Search keyword
 * @param page - Page number for pagination (defaults to 0)
 * @returns Array of matching events
 * @throws {Error} If no events found
 */
export const findEventHandler = async (keyword: string, page: number = 0) => {
  const events = await getEventByKeyword(keyword, page);

  if (!events) {
    throw new Error("No events found");
  }

  return events;
};
