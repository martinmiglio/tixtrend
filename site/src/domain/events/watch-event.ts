import {
  addWatchedEvent,
  getWatchedEvent,
  incrementWatchCount,
} from "@/lib/aws/dynamo";
import { createServerFn } from "@tanstack/react-start";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

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
    const apiUrl = `${API_URL}/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Event not found");
    }

    const eventData = await response.json();

    const timestamp = Date.now();
    const ttl =
      Math.floor(Date.parse(eventData.dates.start.dateTime) / 1000) +
      60 * 60 * 24;

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
