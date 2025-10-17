import {
  addWatchedEvent,
  getWatchedEvent,
  incrementWatchCount,
} from "@/lib/aws/dynamo";
import { getEventByID } from "@/lib/ticketmaster/events";
import { createServerFn } from "@tanstack/react-start";

export const watchEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(async ({ data }) => {
    const { event_id } = data;

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
  });
