/**
 * Constants for Ticketmaster event handling
 */

/**
 * Default TTL (Time To Live) in days for events without dates.
 * Used when an event has TBA/TBD dates and we cannot calculate
 * a TTL based on the actual event date.
 */
export const DEFAULT_EVENT_TTL_DAYS = 90;

/**
 * Number of seconds in a day, used for TTL calculations.
 */
export const SECONDS_PER_DAY = 60 * 60 * 24;
