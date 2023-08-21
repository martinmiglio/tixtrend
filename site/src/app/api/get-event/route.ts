// get-event

/* this is the API endpoint that will be called by the site to find events by id */
import { getEventByID } from "@/api/get-event";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hasEventId = req.nextUrl.searchParams.has("event_id");

  if (!hasEventId) {
    return NextResponse.error();
  }

  const eventId = req.nextUrl.searchParams.get("event_id");

  const event = await getEventByID(eventId as string);

  if (!event) {
    return NextResponse.error();
  }

  return NextResponse.json(event);
}
