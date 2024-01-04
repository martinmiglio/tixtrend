import { putPrice } from "@/lib/aws/prices";
import { deleteMessageByReceiptHandle } from "@/lib/aws/queue";
import { getEventPrice } from "@/lib/tm/prcies";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  API_SECRET: z.string(),
});

const env = schema.parse(process.env);

export const POST = async (req: NextRequest) => {
  const api_key = req.headers.get("api_key");

  if (api_key !== env.API_SECRET) {
    return NextResponse.error();
  }

  const { Records } = await req.json();
  if (Records.length === 0) {
    return NextResponse.json({ message: "No events to poll." });
  }
  const { body: event_id, receiptHandle } = Records[0];

  const eventPrice = await getEventPrice(event_id);

  if (!eventPrice) {
    return NextResponse.error();
  }

  await putPrice(eventPrice);

  await deleteMessageByReceiptHandle(receiptHandle);

  return NextResponse.json({
    message: `Successfully polled event ${event_id}.`,
  });
};
