import { getEventByKeyword } from "@/lib/ticketmaster/events";
import { createServerFn } from "@tanstack/react-start";

export const findEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { keyword: string; page?: number }) => data)
  .handler(async ({ data }) => {
    const { keyword, page } = data;
    const events = await getEventByKeyword(keyword, page ?? 0);

    if (!events) {
      throw new Error("No events found");
    }

    return events;
  });
