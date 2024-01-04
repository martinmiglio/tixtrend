import { getAllEvents } from "@/lib/aws/events";
import { addEventsToQueue } from "@/lib/aws/queue";
import { getPopularEvents, getSaleSoonEvents } from "@/lib/tm/events";
import { NextRequest } from "next/server";

const MAX_QUEUE_LENGTH = 4000;

export async function GET(req: NextRequest) {
  const toQueue = (await getAllEvents())
    .map((event) => event.event_id)
    .filter((event_id) => event_id !== undefined) as string[];

  if (toQueue.length < MAX_QUEUE_LENGTH) {
    toQueue.push(
      ...(await getPopularEvents(MAX_QUEUE_LENGTH - toQueue.length)),
    );
  }

  if (toQueue.length < MAX_QUEUE_LENGTH) {
    toQueue.push(
      ...(await getSaleSoonEvents(MAX_QUEUE_LENGTH - toQueue.length)),
    );
  }

  await addEventsToQueue(toQueue);
}
