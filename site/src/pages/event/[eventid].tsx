import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EventData } from "@utils/types/EventData/EventData";
import { PriceData } from "@utils/types/PriceData/PriceData";

const PriceChart = dynamic(() => import("@components/PriceChart"), {
  ssr: false,
  loading: () => <div className="text-center text-2xl">Loading...</div>,
});

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;

  const [isWatched, setIsWatched] = useState(false);
  const [priceDataSet, setPriceDataSet] = useState<PriceData[] | null>(null);

  useEffect(() => {
    if (eventid) {
      fetch(`/api/watch-event?event_id=${eventid}`).then((response) => {
        if (response.status === 409) {
          setIsWatched(true);
        } else if (response.status === 200) {
          setIsWatched(false);
        } else {
          console.error("Something went wrong watching event");
        }
      });
    }
  }, [eventid]);

  useEffect(() => {
    if (eventid && isWatched) {
      fetch(`/api/get-prices?event_id=${eventid}`).then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            setPriceDataSet(data);
          });
        } else {
          console.error("Something went wrong getting prices");
        }
      });
    }
  }, [eventid, isWatched]);

  // if we arent watching, notify that the event is now being watched
  // if we are watching, but dont have data, notify that we are waiting for data
  // if we are watching and have data, display the price chart
  // if (!isWatched) {
  //   return <div className="text-center text-2xl">Watching event {eventid}...</div>;
  // }
  // if (!eventData) {
  //   return <div className="text-center text-2xl">Waiting for data for event {eventid}...</div>;
  // }
  // return <PriceChart eventData={eventData} />;
  // i want to do the above, but wrap them in a div with a class of w-screen
  // it should only be defined once, so we must do it like this:
  return (
    <div className="w-screen">
      {!isWatched && (
        <div className="text-center text-2xl">
          Now Tracking event {eventid}...
        </div>
      )}
      {isWatched && !priceDataSet && (
        <div className="text-center text-2xl">
          Waiting for data for event {eventid}... Check back later!
        </div>
      )}
      {priceDataSet && <PriceChart priceDataSet={priceDataSet} />}
    </div>
  );
};

export default Event;
