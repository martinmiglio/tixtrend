export const handler = async (event) => {
  const response = await fetch(process.env.PRICE_POLL_CONSUMER_URL, {
    method: "POST",
    body: JSON.stringify(event),
    headers: {
      "Content-Type": "application/json",
      api_key: process.env.API_KEY,
    },
  });

  return {
    statusCode: response.status,
    body: JSON.stringify(await response.json()),
  };
};
