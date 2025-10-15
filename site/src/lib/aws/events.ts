export const watchEvent = async (event_id: string) => {
  const apiUrl = process.env.TIXTREND_API_URL;

  if (!apiUrl) {
    throw new Error("TIXTREND_API_URL is not defined");
  }

  const response = await fetch(`${apiUrl}/watch?event_id=${event_id}`);
  return response.status === 200;
};
