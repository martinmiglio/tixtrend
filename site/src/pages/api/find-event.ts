// find-event.ts
/* this is the API endpoint that will be called by the site to find events by keyword */

import type { NextApiRequest, NextApiResponse } from "next";
import { EventData } from "@utils/types/EventData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get the keyword from the query string
  const keyword = req.query.keyword;

  // make a request to TicketMaster's API
  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/suggest?keyword=${keyword}&apikey=${process.env.TICKETMASTER_API_KEY}&includeSpellcheck=yes`
  );

  // check if status code is 200
  if (response.status !== 200) {
    res.status(500).json({
      message: `An error occurred while fetching the data. ${response.status}`,
    });
    return;
  }

  // parse the response as JSON
  const data = await response.json();

  // check if there are any events
  if (
    !data ||
    !data._embedded ||
    !data._embedded.events ||
    data._embedded.events === 0
  ) {
    res.status(200).json([]);
    return;
  }

  // parse into EventData type
  const events: EventData[] = data._embedded.events.map((event: any) => {
    return {
      id: event.id,
      name: event.name,
      location: event._embedded ? event._embedded.venues[0]?.name : "TBA",
      date: new Date(event.dates.start.localDate),
      imageURL: event.images[0].url,
    };
  });

  // return the events with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=240"
  );
  res.status(200).json(events);
}
