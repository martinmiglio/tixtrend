"use client";

import React, { useEffect, useState } from "react";
import { PriceData } from "@/utils/types/PriceData/PriceData";
import { EventData } from "@/utils/types/EventData/EventData";
import PriceChart from "@/components/chart/PriceChart";
import EventInfoItem from "@/components/event/EventInfoItem";
import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import Link from "next/link";

const Event = ({ params }: { params: { eventid: string[] } }) => {
  const { eventid } = params;

  const [eventData, setEventData] = useState<EventData | null>(null);

  const watchEvent = async () => {
    await fetch(`/api/watch-event?event_id=${eventid}`);
  };

  const getEventData = async () => {
    const eventDataPromise = fetch(`/api/get-event?event_id=${eventid}`, {
      next: { revalidate: 3600 },
    }).then((response) => {
      if (response.status === 200) {
        return response.json().then((data) => {
          data.date = new Date(data.date);
          return data;
        });
      } else {
        console.warn("Something went wrong getting event data");
        return null;
      }
    });

    const priceHistoryPromise = fetch(`/api/get-prices?event_id=${eventid}`, {
      next: { revalidate: 43200 },
    }).then((response) => {
      if (response.status === 200) {
        return response.json().then((data) => {
          for (const element of data) {
            element.timestamp = new Date(element.timestamp);
          }
          return data;
        });
      } else {
        console.warn("Something went wrong getting price data");
        return null;
      }
    });

    const [eventData, priceHistory]: [EventData | null, PriceData[] | null] =
      await Promise.all([eventDataPromise, priceHistoryPromise]).catch(
        (err) => {
          console.error(err);
          return [null, null];
        },
      );

    if (priceHistory === null || eventData === null) {
      return eventData;
    }
    return { ...eventData, priceHistory: priceHistory };
  };

  useEffect(() => {
    if (eventid) {
      getEventData().then((data) => {
        setEventData(data);
      });
      watchEvent();
    }
  }, [eventid]);

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
