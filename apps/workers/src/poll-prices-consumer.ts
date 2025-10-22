import { pollEventHandler } from "@tixtrend/core";
import type { SQSHandler } from "aws-lambda";

/**
 * SQS consumer handler (triggered by PricePollQueue)
 * Processes batches of event IDs and polls prices from Ticketmaster
 */
export const handler: SQSHandler = async (event) => {
  console.info(`Processing ${event.Records.length} SQS messages`);

  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      const event_id = record.body;
      console.info(`Processing event: ${event_id}`);

      const result = await pollEventHandler(event_id);
      console.info(`Successfully polled event ${event_id}`, result);

      return result;
    }),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error(`Failed to process ${failures.length} events:`, failures);
  }

  console.info(
    `Successfully processed ${results.filter((r) => r.status === "fulfilled").length} events`,
  );
};
