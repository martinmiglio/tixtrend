// get-event.ts
/* this is the API endpoint that will be called by the site to find events by id */

import type { NextApiRequest, NextApiResponse } from "next";
import { EventData } from "@utils/types/EventData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get the event_id from the query string
  const event_id = req.query.event_id;

  // make a request to TicketMaster's API
  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`
  );

  console.log(response);

  // parse the response as JSON
  const data = await response.json();

  // check if status code is 200
  if (response.status !== 200) {
    res.status(500).json({
      message: `An error occurred while fetching the data. ${response.status}`,
    });
    return;
  }

  // parse into EventData type
  const event: EventData = {
    id: data.id,
    name: data.name,
    location: data._embedded.venues[0]?.name,
    date: new Date(data.dates.start.localDate),
    imageURL: data.images[0].url,
  };

  // return the events with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=172800"
  );

  res.status(200).json(event);
}
