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

  const events = await getSearchEvents(keyword as string);

  if (!events) {
    res.status(500).json({
      message: `No events found for keyword ${keyword}`,
    });
    return;
  }
  // return the events with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=240"
  );
  res.status(200).json(events);
}

const getSearchEvents = async (keyword: string): Promise<EventData[]> => {
  const endpoints = [
    `https://app.ticketmaster.com/discovery/v2/events?keyword=${keyword}&apikey=${process.env.TICKETMASTER_API_KEY}&includeSpellcheck=yes`,
    `https://app.ticketmaster.com/discovery/v2/suggest?keyword=${keyword}&apikey=${process.env.TICKETMASTER_API_KEY}&includeSpellcheck=yes`,
  ];

  // make requests to both endpoints, merging the results and removing duplicates by id
  const responses = await Promise.all(
    endpoints.map((endpoint) => fetch(endpoint))
  );
  const data = await Promise.all(responses.map((response) => response.json()));

  // remove data has no ._embedded.events property
  data.forEach((d: any, index: number) => {
    if (!d._embedded || !d._embedded.events) {
      data.splice(index, 1);
    }
  });

  const events = data.map((d: any) => d._embedded.events).flat();
  const uniqueEvents = events.filter(
    (event: any, index: number, self: any) =>
      index === self.findIndex((e: any) => e.id === event.id)
  );

  // order by date
  uniqueEvents.sort((a: any, b: any) => {
    return (
      new Date(Date.parse(a.dates.start.dateTime)).getTime() -
      new Date(Date.parse(b.dates.start.dateTime)).getTime()
    );
  });

  // parse into EventData type
  return uniqueEvents.map((event: any) => {
    return {
      id: event.id,
      name: event.name,
      location: event._embedded ? event._embedded.venues[0]?.name : "TBA",
      date: new Date(Date.parse(event.dates.start.dateTime)),
      imageURL: event.images[0].url,
    };
  });
};
