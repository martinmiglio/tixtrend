import PriceChart from "../chart/PriceChart";
import { Link } from "@tanstack/react-router";
import type { EventData } from "@tixtrend/core";

export const EventPriceChart = ({ eventData }: { eventData: EventData }) => {
  if (eventData.date < new Date()) {
    return (
      <>
        <div className="mt-10 text-center text-2xl">
          Event has already passed.
        </div>
        <div className="my-10 text-center text-xl font-thin text-gray-400">
          <Link
            className="underline hover:no-underline"
            to="/"
            search={{ keyword: "", page: 1 }}
          >
            Look for other events
          </Link>
        </div>
      </>
    );
  }

  if (!eventData.priceHistory || eventData.priceHistory?.length === 0) {
    return (
      <>
        <div className="mt-10 text-center text-2xl">
          No price history yet, check back later!
        </div>
        <div className="my-10 text-center text-xl font-thin text-gray-400">
          Data on new events is updated once a day.
        </div>
      </>
    );
  }

  return <PriceChart priceDataSet={eventData.priceHistory} />;
};
