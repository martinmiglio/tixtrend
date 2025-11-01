import { pollEventHandler } from "@tixtrend/core";
import type { SQSHandler } from "aws-lambda";

/**
 * SQS consumer handler (triggered by PricePollQueue)
 * Processes batches of event IDs and polls prices from Ticketmaster
 */
export const handler: SQSHandler = async (event) => {
  console.info(`Processing ${event.Records.length} SQS messages`);

  const results = await Promise.allSettled(
    event.Records.map(async (record, index) => {
      const event_id = record.body;
      console.info(
        `Processing event ${index + 1}/${event.Records.length}: ${event_id}`,
      );

      const result = await pollEventHandler(event_id);
      console.info(`Successfully polled event ${event_id}`);

      return { event_id, result };
    }),
  );

  // Extract successes and failures with details
  const successes: string[] = [];
  const failures: { event_id: string; error: string }[] = [];

  results.forEach((r, index) => {
    const record = event.Records[index];
    if (!record) return;

    const event_id = record.body;
    if (r.status === "fulfilled") {
      successes.push(event_id);
    } else {
      failures.push({
        event_id,
        error: r.reason instanceof Error ? r.reason.message : String(r.reason),
      });
    }
  });

  // Log summary with full details
  console.info(
    `Batch processing complete: ${successes.length} succeeded, ${failures.length} failed`,
  );

  if (successes.length > 0) {
    console.info(`Successfully processed events:`, successes);
  }

  if (failures.length > 0) {
    console.error(`Failed to process events:`, failures);
    failures.forEach(({ event_id, error }) => {
      console.error(`  - Event ${event_id}: ${error}`);
    });
  }
};
