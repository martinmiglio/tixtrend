import { dynamoClient } from "@/lib/aws/client";
import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import "server-only";
import { z } from "zod";

const schema = z.object({
  EVENT_PRICES_TABLE_NAME: z.string(),
});

const env = schema.parse(process.env);

export type PriceData = {
  id: string;
  timestamp: Date;
  max: number;
  min: number;
  average?: number;
  currency: string;
};

export const getPricesByEventId = async (event_id: string) => {
  const params = {
    TableName: env.EVENT_PRICES_TABLE_NAME,
    KeyConditionExpression: "event_id = :event_id",
    ExpressionAttributeValues: {
      ":event_id": { S: event_id },
    },
  };

  const command = new QueryCommand(params);
  const { Items } = await dynamoClient.send(command);

  if (!Items) {
    return [];
  }

  // parse into PriceData type
  const prices: PriceData[] = Items.map((price: any) => {
    return {
      id: price.S.id,
      timestamp: new Date(price.N.timestamp),
      max: price.N.max,
      min: price.N.min,
      currency: price.S.currency,
    };
  });
  return prices;
};

export const putPrice = async (price: PriceData) => {
  const params = {
    TableName: env.EVENT_PRICES_TABLE_NAME,
    Item: {
      event_id: { S: price.id },
      timestamp: { N: price.timestamp.getTime().toString() },
      max: { N: price.max.toString() },
      min: { N: price.min.toString() },
      currency: { S: price.currency },
    },
  };

  const command = new PutItemCommand(params);
  await dynamoClient.send(command);
};
