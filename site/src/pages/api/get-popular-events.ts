// get-event.ts
/* this is the API endpoint that will be called by the site to find events by id */

import type { NextApiRequest, NextApiResponse } from "next";
import { EventData } from "@utils/types/EventData";
import { getEventByID } from "./get-event";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get the event_id from the query string
  const { event_count } = req.query;

  // make a request to TicketMaster's API
  const response = await fetch(
    process.env.TIXTREND_API_URL + `/watch?list=${event_count}`
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

  // for eveny event in the list, get the event data
  const events: EventData[] = await Promise.all(
    data.events.map(async (event: any) => {
      return (await getEventByID(event.event_id)) as EventData;
    })
  );

  data.events = events;

  // return the events with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=240"
  );

  res.status(200).json(data);
}
