// get-popular-events
/* this is the API endpoint that will be called by the site to find events by id */

import { EventData } from "@utils/types/EventData";
import { getEventByID } from "../get-event/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hasEventCount = req.nextUrl.searchParams.has("event_count");
  const eventCount = hasEventCount
    ? req.nextUrl.searchParams.get("event_count")
    : undefined;

  const response = await fetch(
    process.env.TIXTREND_API_URL + `/watch?list=${eventCount}`,
  );

  if (response.status !== 200) {
    console.error(
      `An error occurred while fetching the data. ${response.status}`,
    );
    return NextResponse.error();
  }

  const data = await response.json();

  const events: EventData[] = await Promise.all(
    data.events.map(async (event: any) => {
      return (await getEventByID(event.event_id)) as EventData;
    }),
  );

  data.events = events;

  return NextResponse.json(data);
}
