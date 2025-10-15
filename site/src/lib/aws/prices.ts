export type PriceData = {
  id: string;
  timestamp: Date;
  max: number;
  min: number;
  average?: number;
  currency: string;
};

export const getPricesByEventId = async (event_id: string) => {
  const apiUrl = process.env.TIXTREND_API_URL;

  if (!apiUrl) {
    throw new Error("TIXTREND_API_URL is not defined");
  }

  const requestURL = new URL(`${apiUrl}/prices`);
  requestURL.searchParams.append("event_id", event_id);
  const response = await fetch(requestURL.toString());

  // parse the response as JSON
  const data = await response.json();

  // parse into PriceData type
  // biome-ignore lint/suspicious/noExplicitAny: <TODO, replace with proper type>
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
