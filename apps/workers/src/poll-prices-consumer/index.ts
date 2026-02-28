import type { SQSHandler } from "aws-lambda";
import { Effect } from "effect";
import { processBatch } from "./programs";
import { AppLayer } from "./layers";

/**
 * SQS consumer handler with Effect-based concurrency control
 *
 * This is a thin wrapper that:
 * 1. Extracts event IDs from SQS records
 * 2. Runs the processBatch Effect program with AppLayer
 * 3. Handles fatal errors at the top level
 *
 * All business logic is in programs.ts, making it testable
 */
export const handler: SQSHandler = async (event) => {
  const eventIds = event.Records
    .map((r) => r.body?.trim())
    .filter((id): id is string => !!id && id.length > 0);

  const program = processBatch(eventIds).pipe(Effect.provide(AppLayer));

  try {
    await Effect.runPromise(program);
  } catch (error) {
    console.error("Fatal error in batch processing:", error);
    throw error;
  }
};
