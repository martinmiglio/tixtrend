// Import handler after mocks are set up
import { handler } from "./cron-trigger";
import { getEventsForPolling } from "@tixtrend/core";
import type { EventBridgeEvent } from "aws-lambda";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies before importing handler
let mockLambdaSend: ReturnType<typeof vi.fn>;

vi.mock("@aws-sdk/client-lambda", () => ({
  LambdaClient: vi.fn(() => ({
    send: (...args: any[]) => mockLambdaSend(...args),
  })),
  InvokeCommand: vi.fn((input) => ({ input })),
}));

vi.mock("@tixtrend/core", () => ({
  getEventsForPolling: vi.fn(),
}));

vi.mock("sst", () => ({
  Resource: {
    PriceConsumer: {
      name: "test-price-consumer-function",
    },
  },
}));

describe("cron-trigger", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Initialize mock to default successful response
    mockLambdaSend = vi.fn().mockResolvedValue({});

    // Spy on console methods
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const createMockEvent = (
    time: string,
  ): EventBridgeEvent<"Scheduled Event", void> => ({
    version: "0",
    id: "test-id",
    "detail-type": "Scheduled Event",
    source: "aws.events",
    account: "123456789012",
    time,
    region: "us-east-1",
    resources: [],
    detail: undefined,
  });

  describe("successful execution", () => {
    it("should successfully process events and invoke Lambda in batches", async () => {
      // Mock 25 events (will create 3 batches: 10, 10, 5)
      const eventIds = Array.from({ length: 25 }, (_, i) => `event-${i}`);
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds,
        stats: {
          watchList: 10,
          popular: 10,
          saleSoon: 5,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 25,
        },
      });

      const event = createMockEvent("2025-11-10T10:00:00Z");
      await handler(event, {} as any, vi.fn() as any);

      // Verify getEventsForPolling was called
      expect(getEventsForPolling).toHaveBeenCalledOnce();

      // Verify Lambda was invoked 3 times (3 batches)
      expect(mockLambdaSend).toHaveBeenCalledTimes(3);

      // Verify first batch (10 events)
      const firstCall = mockLambdaSend.mock.calls[0]![0];
      expect(firstCall.input).toBeDefined();
      expect(firstCall.input.FunctionName).toBe("test-price-consumer-function");
      const firstPayload = JSON.parse(firstCall.input.Payload);
      expect(firstPayload.Records).toHaveLength(10);
      expect(firstPayload.Records[0].body).toBe("event-0");

      // Verify second batch (10 events)
      const secondPayload = JSON.parse(
        mockLambdaSend.mock.calls[1]![0].input.Payload,
      );
      expect(secondPayload.Records).toHaveLength(10);
      expect(secondPayload.Records[0].body).toBe("event-10");

      // Verify third batch (5 events)
      const thirdPayload = JSON.parse(
        mockLambdaSend.mock.calls[2]![0].input.Payload,
      );
      expect(thirdPayload.Records).toHaveLength(5);
      expect(thirdPayload.Records[0].body).toBe("event-20");

      // Verify logging
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Cron triggered at 2025-11-10T10:00:00Z",
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Collected 25 events: 10 watched, 10 popular, 5 on-sale-soon",
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Split into 3 batches of 10 events",
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Successfully invoked 3/3 batches",
      );
    });

    it("should handle exactly 10 events (1 batch)", async () => {
      const eventIds = Array.from({ length: 10 }, (_, i) => `event-${i}`);
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds,
        stats: {
          watchList: 10,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 10,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      expect(mockLambdaSend).toHaveBeenCalledOnce();
      const payload = JSON.parse(
        mockLambdaSend.mock.calls[0]![0].input.Payload,
      );
      expect(payload.Records).toHaveLength(10);
    });

    it("should handle single event", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      expect(mockLambdaSend).toHaveBeenCalledOnce();
      const payload = JSON.parse(
        mockLambdaSend.mock.calls[0]![0].input.Payload,
      );
      expect(payload.Records).toHaveLength(1);
      expect(payload.Records[0].body).toBe("event-1");
    });

    it("should handle empty events list", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: [],
        stats: {
          watchList: 0,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 0,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      expect(mockLambdaSend).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Collected 0 events: 0 watched, 0 popular, 0 on-sale-soon",
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Split into 0 batches of 10 events",
      );
    });

    it("should log skipped events when present", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 5,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Skipped 5 events due to recent failures (failed 3+ times in last 7 days)",
      );
    });

    it("should include correct messageId in payload", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-123", "event-456"],
        stats: {
          watchList: 2,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 2,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      const payload = JSON.parse(
        mockLambdaSend.mock.calls[0]![0].input.Payload,
      );
      expect(payload.Records[0].messageId).toBe("batch-0-event-123");
      expect(payload.Records[1].messageId).toBe("batch-0-event-456");
    });
  });

  describe("retry logic with exponential backoff", () => {
    it("should retry Lambda invocation up to 3 times with exponential backoff", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      // Mock Lambda to fail twice, then succeed
      mockLambdaSend
        .mockRejectedValueOnce(new Error("Throttled"))
        .mockRejectedValueOnce(new Error("Throttled"))
        .mockResolvedValueOnce({});

      const handlerPromise = handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);

      // Second attempt after ~1s delay (500-1000ms with jitter)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("attempt 1/3"),
      );
      await vi.advanceTimersByTimeAsync(1000);

      // Third attempt after ~2s delay (1000-2000ms with jitter)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("attempt 2/3"),
      );
      await vi.advanceTimersByTimeAsync(2000);

      // Wait for handler to complete
      await handlerPromise;

      // Verify 3 attempts were made
      expect(mockLambdaSend).toHaveBeenCalledTimes(3);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Successfully invoked 1/1 batches",
      );
    });

    it("should fail after 3 retry attempts", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      // Mock Lambda to always fail
      const error = new Error("Persistent failure");
      mockLambdaSend.mockRejectedValue(error);

      const handlerPromise = handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      // Advance through all retry delays
      await vi.advanceTimersByTimeAsync(0); // First attempt
      await vi.advanceTimersByTimeAsync(1000); // Second attempt (1s delay)
      await vi.advanceTimersByTimeAsync(2000); // Third attempt (2s delay)

      await handlerPromise;

      // Verify 3 attempts were made
      expect(mockLambdaSend).toHaveBeenCalledTimes(3);

      // Verify error logging
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to invoke batch 0 after 3 attempts:",
        error,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "1 batch invocations failed:",
        [0],
      );

      // Verify warnings for first 2 attempts
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("attempt 1/3"),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("attempt 2/3"),
      );
    });

    it("should handle mixed success and failure across multiple batches", async () => {
      // Create 3 batches
      const eventIds = Array.from({ length: 25 }, (_, i) => `event-${i}`);
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds,
        stats: {
          watchList: 25,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 25,
        },
      });

      // Mock: batch 0 succeeds, batch 1 fails, batch 2 succeeds
      mockLambdaSend
        .mockResolvedValueOnce({}) // Batch 0 succeeds
        .mockRejectedValue(new Error("Batch 1 fails")); // Batch 1 fails all attempts

      const handlerPromise = handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      // Advance through all retry attempts for failing batches
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      await handlerPromise;

      // Batch 0: 1 successful call
      // Batch 1: 3 failed calls (initial + 2 retries)
      // Batch 2: 3 failed calls (initial + 2 retries)
      expect(mockLambdaSend).toHaveBeenCalledTimes(7);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Successfully invoked 1/3 batches",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "2 batch invocations failed:",
        expect.arrayContaining([1, 2]),
      );
    });
  });

  describe("error handling", () => {
    it("should throw and log error when getEventsForPolling fails", async () => {
      const error = new Error("Database connection failed");
      vi.mocked(getEventsForPolling).mockRejectedValue(error);

      await expect(
        handler(
          createMockEvent("2025-11-10T10:00:00Z"),
          {} as any,
          vi.fn() as any,
        ),
      ).rejects.toThrow("Database connection failed");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to process events: Database connection failed",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Full error details:",
        error,
      );
      expect(mockLambdaSend).not.toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", async () => {
      vi.mocked(getEventsForPolling).mockRejectedValue("String error");

      await expect(
        handler(
          createMockEvent("2025-11-10T10:00:00Z"),
          {} as any,
          vi.fn() as any,
        ),
      ).rejects.toBe("String error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to process events: String error",
      );
    });
  });

  describe("payload structure", () => {
    it("should create correct InvokeCommand with all required fields", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      const invokeCommand = mockLambdaSend.mock.calls[0]![0];
      expect(invokeCommand.input.FunctionName).toBe(
        "test-price-consumer-function",
      );
      expect(invokeCommand.input.InvocationType).toBe("Event");
      const payload = JSON.parse(invokeCommand.input.Payload);
      expect(payload).toEqual({
        Records: [
          {
            body: "event-1",
            messageId: "batch-0-event-1",
          },
        ],
      });
    });

    it("should encode payload as JSON string", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-special-™"],
        stats: {
          watchList: 1,
          popular: 0,
          saleSoon: 0,
          skipped: 0,
          duplicatesRemoved: 0,
          total: 1,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      const invokeCommand = mockLambdaSend.mock.calls[0]![0];
      expect(typeof invokeCommand.input.Payload).toBe("string");
      const payload = JSON.parse(invokeCommand.input.Payload);
      expect(payload.Records[0].body).toBe("event-special-™");
    });
  });

  describe("logging", () => {
    it("should log event breakdown with all stats", async () => {
      vi.mocked(getEventsForPolling).mockResolvedValue({
        eventIds: ["event-1", "event-2"],
        stats: {
          watchList: 1,
          popular: 1,
          saleSoon: 0,
          skipped: 3,
          duplicatesRemoved: 0,
          total: 2,
        },
      });

      await handler(
        createMockEvent("2025-11-10T10:00:00Z"),
        {} as any,
        vi.fn() as any,
      );

      expect(consoleInfoSpy).toHaveBeenCalledWith("Event breakdown:", {
        watchList: 1,
        popular: 1,
        saleSoon: 0,
        skipped: 3,
        total: 2,
        batches: 1,
      });
    });
  });
});
