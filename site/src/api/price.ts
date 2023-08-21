export type PriceData = {
  id: string;
  timestamp: Date;
  max: number;
  min: number;
  average?: number;
  currency: string;
};

export const getPricesByEventId = async (event_id: string) => {
  const requestURL = new URL(`${process.env.TIXTREND_API_URL}/prices`);
  requestURL.searchParams.append("event_id", event_id);
  const response = await fetch(requestURL.toString());

  // parse the response as JSON
  const data = await response.json();

  // parse into PriceData type
  const prices: PriceData[] = data.map((price: any) => {
    return {
      id: price.id,
      timestamp: new Date(price.timestamp),
      max: price.max,
      min: price.min,
      currency: price.currency,
    };
  });
  return prices;
};
