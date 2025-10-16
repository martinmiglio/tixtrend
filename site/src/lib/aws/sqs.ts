import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst";

const client = new SQSClient({});

export const sendEventToQueue = async (event_id: string) => {
  const command = new SendMessageCommand({
    QueueUrl: Resource.PricePollQueue.url,
    MessageBody: event_id,
    MessageGroupId: "1", // Required for FIFO queues
  });

  return await client.send(command);
};
