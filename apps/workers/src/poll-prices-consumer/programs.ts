import { Effect, Schedule } from "effect";
import { NoPriceDataError } from "@tixtrend/core/modules/prices";
import { EventPoller, FailureTracker, Logger } from "./services";

/**
 * Exponential backoff schedule for retries
 * - 1s, 2s, 4s, 8s... capped at 2 minutes total elapsed time
 * - Max 5 retries (cumulative: ~63s, well within Lambda timeout)
 */
export const retrySchedule = Schedule.exponential("1 second").pipe(
  Schedule.jittered,
  Schedule.upTo("2 minutes"),
  Schedule.intersect(Schedule.recurs(5))
);

// Production retry policy: exponential backoff, skip retries for permanent no-data errors
const defaultRetryPolicy = retrySchedule.pipe(
  Schedule.whileInput((error: Error) => !(error instanceof NoPriceDataError))
);

/**
 * Pure Effect program to process a single event with retry logic
 *
 * This program:
 * 1. Polls an event using the EventPoller service
 * 2. Applies a 30-second timeout
 * 3. Retries with exponential backoff on failure (skips retries for NoPriceDataError)
 * 4. Catches all errors and saves failures via FailureTracker
 * 5. Returns null for failed events after all retries
 *
 * @param retryPolicy - Override the retry schedule (useful for testing with Schedule.recurs(n))
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processEventWithRetry = (eventId: string, retryPolicy: Schedule.Schedule<any, Error, never> = defaultRetryPolicy) =>
  Effect.gen(function* () {
    const poller = yield* EventPoller;
    const tracker = yield* FailureTracker;
    const logger = yield* Logger;

    const result = yield* poller.pollEvent(eventId).pipe(
      Effect.timeout("30 seconds"),
      Effect.retry(retryPolicy),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          // Log the error
          yield* logger.error(`Event ${eventId} failed after all retries:`, error);

          // Save failure synchronously using Effect
          yield* tracker
            .saveFailure(eventId, {
              _tag: error instanceof NoPriceDataError ? "NoPriceDataError" : "ProcessingError",
              eventId,
              cause: error,
            })
            .pipe(
              Effect.catchAll((saveError) =>
                Effect.gen(function* () {
                  yield* logger.error(
                    `Failed to save failure for ${eventId}:`,
                    saveError
                  );
                  // Don't fail the whole process if failure tracking fails
                  return yield* Effect.succeed(undefined);
                })
              )
            );

          // Return null to indicate failure
          return null;
        })
      )
    );

    return result;
  });

/**
 * Pure Effect program to process a batch of events with concurrency control
 *
 * This program:
 * 1. Logs the batch size
 * 2. Processes events with max 5 concurrent operations
 * 3. Logs progress for each event
 * 4. Returns summary of successes and failures
 *
 * @param retryPolicy - Override the retry schedule (useful for testing with Schedule.recurs(n))
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processBatch = (eventIds: string[], retryPolicy?: Schedule.Schedule<any, Error, never>) =>
  Effect.gen(function* () {
    const logger = yield* Logger;

    yield* logger.info(
      `Processing batch of ${eventIds.length} events with max 5 concurrent`
    );

    // Process events with controlled concurrency
    const results = yield* Effect.forEach(
      eventIds,
      (eventId, index) =>
        Effect.gen(function* () {
          yield* logger.info(
            `Processing event ${index + 1}/${eventIds.length}: ${eventId}`
          );
          return yield* processEventWithRetry(eventId, retryPolicy);
        }),
      { concurrency: 5 } // Max 5 concurrent API calls
    );

    const successes = results.filter((r) => r !== null);
    const failures = results.filter((r) => r === null);

    yield* logger.info(
      `Batch complete: ${successes.length} succeeded, ${failures.length} failed`
    );

    if (successes.length > 0) {
      yield* logger.info(
        "Successfully processed:",
        successes.map((r) => r?.eventPrice?.event_id)
      );
    }

    if (failures.length > 0) {
      yield* logger.warn(
        `${failures.length} events failed and were recorded in failure tracking`
      );
    }

    return { successes, failures };
  });
