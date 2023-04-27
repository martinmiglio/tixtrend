// watch-event.ts
/* this is the API endpoint that will be called by the site to add an event to the watch list */

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get the event ID from the query string
  const event_id = req.query.event_id;

  const response = await fetch(
    `https://api.tixtrend.martinmiglio.dev/watch?event_id=${event_id}`
  );

  // check for staus code 409
  if (response.status === 409) {
    res.status(409).json({
      message: "Event already in watch list.",
    });
    return;
  }

  // check if status code is 200
  if (response.status !== 200) {
    res.status(500).json({
      message: `An error occurred while fetching the data. ${response.status}`,
    });
    return;
  }

  // parse the response as JSON
  const data = await response.json();

  res.status(200).json(data);
}
