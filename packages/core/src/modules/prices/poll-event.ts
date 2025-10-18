import { saveEventPrice } from "../../lib/aws/dynamo";
import { fetchEventPriceData } from "../../lib/ticketmaster/events";

/**
 * Poll event prices from Ticketmaster and save to DynamoDB
 *
 * @param event_id - Ticketmaster event ID
 * @returns Success message and event price data
 * @throws {Error} If event not found or has no price data
 */
export const pollEventHandler = async (event_id: string) => {
  const eventPrice = await fetchEventPriceData(event_id);

  if (!eventPrice) {
    throw new Error(`Event ${event_id} not found or has no price data.`);
  }

  await saveEventPrice(eventPrice);

  return {
    message: `Successfully polled event ${event_id}.`,
    eventPrice,
  };
};
