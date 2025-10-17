import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import EventInfoItem from "@/components/event/EventInfoItem";
import { EventPriceChart } from "@/components/event/PriceChart";
import { createFileRoute } from "@tanstack/react-router";
import {
  getEventHandler,
  getPricesHandler,
  watchEventHandler,
} from "@tixtrend/core";

export const Route = createFileRoute("/event/$eventid")({
  ssr: "data-only",
  loader: async ({ params }) => {
    const { eventid } = params;

    // Call handlers directly - loader runs on server
    watchEventHandler(eventid);
    const eventDataPromise = getEventHandler(eventid);
    const priceHistoryPromise = getPricesHandler(eventid);

    const [eventData, priceHistory] = await Promise.all([
      eventDataPromise,
      priceHistoryPromise,
    ]);

    if (eventData && priceHistory) {
      eventData.priceHistory = priceHistory;
    }

    return { eventData };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.eventData) {
      return {
        meta: [
          { title: "Event Not Found" },
          { name: "description", content: "The requested event was not found" },
        ],
      };
    }

    const { eventData } = loaderData;
    const eventTitle = eventData.name;
    const eventDescription = `Track ticket prices for ${eventData.name}${
      eventData.location ? ` at ${eventData.location}` : ""
    }${
      eventData.date
        ? ` on ${new Date(eventData.date).toLocaleDateString()}`
        : ""
    }`;
    const eventImage =
      eventData.imageData?.[0]?.url ??
      "https://tixtrend.martinmiglio.dev/og?v1";

    return {
      meta: [
        { title: eventTitle },
        { name: "description", content: eventDescription },
        // OpenGraph
        { property: "og:title", content: eventTitle },
        { property: "og:description", content: eventDescription },
        { property: "og:image", content: eventImage },
        { property: "og:type", content: "website" },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: eventTitle },
        { name: "twitter:description", content: eventDescription },
        { name: "twitter:image", content: eventImage },
      ],
    };
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
