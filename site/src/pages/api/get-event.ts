// get-event.ts
/* this is the API endpoint that will be called by the site to find events by id */

import type { NextApiRequest, NextApiResponse } from "next";
import { EventData } from "@utils/types/EventData";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // get the event_id from the query string
  const { event_id } = req.query;

  const event = await getEventByID(event_id as string);

  if (!event) {
    res.status(500).json({
      message: `An error occurred while fetching the data.`,
    });
    return;
  }

  // return the events with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=172800",
  );

  res.status(200).json(event);
}
