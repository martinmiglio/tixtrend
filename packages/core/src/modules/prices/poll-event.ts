import { saveEventPrice } from "../../lib/aws/dynamo";
import { fetchEventPriceData } from "../../lib/ticketmaster/events";

export class NoPriceDataError extends Error {
  readonly _tag = "NoPriceDataError";
  constructor(eventId: string) {
    super(`Event ${eventId} not found or has no price data.`);
    this.name = "NoPriceDataError";
  }
}

/**
 * Poll event prices from Ticketmaster and save to DynamoDB
 *
 * @param event_id - Ticketmaster event ID
 * @returns Success message and event price data
 * @throws {NoPriceDataError} If event not found or has no price data
 */
export const pollEventHandler = async (event_id: string) => {
  const eventPrice = await fetchEventPriceData(event_id);

  if (!eventPrice) {
    throw new NoPriceDataError(event_id);
  }

  await saveEventPrice(eventPrice);

  return {
    message: `Successfully polled event ${event_id}.`,
    eventPrice,
  };
};
