import "server-only";
import { z } from "zod";

const schema = z.object({
  TICKETMASTER_API_KEY: z.string(),
  TIXTREND_API_URL: z.string(),
});

const env = schema.parse(process.env);

export const watchEvent = async (event_id: string) => {
  const response = await fetch(
    env.TIXTREND_API_URL + `/watch?event_id=${event_id}`,
  );
  return response.status === 200;
};
