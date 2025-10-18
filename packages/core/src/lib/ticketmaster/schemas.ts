/**
 * Valibot validation schemas for Ticketmaster Discovery API v2
 *
 * These schemas provide runtime validation to ensure API responses
 * match expected structure, catching API changes early.
 */
import * as v from "valibot";

/**
 * Event image data schema
 */
export const EventImageDataSchema = v.object({
  url: v.string(),
  ratio: v.string(),
  width: v.number(),
  height: v.number(),
  fallback: v.boolean(),
  attribution: v.optional(v.string()),
});

/**
 * Price range schema
 */
export const PriceRangeSchema = v.object({
  min: v.number(),
  max: v.number(),
  currency: v.string(),
});

/**
 * Venue schema
 */
export const VenueSchema = v.object({
  name: v.string(),
});

/**
 * Ticketmaster event response schema
 */
export const TicketMasterEventResponseSchema = v.object({
  id: v.string(),
  name: v.string(),
  dates: v.object({
    start: v.object({
      dateTime: v.string(),
    }),
  }),
  images: v.array(EventImageDataSchema),
  priceRanges: v.optional(v.array(PriceRangeSchema)),
  _embedded: v.optional(
    v.object({
      venues: v.array(VenueSchema),
    }),
  ),
});

/**
 * Ticketmaster search response schema
 */
export const TicketMasterSearchResponseSchema = v.object({
  _embedded: v.optional(
    v.object({
      events: v.optional(v.array(TicketMasterEventResponseSchema)),
    }),
  ),
});

// Export inferred types for convenience
export type EventImageData = v.InferOutput<typeof EventImageDataSchema>;
export type PriceRange = v.InferOutput<typeof PriceRangeSchema>;
export type Venue = v.InferOutput<typeof VenueSchema>;
export type TicketMasterEventResponse = v.InferOutput<
  typeof TicketMasterEventResponseSchema
>;
export type TicketMasterSearchResponse = v.InferOutput<
  typeof TicketMasterSearchResponseSchema
>;
