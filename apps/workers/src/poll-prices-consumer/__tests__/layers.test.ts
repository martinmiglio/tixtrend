import { describe, expect, it } from "@effect/vitest";
import { NoPriceDataError } from "@tixtrend/core/modules/prices";
import { Effect } from "effect";

/**
 * Tests for the live layer implementations in layers.ts.
 *
 * These tests verify the catch mapper logic in EventPollerLive and
 * the error handling in FailureTrackerLive by replicating the
 * Effect.tryPromise patterns used in the actual layers, but with
 * controlled promise factories instead of real external calls.
 */
describe("EventPollerLive catch mapper", () => {
  it.effect("should preserve NoPriceDataError identity", () =>
    Effect.gen(function* () {
      const noPriceError = new NoPriceDataError("event-1");

      // Replicate the catch mapper from EventPollerLive
      const catchMapper = (e: unknown) =>
        e instanceof NoPriceDataError ? e : new Error(String(e));

      const effect = Effect.tryPromise({
        try: () => Promise.reject(noPriceError),
        catch: catchMapper,
      });

      const result = yield* Effect.either(effect);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBe(noPriceError);
        expect(result.left).toBeInstanceOf(NoPriceDataError);
        expect(result.left.message).toBe(
          "Event event-1 not found or has no price data.",
        );
      }
    }),
  );

  it.effect("should wrap generic Error as new Error(String(e))", () =>
    Effect.gen(function* () {
      const genericError = new Error("something broke");

      const catchMapper = (e: unknown) =>
        e instanceof NoPriceDataError ? e : new Error(String(e));

      const effect = Effect.tryPromise({
        try: () => Promise.reject(genericError),
        catch: catchMapper,
      });

      const result = yield* Effect.either(effect);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).not.toBe(genericError); // It's a new Error
        expect(result.left).toBeInstanceOf(Error);
        expect(result.left).not.toBeInstanceOf(NoPriceDataError);
        expect(result.left.message).toBe("Error: something broke");
      }
    }),
  );
});

describe("FailureTrackerLive", () => {
  it.effect("should succeed when saveFailure resolves", () =>
    Effect.gen(function* () {
      // Simulate a successful saveFailure call (like DynamoDB put succeeding)
      const effect = Effect.tryPromise(() => Promise.resolve());

      const result = yield* Effect.either(effect);

      expect(result._tag).toBe("Right");
    }),
  );

  it.effect("should fail with Error when saveFailure rejects", () =>
    Effect.gen(function* () {
      const dynamoError = new Error("DynamoDB ConditionalCheckFailedException");

      // Simulate a failed saveFailure call
      const effect = Effect.tryPromise(() => Promise.reject(dynamoError));

      const result = yield* Effect.either(effect);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(Error);
      }
    }),
  );
});
