import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { fromEnv } from "@aws-sdk/credential-providers";
import "server-only";
import { z } from "zod";

const schema = z.object({
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
});
const env = schema.parse(process.env);

export const dynamoClient = new DynamoDBClient({
  credentials: fromEnv(),
  region: env.AWS_REGION,
});

export const sqsClient = new SQSClient({
  credentials: fromEnv(),
  region: env.AWS_REGION,
});
