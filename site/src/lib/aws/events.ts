import { dynamoClient } from "@/lib/aws/client";
import TicketMasterClient from "@/lib/tm/client";
import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { z } from "zod";

const schema = z.object({
  WATCHED_EVENTS_TABLE_NAME: z.string(),
});

const env = schema.parse(process.env);

export const watchEvent = async (event_id: string): Promise<boolean> => {
  const params = {
    TableName: env.WATCHED_EVENTS_TABLE_NAME,
    Key: { event_id: { S: event_id } },
  };
  const command = new GetItemCommand(params);
  const { Item } = await dynamoClient.send(command);

  if (Item) {
    const params = {
      TableName: env.WATCHED_EVENTS_TABLE_NAME,
      Key: { event_id: { S: event_id } },
      UpdateExpression: "set watch_count = watch_count + :val",
      ExpressionAttributeValues: {
        ":val": { N: "1" },
      },
    };
    const command = new UpdateItemCommand(params);
    await dynamoClient.send(command);

    return true;
  }

  try {
    const data = await TicketMasterClient.fetch(`events/${event_id}`);

    const timestamp = Date.now();
    const ttl =
      Math.floor(Date.parse(data.dates.start.dateTime) / 1000) + 60 * 60 * 24;

    const params = {
      TableName: env.WATCHED_EVENTS_TABLE_NAME,
      Item: {
        event_id: { S: event_id },
        watch_count: { N: "1" },
        timestamp: { N: timestamp.toString() },
        ttl: { N: ttl.toString() },
      },
    };
    const command = new PutItemCommand(params);
    await dynamoClient.send(command);

    return true;
  } catch (e) {
    return false;
  }
};

export const getAllEvents = async (): Promise<
  {
    event_id?: string;
    watch_count?: number;
  }[]
> => {
  const params = {
    TableName: env.WATCHED_EVENTS_TABLE_NAME,
  };
  const command = new ScanCommand(params);
  const { Items } = await dynamoClient.send(command);

  if (!Items) {
    return [];
  }

  return Items.map((item) => {
    return {
      event_id: item.event_id.S,
      watch_count: item.watch_count.N
        ? parseInt(item.watch_count.N)
        : undefined,
    };
  });
};
