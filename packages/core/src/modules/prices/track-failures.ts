import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Simple error type for tracking poll failures
 */
export type PollError = {
  _tag: string;
  eventId?: string;
  cause?: unknown;
  [key: string]: unknown;
};

/**
 * Failure record stored in DynamoDB
 */
export type FailureRecord = {
  event_id: string;
  timestamp: number;
  error_message: string;
  error_type: string;
  ttl: number;
};

/**
 * Save a poll failure to DynamoDB
 *
 * @param eventId - The event ID that failed
 * @param error - The poll error that occurred
 */
export const saveFailure = async (
  eventId: string,
  error: PollError,
): Promise<void> => {
  const timestamp = Date.now();
  // TTL: 30 days from now (for automatic cleanup)
  const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  const rawMessage =
    error._tag === "ProcessingError" && error.cause instanceof Error
      ? error.cause.message
      : `${error._tag}: ${JSON.stringify(error)}`;
  const errorMessage = rawMessage.slice(0, 200);

  await dynamo.send(
    new PutCommand({
      TableName: Resource.EventPollFailuresTable.name,
      Item: {
        event_id: eventId,
        timestamp,
        error_message: errorMessage,
        error_type: error._tag,
        ttl,
      },
    }),
  );
};

/**
 * Get recent failures for an event within the last N days
 *
 * @param eventId - The event ID to check
 * @param days - Number of days to look back (default: 7)
 * @returns Array of failure records
 */
export const getRecentFailures = async (
  eventId: string,
  days: number = 7,
): Promise<FailureRecord[]> => {
  const cutoffTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;

  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: Resource.EventPollFailuresTable.name,
      KeyConditionExpression: "event_id = :event_id AND #timestamp > :cutoff",
      ExpressionAttributeNames: {
        "#timestamp": "timestamp",
      },
      ExpressionAttributeValues: {
        ":event_id": eventId,
        ":cutoff": cutoffTimestamp,
      },
    }),
  );

  return (Items || []) as FailureRecord[];
};

/**
 * Determine if an event should be skipped based on recent failure history
 *
 * An event should be skipped if it has failed 3 or more times in the last 7 days.
 *
 * @param eventId - The event ID to check
 * @returns true if the event should be skipped, false otherwise
 */
export const shouldSkipEvent = async (eventId: string): Promise<boolean> => {
  try {
    const recentFailures = await getRecentFailures(eventId, 7);
    return recentFailures.length >= 3;
  } catch (error) {
    console.error(
      `Failed to check failures for ${eventId}, allowing event to proceed:`,
      error,
    );
    return false;
  }
};
