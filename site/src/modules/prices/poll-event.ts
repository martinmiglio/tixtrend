import { saveEventPrice } from "@/lib/aws/dynamo";
import { fetchEventPriceData } from "@/lib/ticketmaster/events";
import { createServerFn } from "@tanstack/react-start";

export const pollEvent = createServerFn({ method: "POST" })
  .inputValidator((data: { event_id: string }) => data)
  .handler(async ({ data }) => {
    const { event_id } = data;

    const eventPrice = await fetchEventPriceData(event_id);

    if (!eventPrice) {
      throw new Error(`Event ${event_id} not found or has no price data.`);
    }

    await saveEventPrice(eventPrice);

    return {
      message: `Successfully polled event ${event_id}.`,
      eventPrice,
    };
  });
