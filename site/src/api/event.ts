import { PriceData } from "@/api/price";

export type EventData = {
  id: string;
  name: string;
  location: string;
  date: Date;
  imageURL?: string;
  imageData: EventImageData[];
  priceHistory?: PriceData[];
};

export type EventImageData = {
  url: string;
  ratio: string; // ratio is string enum (16_9, 3_2, or 4_3)
  width: number;
  height: number;
  fallback: boolean;
  attribution?: string;
};

export const getEventByID = async (
  event_id: string,
): Promise<EventData | null> => {
  // make a request to TicketMaster's API
  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`,
  );

  // handle errors
  if (response.status !== 200) {
    if (response.status === 429) {
      // if we get a 429 error, wait 2 seconds and try again
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await getEventByID(event_id);
    }
    return null;
  }

  // parse the response as JSON
  const data = await response.json();

  // parse into EventData type
  const event: EventData = {
    id: data.id,
    name: data.name,
    location: data._embedded ? data._embedded.venues[0]?.name : "TBA",
    date: new Date(Date.parse(data.dates.start.dateTime)),
    imageData: data.images,
  };

  return event;
};

export const getEventByKeyword = async (
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
    url.searchParams.append("apikey", process.env.TICKETMASTER_API_KEY ?? "");
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
