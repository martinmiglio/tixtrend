// get-prices
/* this is the API endpoint that will be called by the site to get the prices of an event */

import { PriceData } from "@utils/types/PriceData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hasEventId = req.nextUrl.searchParams.has("event_id");
  const hasLatest = req.nextUrl.searchParams.has("latest");
  if (!hasEventId && !hasLatest) {
    return NextResponse.error();
  }

  const eventId = req.nextUrl.searchParams.get("event_id");
  const latest = req.nextUrl.searchParams.get("latest");

  const requestURL = new URL(`${process.env.TIXTREND_API_URL}/prices`);
  if (hasEventId) {
    requestURL.searchParams.append("event_id", eventId as string);
  }
  if (hasLatest) {
    requestURL.searchParams.append("latest", latest as string);
  }

  const response = await fetch(requestURL.toString());

  // check if status code is 200
  if (response.status !== 200) {
    console.error(
      `An error occurred while fetching the data. ${response.status}`,
    );
    return NextResponse.error();
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

  return NextResponse.json(prices);
}
