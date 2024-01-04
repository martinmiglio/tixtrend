import { sqsClient } from "@/lib/aws/client";
import { DeleteMessageCommand, SendMessageCommand, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

const schema = z.object({
  PRICE_POLL_QUEUE_URL: z.string(),
});

const env = schema.parse(process.env);

export const deleteMessageByReceiptHandle = async (receiptHandle: string) => {
  const params = {
    QueueUrl: env.PRICE_POLL_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };
  const command = new DeleteMessageCommand(params);
  await sqsClient.send(command);
};


export const addEventsToQueue = async (event_ids: string[]) => {
  const params = {
    Entries: event_ids.map((event_id) => ({
      Id: event_id,
      MessageBody: event_id,
    })),
    QueueUrl: env.PRICE_POLL_QUEUE_URL,
  };
  const command = new SendMessageBatchCommand(params);
  await sqsClient.send(command);
};
