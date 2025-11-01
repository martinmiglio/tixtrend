import { queueEventsForPolling } from "@tixtrend/core";
import type { EventBridgeHandler } from "aws-lambda";

/**
 * EventBridge cron handler (runs daily at 10am UTC)
 * Queues watched events and popular events to SQS for price polling
 */
export const handler: EventBridgeHandler<
  "Scheduled Event",
  void,
  void
> = async (event) => {
  console.info(`Cron triggered at ${event.time}`);

  try {
    const result = await queueEventsForPolling();

    console.info(
      `Successfully queued ${result.total} events: ${result.watchList} watched, ${result.popular} popular, ${result.saleSoon} on-sale-soon`,
    );
    console.info("Event breakdown:", {
      watchList: result.watchList,
      popular: result.popular,
      saleSoon: result.saleSoon,
      total: result.total,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to queue events: ${errorMessage}`);
    console.error("Full error details:", error);
    throw error;
  }
};
