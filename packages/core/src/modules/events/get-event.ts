import { getEventByID } from "../../lib/ticketmaster/events";

/**
 * Get event details by Ticketmaster event ID
 *
 * @param event_id - Ticketmaster event ID
 * @returns Event details
 * @throws {Error} If event not found
 */
export const getEventHandler = async (event_id: string) => {
  const event = await getEventByID(event_id);

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};
