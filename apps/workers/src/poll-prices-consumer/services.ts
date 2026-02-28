import { Context, Effect } from "effect";
import type { EventPriceData } from "@tixtrend/core/modules/prices";

/**
 * Service for polling events from Ticketmaster API
 */
export interface EventPollerService {
  readonly pollEvent: (eventId: string) => Effect.Effect<
    {
      message: string;
      eventPrice: EventPriceData;
    },
    Error
  >;
}

/**
 * Service for tracking event failures in DynamoDB
 */
export interface FailureTrackerService {
  readonly saveFailure: (
    eventId: string,
    error: {
      _tag: string;
      eventId: string;
      cause: unknown;
    }
  ) => Effect.Effect<void, Error>;
}

/**
 * Service for logging operations
 */
export interface LoggerService {
  readonly info: (message: string, ...args: unknown[]) => Effect.Effect<void>;
  readonly warn: (message: string, ...args: unknown[]) => Effect.Effect<void>;
  readonly error: (message: string, ...args: unknown[]) => Effect.Effect<void>;
}

/**
 * Service tag for EventPoller using the class-extends pattern
 */
export class EventPoller extends Context.Tag("EventPoller")<
  EventPoller,
  EventPollerService
>() {}

/**
 * Service tag for FailureTracker using the class-extends pattern
 */
export class FailureTracker extends Context.Tag("FailureTracker")<
  FailureTracker,
  FailureTrackerService
>() {}

/**
 * Service tag for Logger using the class-extends pattern
 */
export class Logger extends Context.Tag("Logger")<Logger, LoggerService>() {}
