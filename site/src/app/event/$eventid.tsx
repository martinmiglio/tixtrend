import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import EventInfoItem from "@/components/event/EventInfoItem";
import { EventPriceChart } from "@/components/event/PriceChart";
import { watchEvent } from "@/lib/aws/events";
import { getPricesByEventId } from "@/lib/aws/prices";
import { getEventByID } from "@/lib/tm/events";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/event/$eventid")({
  ssr: "data-only",
  loader: async ({ params }) => {

    const { eventid } = params;
    watchEvent(eventid);
    const eventDataPromise = getEventByID(eventid);
    const priceHistoryPromise = getPricesByEventId(eventid);
    const [eventData, priceHistory] = await Promise.all([
      eventDataPromise,
      priceHistoryPromise,
    ]);

    if (eventData && priceHistory) {
      eventData.priceHistory = priceHistory;
    }

    return { eventData };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { eventData } = Route.useLoaderData();

  if (!eventData) {
    return (
      <div className="w-full rounded-md p-5 shadow-xl">
        <BlankEventInfoItem />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full rounded-md p-5 shadow-xl">
        <EventInfoItem eventData={eventData} showSaveButton={true} />
      </div>
      <div className="w-screen flex-grow">
        <EventPriceChart eventData={eventData} />
      </div>
    </div>
  );
}
