/**
 * Valibot validation schemas for Ticketmaster Discovery API v2
 *
 * These schemas provide runtime validation to ensure API responses
 * match expected structure, catching API changes early.
 *
 * ## Validation Strategy
 *
 * The schemas are designed to be **minimal but accurate**, validating only
 * the fields we actually use in the codebase. This provides several benefits:
 *
 * 1. **Resilience**: Missing optional fields won't break validation
 * 2. **Performance**: Faster validation with smaller schemas
 * 3. **Maintainability**: Less surface area to maintain as API evolves
 *
 * ### Validation Modes
 *
 * The client supports two validation modes (via TICKETMASTER_VALIDATION_MODE):
 *
 * - **STRICT** (default): Throws TicketmasterValidationError on schema mismatch
 * - **SOFT**: Logs warnings and continues with best-effort data parsing
 *
 * ### Schema Design Principles
 *
 * - Only `id` and `name` are required fields for most entities
 * - Most fields are optional (`v.optional()`) to handle API variations
 * - Nested objects match actual API structure with optional chaining in code
 * - Arrays use `v.array()` with item schemas for consistency
 *
 * ### Known API Behaviors
 *
 * - **Dates**: `dateTime` may be missing for TBA/TBD events; use `localDate` fallback
 * - **Venues**: May be missing or empty; code uses `?.[0]?.name ?? "TBA"`
 * - **Price Ranges**: Optional and may not exist for all events
 * - **Images**: Always present as array, but may be empty
 */
import * as v from "valibot";

/**
 * Event image data schema
 *
 * Note: Only `url` is required. Other fields are optional as Ticketmaster
 * API responses may omit metadata fields like ratio, width, height, or fallback.
 */
export const EventImageDataSchema = v.object({
  url: v.string(),
  ratio: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  fallback: v.optional(v.boolean()),
  attribution: v.optional(v.string()),
});

/**
 * Price range schema
 *
 * Note: type field is optional in API responses.
 */
export const PriceRangeSchema = v.object({
  type: v.optional(v.string()),
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
 *
 * Note: dateTime is optional as events may have TBA/TBD dates.
 * Use localDate, dateTBA, timeTBA, and dateTBD flags to handle such cases.
 */
export const TicketMasterEventResponseSchema = v.object({
  id: v.string(),
  name: v.string(),
  dates: v.object({
    start: v.object({
      dateTime: v.optional(v.string()),
      localDate: v.optional(v.string()),
      localTime: v.optional(v.string()),
      dateTBD: v.optional(v.boolean()),
      dateTBA: v.optional(v.boolean()),
      timeTBA: v.optional(v.boolean()),
      noSpecificTime: v.optional(v.boolean()),
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
