import { AppLayer } from "./layers";
import { processBatch } from "./programs";
import { Effect } from "effect";

type PriceConsumerPayload = {
  Records: Array<{ body: string; messageId: string }>;
};

/**
 * Lambda handler for direct invocation with Effect-based concurrency control
 *
 * This is a thin wrapper that:
 * 1. Extracts event IDs from invocation payload records
 * 2. Runs the processBatch Effect program with AppLayer
 * 3. Handles fatal errors at the top level
 *
 * All business logic is in programs.ts, making it testable
 */
export const handler = async (event: PriceConsumerPayload) => {
  const eventIds = event.Records.map((r) => r.body?.trim()).filter(
    (id): id is string => !!id && id.length > 0,
  );

  const program = processBatch(eventIds).pipe(Effect.provide(AppLayer));

  try {
    await Effect.runPromise(program);
  } catch (error) {
    console.error("Fatal error in batch processing:", error);
    throw error;
  }
};
