"use client";

import React, { useEffect, useState } from "react";
import { PriceData } from "@/utils/types/PriceData/PriceData";
import { EventData } from "@/utils/types/EventData/EventData";
import PriceChart from "@/components/chart/PriceChart";
import EventInfoItem from "@/components/event/EventInfoItem";
import LoadingDots from "@/components/page/LoadingDots";
import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import Link from "next/link";

const Event = ({ params }: { params: { eventid: string[] } }) => {
  const { eventid } = params;

  const [loadingPriceData, setLoadingPriceData] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [priceDataSet, setPriceDataSet] = useState<PriceData[]>([]);

  const fetchPriceDataSet = () => {
    fetch(`/api/get-prices?event_id=${eventid}`).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          for (const element of data) {
            element.timestamp = new Date(element.timestamp);
          }
          setPriceDataSet(data);
        });
      } else {
        setPriceDataSet([]);
      }
      setLoadingPriceData(false);
    });
  };

  useEffect(() => {
    if (eventid) {
      fetch(`/api/get-event?event_id=${eventid}`).then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            setEventData(data);
          });
        } else {
          console.error("Something went wrong getting event");
        }
      });
      fetch(`/api/watch-event?event_id=${eventid}`).then((response) => {
        if (response.status === 200) {
          fetchPriceDataSet();
        } else {
          console.error("Something went wrong watching event");
        }
      });
    }
  }, [eventid]);

  if (!eventData) {
    return (
      <div className="w-full p-5 shadow-xl rounded-md">
        <BlankEventInfoItem />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full p-5 shadow-xl rounded-md">
        <EventInfoItem eventData={eventData} showSaveButton={true} />
      </div>
      <div className="flex-1 w-screen">
        {!loadingPriceData ? (
          priceDataSet.length === 0 ? (
            eventData?.date < new Date() ? (
              <>
                <div className="text-center text-2xl mt-10">
                  Event has already passed.
                </div>
                <div className="text-center  my-10">
                  <Link
                    className="text-xl text-gray-400 font-thin underline hover:no-underline"
                    href="/"
                  >
                    Look for other events
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-2xl mt-10">
                  No price history yet, check back later!
                </div>
                <div className="text-center text-xl my-10 text-gray-400 font-thin">
                  Data on new events is updated once a day.
                </div>
              </>
            )
          ) : (
            <PriceChart priceDataSet={priceDataSet} />
          )
        ) : (
          <div className="flex justify-center items-center my-20">
            <LoadingDots dotSize={8} dotSeparation={6} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;
