import { mockClient } from "aws-sdk-client-mock";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  type CustomMatcher,
  toHaveReceivedCommandWith,
} from "aws-sdk-client-mock-vitest";
import { sendEventToQueue } from "./sqs";

// Register the matcher
expect.extend({ toHaveReceivedCommandWith });

// TypeScript declaration for type safety
declare module "vitest" {
  interface Assertion<T> extends CustomMatcher<T> {}
  interface AsymmetricMatchersContaining extends CustomMatcher {}
}

// Mock the Resource import from SST
vi.mock("sst", () => ({
  Resource: {
    PricePollQueue: {
      url: "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue.fifo",
    },
  },
}));

const sqsMock = mockClient(SQSClient);

describe("sendEventToQueue", () => {
  beforeEach(() => {
    sqsMock.reset();
  });

  it("should send message to SQS with correct parameters including MessageDeduplicationId", async () => {
    // Arrange
    const event_id = "test-event-123";
    const mockResponse = {
      MessageId: "mock-message-id",
      MD5OfMessageBody: "mock-md5",
    };

    sqsMock.on(SendMessageCommand).resolves(mockResponse);

    // Act
    const result = await sendEventToQueue(event_id);

    // Assert
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      QueueUrl:
        "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue.fifo",
      MessageBody: event_id,
      MessageGroupId: "1",
      MessageDeduplicationId: event_id,
    });

    expect(result).toEqual(mockResponse);
  });

  it("should use event_id as MessageDeduplicationId for natural deduplication", async () => {
    // Arrange
    const event_id = "17uOvxG61kBcNgx";

    sqsMock.on(SendMessageCommand).resolves({
      MessageId: "mock-message-id",
    });

    // Act
    await sendEventToQueue(event_id);

    // Assert - Verify that MessageDeduplicationId equals the event_id
    const calls = sqsMock.commandCalls(SendMessageCommand);
    expect(calls).toHaveLength(1);

    const sentParams = calls[0].args[0].input;
    expect(sentParams.MessageDeduplicationId).toBe(event_id);
    expect(sentParams.MessageBody).toBe(event_id);
  });

  it("should handle SQS errors appropriately", async () => {
    // Arrange
    const event_id = "test-event-error";
    const mockError = new Error("SQS service unavailable");

    sqsMock.on(SendMessageCommand).rejects(mockError);

    // Act & Assert
    await expect(sendEventToQueue(event_id)).rejects.toThrow(
      "SQS service unavailable"
    );
  });

  it("should send message with FIFO queue parameters (MessageGroupId)", async () => {
    // Arrange
    const event_id = "fifo-test-event";

    sqsMock.on(SendMessageCommand).resolves({
      MessageId: "mock-message-id",
    });

    // Act
    await sendEventToQueue(event_id);

    // Assert - Verify FIFO-specific parameter is present
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      MessageGroupId: "1",
    });
  });

  it("should prevent duplicate messages within deduplication window", async () => {
    // Arrange
    const event_id = "duplicate-test-event";

    sqsMock.on(SendMessageCommand).resolves({
      MessageId: "mock-message-id-1",
    });

    // Act - Send the same event_id twice
    await sendEventToQueue(event_id);
    await sendEventToQueue(event_id);

    // Assert - Both calls should use the same MessageDeduplicationId
    const calls = sqsMock.commandCalls(SendMessageCommand);
    expect(calls).toHaveLength(2);

    expect(calls[0].args[0].input.MessageDeduplicationId).toBe(event_id);
    expect(calls[1].args[0].input.MessageDeduplicationId).toBe(event_id);

    // In production, SQS would reject the second message within the 5-minute window
    // but our mock doesn't enforce this behavior
  });

  it("should handle different event_id formats", async () => {
    // Arrange
    const testEventIds = [
      "vvG18Z61kBcNgx",
      "test-event-with-dashes-123",
      "EVENT_WITH_UNDERSCORES_456",
      "alphanumeric123ABC",
    ];

    sqsMock.on(SendMessageCommand).resolves({
      MessageId: "mock-message-id",
    });

    // Act & Assert
    for (const event_id of testEventIds) {
      await sendEventToQueue(event_id);

      expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
        MessageBody: event_id,
        MessageDeduplicationId: event_id,
      });
    }

    expect(sqsMock.commandCalls(SendMessageCommand)).toHaveLength(
      testEventIds.length
    );
  });
});
