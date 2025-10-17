import type { EventPriceData } from "@/modules/prices/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

// Watched Events Table operations

export const getWatchedEvent = async (event_id: string) => {
  const { Item } = await dynamo.send(
    new GetCommand({
      TableName: Resource.WatchedEventsTable.name,
      Key: { event_id },
    }),
  );

  return Item;
};

export const incrementWatchCount = async (event_id: string) => {
  await dynamo.send(
    new UpdateCommand({
      TableName: Resource.WatchedEventsTable.name,
      Key: { event_id },
      UpdateExpression: "set watch_count = watch_count + :val",
      ExpressionAttributeValues: {
        ":val": 1,
      },
    }),
  );
};

export const addWatchedEvent = async ({
  event_id,
  timestamp,
  ttl,
}: {
  event_id: string;
  timestamp: number;
  ttl: number;
}) => {
  await dynamo.send(
    new PutCommand({
      TableName: Resource.WatchedEventsTable.name,
      Item: {
        event_id,
        watch_count: 1,
        timestamp,
        ttl,
      },
    }),
  );
};

export const scanWatchedEvents = async () => {
  const { Items } = await dynamo.send(
    new ScanCommand({
      TableName: Resource.WatchedEventsTable.name,
      ProjectionExpression: "event_id",
    }),
  );

  return Items || [];
};

// Event Prices Table operations

export const queryEventPrices = async (event_id: string) => {
  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: Resource.EventPricesTable.name,
      KeyConditionExpression: "event_id = :event_id",
      ExpressionAttributeValues: {
        ":event_id": event_id,
      },
    }),
  );

  return Items || [];
};

export const saveEventPrice = async (eventPrice: EventPriceData) => {
  await dynamo.send(
    new PutCommand({
      TableName: Resource.EventPricesTable.name,
      Item: eventPrice,
    }),
  );
};
