import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { getEventsForPolling } from "@tixtrend/core";
import type { EventBridgeHandler } from "aws-lambda";
import { Resource } from "sst";

const lambda = new LambdaClient({});
const BATCH_SIZE = 10;
const MAX_INVOCATION_RETRIES = 3;

/**
 * Helper function to invoke Lambda with exponential backoff retry
 */
async function invokeLambdaWithRetry(
  batch: string[],
  batchIndex: number,
  retryCount = 0,
): Promise<{ success: true; batch: number } | { success: false; batch: number; error: unknown }> {
  try {
    await lambda.send(
      new InvokeCommand({
        FunctionName: Resource.PriceConsumer.name,
        InvocationType: "Event", // Async invocation
        Payload: Buffer.from(
          JSON.stringify({
            Records: batch.map((eventId) => ({
              body: eventId,
              messageId: `batch-${batchIndex}-${eventId}`,
            })),
          }),
          "utf8",
        ),
      }),
    );
    return { success: true, batch: batchIndex };
  } catch (error) {
    const isLastRetry = retryCount >= MAX_INVOCATION_RETRIES - 1;

    if (isLastRetry) {
      console.error(
        `Failed to invoke batch ${batchIndex} after ${MAX_INVOCATION_RETRIES} attempts:`,
        error,
      );
      return { success: false, batch: batchIndex, error };
    }

    // Exponential backoff: 1s, 2s, 4s
    const delayMs = Math.pow(2, retryCount) * 1000;
    console.warn(
      `Failed to invoke batch ${batchIndex} (attempt ${retryCount + 1}/${MAX_INVOCATION_RETRIES}), retrying in ${delayMs}ms...`,
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return invokeLambdaWithRetry(batch, batchIndex, retryCount + 1);
  }
}

/**
 * EventBridge cron handler (runs daily at 10am UTC)
 * Collects events and directly invokes consumer Lambda in batches
 */
export const handler: EventBridgeHandler<
  "Scheduled Event",
  void,
  void
> = async (event) => {
  console.info(`Cron triggered at ${event.time}`);

  try {
    // Collect all event IDs (with failure filtering)
    const result = await getEventsForPolling();

    console.info(
      `Collected ${result.stats.total} events: ${result.stats.watchList} watched, ${result.stats.popular} popular, ${result.stats.saleSoon} on-sale-soon`,
    );

    if (result.stats.skipped > 0) {
      console.info(
        `Skipped ${result.stats.skipped} events due to recent failures (failed 3+ times in last 7 days)`,
      );
    }

    // Chunk into batches of 10
    const batches: string[][] = [];
    for (let i = 0; i < result.eventIds.length; i += BATCH_SIZE) {
      batches.push(result.eventIds.slice(i, i + BATCH_SIZE));
    }

    console.info(`Split into ${batches.length} batches of ${BATCH_SIZE} events`);

    // Invoke consumer Lambda for each batch (async invocation with retry)
    const invocations = batches.map((batch, index) =>
      invokeLambdaWithRetry(batch, index),
    );

    // Wait for all invocations to be queued
    const invocationResults = await Promise.all(invocations);
    const successful = invocationResults.filter((r) => r.success).length;

    console.info(
      `Successfully invoked ${successful}/${batches.length} batches`,
    );

    console.info("Event breakdown:", {
      watchList: result.stats.watchList,
      popular: result.stats.popular,
      saleSoon: result.stats.saleSoon,
      skipped: result.stats.skipped,
      total: result.stats.total,
      batches: batches.length,
    });

    // Report failed invocations
    const failed = invocationResults.filter((r) => !r.success);
    if (failed.length > 0) {
      console.error(
        `${failed.length} batch invocations failed:`,
        failed.map((f) => f.batch),
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process events: ${errorMessage}`);
    console.error("Full error details:", error);
    throw error;
  }
};
