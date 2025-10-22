import { queryEventPrices } from "../../lib/aws/dynamo";
import type { EventPriceData, PriceData } from "./types";

/**
 * Get price history for an event
 *
 * @param event_id - Ticketmaster event ID
 * @returns Array of price data points (empty array if no prices found)
 */
export const getPricesHandler = async (
  event_id: string,
): Promise<PriceData[]> => {
  const Items = await queryEventPrices(event_id);

  if (!Items || Items.length === 0) {
    return [];
  }

  // Parse into PriceData type
  const prices: PriceData[] = (Items as EventPriceData[]).map((price) => ({
    id: price.event_id,
    timestamp: new Date(price.timestamp),
    max: price.max,
    min: price.min,
    currency: price.currency,
  }));

  return prices;
};
