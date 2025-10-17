import type { EventPriceData, PriceData } from "./types";
import { queryEventPrices } from "@/lib/aws/dynamo";
import { createServerFn } from "@tanstack/react-start";

export const getPrices = createServerFn({ method: "GET" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(async ({ data }) => {
    const { event_id } = data;

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
  });
