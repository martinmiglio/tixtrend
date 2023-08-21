import { getEventByID, EventData } from "@/api/event";
import { PriceData, getPricesByEventId } from "@/api/price";
import PriceChart from "@/components/chart/PriceChart";
import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import EventInfoItem from "@/components/event/EventInfoItem";
import { Metadata } from "next";
import Link from "next/link";

const Event = async ({ params }: { params: { eventid: string } }) => {
  const { eventid } = params;

  fetch(process.env.TIXTREND_API_URL + `/watch?event_id=${eventid}`);
  const eventDataPromise = getEventByID(eventid);
  const priceHistoryPromise = getPricesByEventId(eventid);
  const [eventData, priceHistory]: [EventData | null, PriceData[] | null] =
    await Promise.all([eventDataPromise, priceHistoryPromise]).catch((err) => {
      console.error(err);
      return [null, null];
    });

  if (eventData && priceHistory) {
    eventData.priceHistory = priceHistory;
  }

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
};

export default Event;

const EventPriceChart = ({ eventData }: { eventData: EventData }) => {
  if (eventData.date < new Date()) {
    return (
      <>
        <div className="mt-10 text-center text-2xl">
          Event has already passed.
        </div>
        <div className="my-10 text-center text-xl font-thin text-gray-400">
          <Link className="underline hover:no-underline" href="/">
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

export async function generateMetadata({
  params,
}: {
  params: { eventid: string };
}): Promise<Metadata> {
  const { eventid } = params;
  const eventData: EventData | null = await getEventByID(eventid);
  if (!eventData) {
    return {};
  }
  return { title: eventData.name };
}
