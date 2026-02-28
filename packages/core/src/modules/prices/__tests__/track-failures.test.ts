import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn(),
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({ send: mockSend })),
  },
  PutCommand: vi.fn((input: unknown) => ({ _input: input, _type: "Put" })),
  QueryCommand: vi.fn(
    (input: unknown) => ({ _input: input, _type: "Query" }),
  ),
}));

vi.mock("sst", () => ({
  Resource: {
    EventPollFailuresTable: { name: "test-table" },
  },
}));

import {
  saveFailure,
  getRecentFailures,
  shouldSkipEvent,
  type PollError,
} from "../track-failures.js";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({});
  vi.clearAllMocks();
});

describe("saveFailure", () => {
  it("calls dynamo.send with PutCommand containing correct fields", async () => {
    const error: PollError = { _tag: "NetworkError" };

    await saveFailure("event-123", error);

    expect(mockSend).toHaveBeenCalledOnce();
    expect(PutCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "test-table",
        Item: expect.objectContaining({
          event_id: "event-123",
          error_type: "NetworkError",
        }),
      }),
    );
    const putArg = vi.mocked(PutCommand).mock.calls[0][0];
    expect(typeof putArg.Item!.timestamp).toBe("number");
  });

  it("sets TTL to approximately 30 days from now", async () => {
    const now = Date.now();
    await saveFailure("event-123", { _tag: "NetworkError" });

    const putArg = vi.mocked(PutCommand).mock.calls[0][0];
    const expectedTtl = Math.floor(now / 1000) + 30 * 24 * 60 * 60;
    expect(putArg.Item!.ttl).toBeGreaterThanOrEqual(expectedTtl - 5);
    expect(putArg.Item!.ttl).toBeLessThanOrEqual(expectedTtl + 5);
  });

  it("uses cause.message when _tag is ProcessingError and cause is an Error", async () => {
    const error: PollError = {
      _tag: "ProcessingError",
      cause: new Error("something broke"),
    };

    await saveFailure("event-456", error);

    const putArg = vi.mocked(PutCommand).mock.calls[0][0];
    expect(putArg.Item!.error_message).toBe("something broke");
  });

  it("falls back to JSON-stringified error when cause is not an Error", async () => {
    const error: PollError = {
      _tag: "ProcessingError",
      cause: "not an error object",
    };

    await saveFailure("event-789", error);

    const putArg = vi.mocked(PutCommand).mock.calls[0][0];
    expect(putArg.Item!.error_message).toContain("ProcessingError");
    expect(putArg.Item!.error_message).toContain(JSON.stringify(error));
  });
});

describe("getRecentFailures", () => {
  it("calls QueryCommand with correct KeyConditionExpression and values", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    const now = Date.now();
    await getRecentFailures("event-123", 7);

    expect(QueryCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "test-table",
        KeyConditionExpression:
          "event_id = :event_id AND #timestamp > :cutoff",
        ExpressionAttributeValues: expect.objectContaining({
          ":event_id": "event-123",
        }),
      }),
    );
    const queryArg = vi.mocked(QueryCommand).mock.calls[0][0];
    const cutoff = queryArg.ExpressionAttributeValues![":cutoff"] as number;
    const expectedCutoff = now - 7 * 24 * 60 * 60 * 1000;
    expect(cutoff).toBeGreaterThanOrEqual(expectedCutoff - 1000);
    expect(cutoff).toBeLessThanOrEqual(expectedCutoff + 1000);
  });

  it("returns [] when Items is undefined", async () => {
    mockSend.mockResolvedValueOnce({});

    const result = await getRecentFailures("event-123");

    expect(result).toEqual([]);
  });

  it("returns mapped Items when present", async () => {
    const items = [
      {
        event_id: "event-123",
        timestamp: 1000,
        error_message: "fail",
        error_type: "NetworkError",
        ttl: 9999,
      },
    ];
    mockSend.mockResolvedValueOnce({ Items: items });

    const result = await getRecentFailures("event-123");

    expect(result).toEqual(items);
  });
});

describe("shouldSkipEvent", () => {
  it("returns true when there are 3 recent failures", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { event_id: "e", timestamp: 1, error_message: "", error_type: "", ttl: 0 },
        { event_id: "e", timestamp: 2, error_message: "", error_type: "", ttl: 0 },
        { event_id: "e", timestamp: 3, error_message: "", error_type: "", ttl: 0 },
      ],
    });

    expect(await shouldSkipEvent("e")).toBe(true);
  });

  it("returns false when there are 2 recent failures", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { event_id: "e", timestamp: 1, error_message: "", error_type: "", ttl: 0 },
        { event_id: "e", timestamp: 2, error_message: "", error_type: "", ttl: 0 },
      ],
    });

    expect(await shouldSkipEvent("e")).toBe(false);
  });

  it("returns false when there are no recent failures", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    expect(await shouldSkipEvent("e")).toBe(false);
  });
});
