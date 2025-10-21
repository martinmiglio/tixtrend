import {
  SendMessageCommand,
  type SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { Resource } from "sst";

const client = new SQSClient({});

/**
 * Send an event to the SQS FIFO queue for price polling
 *
 * @param event_id - The Ticketmaster event ID to queue for polling
 * @returns The SQS SendMessage response
 *
 * @remarks
 * Uses event_id as MessageDeduplicationId to prevent duplicate messages
 * within the 5-minute deduplication window. This ensures the same event
 * is not queued multiple times during a single polling cycle.
 */
export const sendEventToQueue = async (event_id: string) => {
  const params: SendMessageCommandInput = {
    QueueUrl: Resource.PricePollQueue.url,
    MessageBody: event_id,
    MessageGroupId: "1", // Required for FIFO queues
    MessageDeduplicationId: event_id, // Use event_id for natural deduplication
  };

  const command = new SendMessageCommand(params);

  return await client.send(command);
};
