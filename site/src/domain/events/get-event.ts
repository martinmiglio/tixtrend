import { getEventByID } from "@/lib/tm/events";
import { createServerFn } from "@tanstack/react-start";

export const getEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(async ({ data }) => {
    const eventId = data.event_id;
    const event = await getEventByID(eventId as string);

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  });
