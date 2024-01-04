import { PriceData } from "@/lib/aws/prices";
import TicketMasterClient from "@/lib/tm/client";

const EVENTS_PER_PAGE = 20;
const TIME_BETWEEN_REQUESTS = 2000; // in milliseconds

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

export const getPopularEvents = async (numberOfEvents: number) => {
  // get the most popular events from ticketmaster
  const events = await getPaginatedEventsBySort();
  return events.slice(0, numberOfEvents);
};

export const getSaleSoonEvents = async (
  numberOfEvents: number,
): Promise<string[]> => {
  // get on sale soon events from ticketmaster
  const events = await getPaginatedEventsBySort("onSaleStartDate,asc");
  return events.slice(0, numberOfEvents);
};

const getPaginatedEventsBySort = async (
  sort?: "onSaleStartDate,asc",
): Promise<string[]> => {
  const eventPromises = Array(Math.ceil(1000 / EVENTS_PER_PAGE)).map(
    async (_, index) => {
      const page = index + 1;
      const size = EVENTS_PER_PAGE;

      if (page * size > 1000) {
        // ticketmaster only allows 1000 results at most
        return [];
      }

      // sleep for a bit to avoid rate limiting
      await new Promise((resolve) =>
        setTimeout(resolve, page * TIME_BETWEEN_REQUESTS),
      );

      const query: {
        [key: string]: string;
      } = {
        size: size.toString(),
        page: page.toString(),
      };

      if (sort) {
        query.sort = sort;
      }

      const { _embedded } = await TicketMasterClient.fetch("events", query);

      if (!_embedded?.events) {
        return [];
      }

      return _embedded.events.map((event: { id: string }) => event.id);
    },
  );

  const eventIdsByPage = await Promise.all(eventPromises);

  return eventIdsByPage.flat();
};
