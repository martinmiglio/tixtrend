// watch-event

/* this is the API endpoint that will be called by the site to add an event to the watch list */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hasEventId = req.nextUrl.searchParams.has("event_id");
  if (!hasEventId) {
    return NextResponse.error();
  }
  const event_id = req.nextUrl.searchParams.get("event_id");

  const response = await fetch(
    process.env.TIXTREND_API_URL + `/watch?event_id=${event_id}`,
  );

  // check if status code is 200
  if (response.status !== 200) {
    return NextResponse.error();
  }

  // parse the response as JSON
  const data = await response.json();

  return NextResponse.json(data);
}
