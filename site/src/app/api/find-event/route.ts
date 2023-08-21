// find-event

/* this is the API endpoint that will be called by the site to find events by keyword */
import { EventData } from "@/api/get-event";
import { NextRequest, NextResponse } from "next/server";

const getSearchEvents = async (
  keyword: string,
  page: number,
): Promise<EventData[]> => {
  const PAGE_SIZE = 5;

  const endpoints = [
    `https://app.ticketmaster.com/discovery/v2/events`,
    `https://app.ticketmaster.com/discovery/v2/suggest`,
  ];

  endpoints.forEach((endpoint, index) => {
    const url = new URL(endpoint);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("apikey", process.env.TICKETMASTER_API_KEY || "");
    url.searchParams.append("includeSpellcheck", "yes");
    url.searchParams.append("page", page.toString());
    url.searchParams.append("size", PAGE_SIZE.toString());
    endpoints[index] = url.toString();
  });

  // make requests to both endpoints, merging the results and removing duplicates by id
  let responses = await Promise.all(
    endpoints.map((endpoint) => fetch(endpoint)),
  );

  // filter out non-200
  responses = responses.filter((response) => response.ok);

  if (responses.length === 0) {
    return [];
  }

  // parse responses into json
  let data = await Promise.all(responses.map((response) => response.json()));

  // remove data has no ._embedded, ._embedded.events properties or events length of 0
  data = data.filter((d: any) => d._embedded?.events?.length > 0);

  // remove duplicates
  data = data.filter(
    (d: any, index: number, self: any) =>
      index === self.findIndex((e: any) => e.id === d.id),
  );

  const events = data.map((d: any) => d._embedded.events).flat();
  const uniqueEvents = events.filter(
    (event: any, index: number, self: any) =>
      index === self.findIndex((e: any) => e.id === event.id),
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
      imageData: event.images,
    };
  });
};

export async function GET(req: NextRequest) {
  const hasKeyword = req.nextUrl.searchParams.has("keyword");

  if (!hasKeyword) {
    return NextResponse.error();
  }

  const keyword = hasKeyword
    ? req.nextUrl.searchParams.get("keyword")
    : undefined;

  const hasPage = req.nextUrl.searchParams.has("page");
  const page = hasPage
    ? parseInt(req.nextUrl.searchParams.get("page") ?? "0")
    : 0;

  const events = await getSearchEvents(keyword as string, page);

  if (!events) {
    return NextResponse.error();
  }

  return NextResponse.json(events);
}
