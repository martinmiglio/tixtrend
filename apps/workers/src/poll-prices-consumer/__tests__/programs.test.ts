import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Ref } from "effect";
import { processEventWithRetry, processBatch } from "../programs";
import { EventPoller, FailureTracker, Logger } from "../services";

describe("poll-prices-consumer programs", () => {
  // Helper to create mock success result
  const createMockSuccessResult = (eventId: string) => ({
    message: `Polled ${eventId}`,
    eventPrice: {
      event_id: eventId,
      timestamp: Date.now(),
      currency: "USD",
      min: 50,
      max: 150,
      ttl: Math.floor(Date.now() / 1000) + 86400,
    },
  });

  // Minimal mock layers for simple tests
  const createMockLayers = () => {
    const mockEventPoller = Layer.succeed(
      EventPoller,
      EventPoller.of({
        pollEvent: (eventId) => Effect.succeed(createMockSuccessResult(eventId)),
      })
    );

    const mockFailureTracker = Layer.succeed(
      FailureTracker,
      FailureTracker.of({
        saveFailure: () => Effect.succeed(undefined),
      })
    );

    const mockLogger = Layer.succeed(
      Logger,
      Logger.of({
        info: () => Effect.succeed(undefined),
        warn: () => Effect.succeed(undefined),
        error: () => Effect.succeed(undefined),
      })
    );

    return Layer.mergeAll(mockEventPoller, mockFailureTracker, mockLogger);
  };

  describe("processEventWithRetry", () => {
    it.effect("should successfully process an event", () =>
      Effect.gen(function* () {
        const result = yield* processEventWithRetry("event-1");

        expect(result).toEqual(createMockSuccessResult("event-1"));
      }).pipe(Effect.provide(createMockLayers()))
    );

    it.effect("should retry on failure and eventually succeed", () =>
      Effect.gen(function* () {
        const callCount = yield* Ref.make(0);

        const retryingPoller = Layer.succeed(
          EventPoller,
          EventPoller.of({
            pollEvent: (eventId) =>
              Effect.gen(function* () {
                const count = yield* Ref.getAndUpdate(callCount, (n) => n + 1);
                if (count < 2) {
                  return yield* Effect.fail(new Error("Temporary error"));
                }
                return createMockSuccessResult(eventId);
              }),
          })
        );

        const layer = Layer.mergeAll(
          retryingPoller,
          Layer.succeed(
            FailureTracker,
            FailureTracker.of({
              saveFailure: () => Effect.succeed(undefined),
            })
          ),
          Layer.succeed(
            Logger,
            Logger.of({
              info: () => Effect.succeed(undefined),
              warn: () => Effect.succeed(undefined),
              error: () => Effect.succeed(undefined),
            })
          )
        );

        const result = yield* processEventWithRetry("event-1").pipe(
          Effect.provide(layer)
        );

        const finalCount = yield* Ref.get(callCount);
        expect(finalCount).toBe(3);
        expect(result).not.toBeNull();
      })
    );

    it.effect("should save failure after max retries", () =>
      Effect.gen(function* () {
        const saveFailureCalled = yield* Ref.make(false);
        const saveFailureEventId = yield* Ref.make("");

        const failingPoller = Layer.succeed(
          EventPoller,
          EventPoller.of({
            pollEvent: () => Effect.fail(new Error("Persistent error")),
          })
        );

        const trackingFailureTracker = Layer.succeed(
          FailureTracker,
          FailureTracker.of({
            saveFailure: (eventId, error) =>
              Effect.gen(function* () {
                yield* Ref.set(saveFailureCalled, true);
                yield* Ref.set(saveFailureEventId, eventId);
                expect(error._tag).toBe("ProcessingError");
              }),
          })
        );

        const layer = Layer.mergeAll(
          failingPoller,
          trackingFailureTracker,
          Layer.succeed(
            Logger,
            Logger.of({
              info: () => Effect.succeed(undefined),
              warn: () => Effect.succeed(undefined),
              error: () => Effect.succeed(undefined),
            })
          )
        );

        const result = yield* processEventWithRetry("event-1").pipe(
          Effect.provide(layer)
        );

        const wasCalled = yield* Ref.get(saveFailureCalled);
        const capturedEventId = yield* Ref.get(saveFailureEventId);

        expect(result).toBeNull();
        expect(wasCalled).toBe(true);
        expect(capturedEventId).toBe("event-1");
      })
    );

    it.effect("should handle saveFailure errors gracefully", () =>
      Effect.gen(function* () {
        const errorLogged = yield* Ref.make(false);

        const failingPoller = Layer.succeed(
          EventPoller,
          EventPoller.of({
            pollEvent: () => Effect.fail(new Error("API error")),
          })
        );

        const failingSaveFailure = Layer.succeed(
          FailureTracker,
          FailureTracker.of({
            saveFailure: () => Effect.fail(new Error("DynamoDB error")),
          })
        );

        const trackingLogger = Layer.succeed(
          Logger,
          Logger.of({
            info: () => Effect.succeed(undefined),
            warn: () => Effect.succeed(undefined),
            error: (message) =>
              Effect.sync(() => {
                if (message.includes("Failed to save failure")) {
                  Ref.set(errorLogged, true).pipe(Effect.runSync);
                }
              }),
          })
        );

        const layer = Layer.mergeAll(failingPoller, failingSaveFailure, trackingLogger);

        const result = yield* processEventWithRetry("event-1").pipe(
          Effect.provide(layer)
        );

        const wasLogged = yield* Ref.get(errorLogged);
        expect(result).toBeNull();
        expect(wasLogged).toBe(true);
      })
    );
  });

  describe("processBatch", () => {
    it.effect("should successfully process all events in a batch", () =>
      Effect.gen(function* () {
        const eventIds = ["event-1", "event-2", "event-3"];
        const { successes, failures } = yield* processBatch(eventIds).pipe(
          Effect.provide(createMockLayers())
        );

        expect(successes).toHaveLength(3);
        expect(failures).toHaveLength(0);
        expect(successes[0]?.eventPrice.event_id).toBe("event-1");
      })
    );

    it.effect("should handle mixed success and failure", () =>
      Effect.gen(function* () {
        const mixedPoller = Layer.succeed(
          EventPoller,
          EventPoller.of({
            pollEvent: (eventId) =>
              Effect.gen(function* () {
                if (eventId === "event-1") {
                  return createMockSuccessResult(eventId);
                }
                return yield* Effect.fail(new Error("API error"));
              }),
          })
        );

        const layer = Layer.mergeAll(
          mixedPoller,
          Layer.succeed(
            FailureTracker,
            FailureTracker.of({
              saveFailure: () => Effect.succeed(undefined),
            })
          ),
          Layer.succeed(
            Logger,
            Logger.of({
              info: () => Effect.succeed(undefined),
              warn: () => Effect.succeed(undefined),
              error: () => Effect.succeed(undefined),
            })
          )
        );

        const { successes, failures } = yield* processBatch([
          "event-1",
          "event-2",
          "event-3",
        ]).pipe(Effect.provide(layer));

        expect(successes).toHaveLength(1);
        expect(failures).toHaveLength(2);
      })
    );

    it.effect("should respect max 5 concurrent operations", () =>
      Effect.gen(function* () {
        const concurrentCalls = yield* Ref.make(0);
        const maxConcurrent = yield* Ref.make(0);

        const concurrencyTestPoller = Layer.succeed(
          EventPoller,
          EventPoller.of({
            pollEvent: (eventId) =>
              Effect.gen(function* () {
                yield* Ref.update(concurrentCalls, (n) => n + 1);
                const current = yield* Ref.get(concurrentCalls);
                yield* Ref.update(maxConcurrent, (max) => Math.max(max, current));

                // Simulate async work
                yield* Effect.sleep("10 millis");

                yield* Ref.update(concurrentCalls, (n) => n - 1);
                return createMockSuccessResult(eventId);
              }),
          })
        );

        const layer = Layer.mergeAll(
          concurrencyTestPoller,
          Layer.succeed(
            FailureTracker,
            FailureTracker.of({
              saveFailure: () => Effect.succeed(undefined),
            })
          ),
          Layer.succeed(
            Logger,
            Logger.of({
              info: () => Effect.succeed(undefined),
              warn: () => Effect.succeed(undefined),
              error: () => Effect.succeed(undefined),
            })
          )
        );

        const eventIds = Array.from({ length: 10 }, (_, i) => `event-${i}`);
        const { successes } = yield* processBatch(eventIds).pipe(
          Effect.provide(layer)
        );

        const max = yield* Ref.get(maxConcurrent);
        expect(successes).toHaveLength(10);
        expect(max).toBeLessThanOrEqual(5);
        expect(max).toBeGreaterThan(1);
      })
    );

    it.effect("should handle empty events list", () =>
      Effect.gen(function* () {
        const { successes, failures } = yield* processBatch([]).pipe(
          Effect.provide(createMockLayers())
        );

        expect(successes).toHaveLength(0);
        expect(failures).toHaveLength(0);
      })
    );

    it.effect("should log batch progress correctly", () =>
      Effect.gen(function* () {
        const loggedMessages = yield* Ref.make<string[]>([]);

        const trackingLogger = Layer.succeed(
          Logger,
          Logger.of({
            info: (message) =>
              Effect.sync(() => {
                Ref.update(loggedMessages, (msgs) => [...msgs, message as string]).pipe(
                  Effect.runSync
                );
              }),
            warn: (message) =>
              Effect.sync(() => {
                Ref.update(loggedMessages, (msgs) => [...msgs, message as string]).pipe(
                  Effect.runSync
                );
              }),
            error: () => Effect.succeed(undefined),
          })
        );

        const layer = Layer.mergeAll(
          Layer.succeed(
            EventPoller,
            EventPoller.of({
              pollEvent: (eventId) => Effect.succeed(createMockSuccessResult(eventId)),
            })
          ),
          Layer.succeed(
            FailureTracker,
            FailureTracker.of({
              saveFailure: () => Effect.succeed(undefined),
            })
          ),
          trackingLogger
        );

        yield* processBatch(["event-1", "event-2"]).pipe(Effect.provide(layer));

        const messages = yield* Ref.get(loggedMessages);
        expect(messages).toContain("Processing batch of 2 events with max 5 concurrent");
        expect(messages).toContain("Processing event 1/2: event-1");
        expect(messages).toContain("Processing event 2/2: event-2");
        expect(messages).toContain("Batch complete: 2 succeeded, 0 failed");
      })
    );
  });
});
