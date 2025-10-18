import {
  addWatchedEvent,
  getWatchedEvent,
  incrementWatchCount,
} from "../../lib/aws/dynamo";
import { getEventByID } from "../../lib/ticketmaster/events";

/**
 * Add an event to the watch list or increment watch count if already watched
 *
 * @param event_id - Ticketmaster event ID
 * @returns Object indicating if event was already watched and event data
 * @throws {Error} If event not found in Ticketmaster
 */
export const watchEventHandler = async (event_id: string) => {
  // Check if event is already being watched
  const Item = await getWatchedEvent(event_id);

  if (Item) {
    // Increment watch count
    await incrementWatchCount(event_id);

    return {
      watched: true,
      event: Item,
    };
  }

  // Fetch event from Ticketmaster to validate it exists
  const eventData = await getEventByID(event_id);

  if (!eventData) {
    throw new Error("Event not found");
  }

  const timestamp = Date.now();
  const ttl = Math.floor(eventData.date.getTime() / 1000) + 60 * 60 * 24;

  // Add event to watch list
  await addWatchedEvent({
    event_id,
    timestamp,
    ttl,
  });

  return {
    watched: false,
    event: eventData,
  };
};
