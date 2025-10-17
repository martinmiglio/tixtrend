import type { PriceData } from "@/domain/prices/types";
import TicketMasterClient from "@/lib/tm/client";

type TicketMasterEventResponse = {
  id: string;
  name: string;
  dates: {
    start: {
      dateTime: string;
    };
  };
  images: EventImageData[];
  _embedded?: {
    venues: Array<{ name: string }>;
  };
};

type TicketMasterSearchResponse = {
  _embedded?: {
    events?: TicketMasterEventResponse[];
  };
};

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
    const data = (await TicketMasterClient.fetch(
      `events/${event_id}`,
    )) as TicketMasterEventResponse;

    // parse into EventData type
    const event: EventData = {
      id: data.id,
      name: data.name,
      location: data._embedded?.venues?.[0]?.name ?? "TBA",
      date: new Date(Date.parse(data.dates.start.dateTime)),
      imageData: data.images,
    };

    return event;
  } catch {
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

  const data = (await Promise.all(requests)) as TicketMasterSearchResponse[];

  // remove data has no ._embedded, ._embedded.events properties or events length of 0
  const validData = data.filter(
    (d) => d._embedded?.events && d._embedded.events.length > 0,
  );

  // collect all events
  const events = validData.flatMap((d) => d._embedded?.events ?? []);

  // remove duplicates
  const uniqueEvents = events.filter(
    (event, index, self) => index === self.findIndex((e) => e.id === event.id),
  );

  // order by date
  uniqueEvents.sort((a, b) => {
    return (
      new Date(Date.parse(a.dates.start.dateTime)).getTime() -
      new Date(Date.parse(b.dates.start.dateTime)).getTime()
    );
  });

  // parse into EventData type
  return uniqueEvents.map((event) => {
    return {
      id: event.id,
      name: event.name,
      location: event._embedded?.venues?.[0]?.name ?? "TBA",
      date: new Date(Date.parse(event.dates.start.dateTime)),
      imageData: event.images,
    };
  });
};
