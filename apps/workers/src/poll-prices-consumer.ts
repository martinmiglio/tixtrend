/**
 * SQS Consumer for polling event prices
 *
 * This file re-exports the refactored handler for backward compatibility.
 * The actual implementation is in ./poll-prices-consumer/
 */
export { handler } from "./poll-prices-consumer/index";
