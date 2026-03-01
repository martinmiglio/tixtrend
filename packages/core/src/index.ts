// =============================================================================
// PUBLIC API - Business Logic Handlers
// =============================================================================

/**
 * Event management handlers
 */
export { getEventsForPolling } from "./modules/events/get-events-for-polling";
export { watchEventHandler } from "./modules/events/watch-event";
export { findEventHandler } from "./modules/events/find-event";
export { getEventHandler } from "./modules/events/get-event";

/**
 * Price polling handlers
 */
export { pollEventHandler } from "./modules/prices/poll-event";
export { getPricesHandler } from "./modules/prices/get-prices";

// =============================================================================
// PUBLIC API - Types
// =============================================================================

/**
 * Price data types
 */
export type { PriceData, EventPriceData } from "./modules/prices/types";

/**
 * Ticketmaster event types
 */
export type {
  TicketMasterEventResponse,
  TicketMasterSearchResponse,
  EventImageData,
} from "./lib/ticketmaster/types";

/**
 * Transformed event data type (returned by handlers)
 */
export type { EventData } from "./lib/ticketmaster/events";

// =============================================================================
// INTERNAL ONLY - Not exported
// =============================================================================
// The following modules are internal implementation details:
// - lib/aws/dynamo (DynamoDB operations)
// - lib/ticketmaster/client (HTTP client)
// - lib/ticketmaster/events (Ticketmaster API calls)
// - lib/ticketmaster/schemas (Zod validation schemas)
//
// Consumers (site, workers) should only use the handlers above.
// Internal refactoring of these modules will not affect the public API.
