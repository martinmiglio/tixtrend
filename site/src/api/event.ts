import { PriceData } from "@/api/price";
import TicketMasterClient from "@/lib/tm/client";
import "server-only";
import { z } from "zod";

const schema = z.object({
  TICKETMASTER_API_KEY: z.string(),
  TIXTREND_API_URL: z.string(),
});

const env = schema.parse(process.env);

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
  try {
    const data = await TicketMasterClient.fetch(`events/${event_id}`);

    // parse into EventData type
    const event: EventData = {
      id: data.id,
      name: data.name,
      location: data._embedded ? data._embedded.venues[0]?.name : "TBA",
      date: new Date(Date.parse(data.dates.start.dateTime)),
      imageData: data.images,
    };

    return event;
  } catch (e) {
    return null;
  }
};

export const getEventByKeyword = async (
  keyword: string,
  page: number,
): Promise<EventData[]> => {
  const PAGE_SIZE = 5;

  const query = {
    keyword,
    page: page.toString(),
    size: PAGE_SIZE.toString(),
    includeSpellcheck: "yes",
  };

  const requests = [
    TicketMasterClient.fetch(`events`, query),
    TicketMasterClient.fetch(`suggest`, query),
  ];

  let data = await Promise.all(requests);

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

export const watchEvent = async (event_id: string) => {
  const response = await fetch(
    env.TIXTREND_API_URL + `/watch?event_id=${event_id}`,
  );
  return response.status === 200;
};
