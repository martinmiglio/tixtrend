import { Effect, Layer } from "effect";
import { pollEventHandler } from "@tixtrend/core";
import { saveFailure as saveFailureImpl } from "@tixtrend/core/modules/prices";
import { EventPoller, FailureTracker, Logger } from "./services";

/**
 * Live implementation of EventPoller using the actual pollEventHandler
 * Wraps the promise-based API in Effect.promise
 */
export const EventPollerLive = Layer.succeed(
  EventPoller,
  EventPoller.of({
    pollEvent: (eventId) => Effect.promise(() => pollEventHandler(eventId)),
  })
);

/**
 * Live implementation of FailureTracker using actual DynamoDB
 * Wraps the promise-based saveFailure in Effect.promise
 */
export const FailureTrackerLive = Layer.succeed(
  FailureTracker,
  FailureTracker.of({
    saveFailure: (eventId, error) =>
      Effect.promise(() => saveFailureImpl(eventId, error)),
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
