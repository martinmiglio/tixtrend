import TicketMasterClient from "@/lib/tm/client";

export const getEventPrice = async (event_id: string) => {
  const data = await TicketMasterClient.fetch(`events/${event_id}`);

  const { priceRanges } = data;
  if (!priceRanges) {
    // this event doesn't have a price range yet, skip for now
    return;
  }
  const { min, max, currency } = priceRanges[0];

  const timestamp = Date.now();
  const ttl =
    Math.floor(Date.parse(data.dates.start.dateTime) / 1000) + 60 * 60 * 24;

  return {
    id: event_id,
    timestamp: new Date(timestamp),
    currency,
    min,
    max,
    ttl,
  };
};
