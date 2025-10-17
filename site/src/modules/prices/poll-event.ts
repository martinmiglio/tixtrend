import type { EventPriceData } from "./types";
import { saveEventPrice } from "@/lib/aws/dynamo";
import { createServerFn } from "@tanstack/react-start";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

export const pollEvent = createServerFn({ method: "POST" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(async ({ data }) => {
    const { event_id } = data;

    const eventPrice = await getEventPrice(event_id);

    if (!eventPrice) {
      throw new Error(`Event ${event_id} not found or has no price data.`);
    }

    await saveEventPrice(eventPrice);

    return {
      message: `Successfully polled event ${event_id}.`,
      eventPrice,
    };
  });

const getEventPrice = async (
  event_id: string,
): Promise<EventPriceData | null> => {
  const url = `${API_URL}/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    // if too many requests, recurse with a delay
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getEventPrice(event_id);
    }
    return null;
  }

  const data = await response.json();

  const { priceRanges } = data;
  if (!priceRanges) {
    // this event doesn't have a price range yet, skip for now
    return null;
  }
  const { min, max, currency } = priceRanges[0];

  const timestamp = Date.now();
  const ttl =
    Math.floor(Date.parse(data.dates.start.dateTime) / 1000) + 60 * 60 * 24;

  return {
    event_id,
    timestamp,
    currency,
    min,
    max,
    ttl,
  };
};
