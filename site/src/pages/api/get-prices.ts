// get-prices.ts
/* this is the API endpoint that will be called by the site to get the prices of an event */

import type { NextApiRequest, NextApiResponse } from "next";
import { PriceData } from "@utils/types/PriceData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get the event ID from the query string
  const event_id = req.query.event_id;

  // make a request to the API
  const response = await fetch(
    process.env.TIXTREND_API_URL + `/prices?event_id=${event_id}`
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

  // parse into PriceData type
  const prices: PriceData[] = data.map((price: any) => {
    return {
      id: price.id,
      timestamp: new Date(price.timestamp),
      max: price.max,
      min: price.min,
      currency: price.currency,
    };
  });

  // return the prices with a cache header
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=240"
  );
  res.status(200).json(prices);
}
