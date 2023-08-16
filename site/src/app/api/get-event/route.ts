// get-event
/* this is the API endpoint that will be called by the site to find events by id */

import { EventData } from "@utils/types/EventData";
import { NextRequest, NextResponse } from "next/server";

export const getEventByID = async (
  event_id: string,
): Promise<EventData | null> => {
  // make a request to TicketMaster's API
  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`,
  );

  // handle errors
  if (response.status !== 200) {
    if (response.status === 429) {
      // if we get a 429 error, wait 2 seconds and try again
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await getEventByID(event_id);
    }
    return null;
  }

  // parse the response as JSON
  const data = await response.json();

  // parse into EventData type
  const event: EventData = {
    id: data.id,
    name: data.name,
    location: data._embedded ? data._embedded.venues[0]?.name : "TBA",
    date: new Date(Date.parse(data.dates.start.dateTime)),
    imageData: data.images,
  };

  return event;
};

export async function GET(req: NextRequest) {
  const hasEventId = req.nextUrl.searchParams.has("event_id");

  if (!hasEventId) {
    return NextResponse.error();
  }

  const eventId = req.nextUrl.searchParams.get("event_id");

  const event = await getEventByID(eventId as string);

  if (!event) {
    return NextResponse.error();
  }

  return NextResponse.json(event);
}
