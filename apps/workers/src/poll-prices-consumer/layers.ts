import { Effect, Layer } from "effect";
import { pollEventHandler } from "@tixtrend/core";
import { NoPriceDataError, saveFailure as saveFailureImpl } from "@tixtrend/core/modules/prices";
import { EventPoller, FailureTracker, Logger } from "./services";

/**
 * Live implementation of EventPoller using the actual pollEventHandler
 * Uses the object form of Effect.tryPromise with a catch mapper to preserve
 * NoPriceDataError identity — the single-arg form wraps all errors in
 * UnknownException, which would break the Schedule.whileInput filter in programs.ts.
 */
export const EventPollerLive = Layer.succeed(
  EventPoller,
  EventPoller.of({
    pollEvent: (eventId) =>
      Effect.tryPromise({
        try: () => pollEventHandler(eventId),
        catch: (e) => (e instanceof NoPriceDataError ? e : new Error(String(e))),
      }),
  })
);

/**
 * Live implementation of FailureTracker using actual DynamoDB
 * Wraps the promise-based saveFailure in Effect.tryPromise so DynamoDB
 * errors surface as typed failures rather than defects
 */
export const FailureTrackerLive = Layer.succeed(
  FailureTracker,
  FailureTracker.of({
    saveFailure: (eventId, error) =>
      Effect.tryPromise(() => saveFailureImpl(eventId, error)),
  })
);

/**
 * Live implementation of Logger using console
 * Wraps console methods in Effect.sync for side effects
 */
export const LoggerLive = Layer.succeed(
  Logger,
  Logger.of({
    info: (message, ...args) =>
      Effect.sync(() => console.info(message, ...args)),
    warn: (message, ...args) =>
      Effect.sync(() => console.warn(message, ...args)),
    error: (message, ...args) =>
      Effect.sync(() => console.error(message, ...args)),
  })
);

/**
 * Combined application layer with all services
 * Use this in the Lambda handler via Effect.provide(AppLayer)
 */
export const AppLayer = Layer.mergeAll(
  EventPollerLive,
  FailureTrackerLive,
  LoggerLive
);
