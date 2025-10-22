import type { EventPriceData, PriceData } from "../../modules/prices/types";
import TicketMasterClient from "./client";
import { DEFAULT_EVENT_TTL_DAYS, SECONDS_PER_DAY } from "./constants";
import {
  TicketMasterEventResponseSchema,
  TicketMasterSearchResponseSchema,
} from "./schemas";
import type { EventImageData } from "./types";

export type EventData = {
  id: string;
  name: string;
  location: string;
  date: Date;
  imageURL?: string;
  imageData: EventImageData[];
  priceHistory?: PriceData[];
};

export type { EventImageData };

export const getEventByID = async (
  event_id: string,
): Promise<EventData | null> => {
  try {
    const data = await TicketMasterClient.fetchValidated(
      `events/${event_id}`,
      TicketMasterEventResponseSchema,
    );

    // Handle missing dateTime (TBA/TBD events)
    let date: Date;
    if (data.dates.start.dateTime) {
      date = new Date(Date.parse(data.dates.start.dateTime));
    } else if (data.dates.start.localDate) {
      // Use localDate as fallback (date without time)
      date = new Date(data.dates.start.localDate);
    } else {
      // Event has no valid date, skip it
      return null;
    }

    // parse into EventData type
    const event: EventData = {
      id: data.id,
      name: data.name,
      location: data._embedded?.venues?.[0]?.name ?? "TBA",
      date,
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
  pageSize: number = 5,
): Promise<EventData[]> => {
  const query = {
    keyword,
    page: page.toString(),
    size: pageSize.toString(),
    includeSpellcheck: "yes",
  };

  const requests = [
    TicketMasterClient.fetchValidated(
      `events`,
      TicketMasterSearchResponseSchema,
      query,
    ),
    TicketMasterClient.fetchValidated(
      `suggest`,
      TicketMasterSearchResponseSchema,
      query,
    ),
  ];

  const data = await Promise.all(requests);

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

  // filter out events without valid dates and parse into EventData type
  const eventsWithDates = uniqueEvents
    .map((event) => {
      // Handle missing dateTime (TBA/TBD events)
      let date: Date | null = null;
      if (event.dates.start.dateTime) {
        date = new Date(Date.parse(event.dates.start.dateTime));
      } else if (event.dates.start.localDate) {
        // Use localDate as fallback (date without time)
        date = new Date(event.dates.start.localDate);
      }

      if (!date) {
        return null;
      }

      return {
        id: event.id,
        name: event.name,
        location: event._embedded?.venues?.[0]?.name ?? "TBA",
        date,
        imageData: event.images,
      };
    })
    .filter((event): event is EventData => event !== null);

  // order by date
  eventsWithDates.sort((a, b) => {
    return a.date.getTime() - b.date.getTime();
  });

  return eventsWithDates;
};

/**
 * Fetch event IDs from Ticketmaster API by page
 *
 * @param page - Page number (1-indexed)
 * @param size - Number of events per page
 * @returns Array of event IDs
 */
export const fetchEventIdsByPage = async (
  page: number,
  size: number,
): Promise<string[]> => {
  const data = await TicketMasterClient.fetchValidated(
    "events",
    TicketMasterSearchResponseSchema,
    {
      page: page.toString(),
      size: size.toString(),
    },
  );

  if (!data._embedded?.events) {
    return [];
  }

  return data._embedded.events.map((event) => event.id);
};

/**
 * Fetch event IDs from Ticketmaster API by page with sorting
 *
 * @param page - Page number (1-indexed)
 * @param size - Number of events per page
 * @param sort - Sort parameter (e.g., "onSaleStartDate,asc")
 * @returns Array of event IDs
 */
export const fetchEventIdsByPageSorted = async (
  page: number,
  size: number,
  sort: string,
): Promise<string[]> => {
  const data = await TicketMasterClient.fetchValidated(
    "events",
    TicketMasterSearchResponseSchema,
    {
      page: page.toString(),
      size: size.toString(),
      sort,
    },
  );

  if (!data._embedded?.events) {
    return [];
  }

  return data._embedded.events.map((event) => event.id);
};

/**
 * Fetch event price data from Ticketmaster API
 *
 * @param event_id - Event ID to fetch price data for
 * @returns Event price data or null if not found or no price data available
 */
export const fetchEventPriceData = async (
  event_id: string,
): Promise<EventPriceData | null> => {
  const data = await TicketMasterClient.fetchValidated(
    `events/${event_id}`,
    TicketMasterEventResponseSchema,
  );

  const { priceRanges } = data;
  if (!priceRanges || priceRanges.length === 0 || !priceRanges[0]) {
    // This event doesn't have a price range yet
    return null;
  }

  // Calculate TTL based on event date
  let ttl: number;
  if (data.dates.start.dateTime) {
    const eventDateMs = Date.parse(data.dates.start.dateTime);
    ttl = Math.floor(eventDateMs / 1000) + SECONDS_PER_DAY;
  } else if (data.dates.start.localDate) {
    const eventDateMs = Date.parse(data.dates.start.localDate);
    ttl = Math.floor(eventDateMs / 1000) + SECONDS_PER_DAY;
  } else {
    // Event has no valid date, use default TTL (90 days from now)
    ttl =
      Math.floor(Date.now() / 1000) + DEFAULT_EVENT_TTL_DAYS * SECONDS_PER_DAY;
  }

  const priceRange = priceRanges[0];
  const timestamp = Date.now();

  return {
    event_id,
    timestamp,
    currency: priceRange.currency,
    min: priceRange.min,
    max: priceRange.max,
    ttl,
  };
};
