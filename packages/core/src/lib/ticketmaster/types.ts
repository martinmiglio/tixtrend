/**
 * Ticketmaster Discovery API v2 types
 */

export type EventImageData = {
  url: string;
  ratio?: string; // ratio is string enum (16_9, 3_2, or 4_3) - optional
  width?: number;
  height?: number;
  fallback?: boolean;
  attribution?: string;
};

export type TicketMasterEventResponse = {
  id: string;
  name: string;
  url?: string;
  dates: {
    start: {
      dateTime: string;
    };
  };
  images: EventImageData[];
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  _embedded?: {
    venues: Array<{ name: string }>;
  };
};

export type TicketMasterSearchResponse = {
  _embedded?: {
    events?: TicketMasterEventResponse[];
  };
};
