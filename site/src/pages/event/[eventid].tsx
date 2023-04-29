import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { EventData } from "@utils/types/EventData/EventData";
import useWindowDimensions from "@components/helpers/WindowDimensions";
import PriceTable from "@components/chart/PriceTable";
import PriceChart from "@components/chart/PriceChart";
import EventInfoItem from "@components/EventInfoItem";
import HeaderBar from "@components/HeaderBar";
import FooterBar from "@components/FooterBar";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoadingWatched, setIsLoadingWatched] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [priceDataSet, setPriceDataSet] = useState<PriceData[]>([]);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

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
        console.error("Something went wrong getting prices");
      }
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
          response.json().then((data) => {
            setIsWatched(data.watched);
            fetchPriceDataSet();
            setIsLoadingWatched(false);
          });
        } else {
          console.error("Something went wrong watching event");
        }
      });
    }
  }, [eventid]);

  if (!eventData) {
    return <></>;
  }

  if (priceDataSet.length > 0) {
    return (
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar noTagline />
        <div className="w-full inline-flex flex-col justify-center items-center">
          <div className="w-full p-5">
            <EventInfoItem eventData={eventData} />
          </div>
          <PriceChart
            priceDataSet={priceDataSet}
            height={windowHeight * 0.5}
            width={windowWidth}
          />
        </div>
        <FooterBar />
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
      <HeaderBar noTagline />
      <div className="w-full p-5">
        <EventInfoItem eventData={eventData} />
      </div>
      {!isLoadingWatched &&
        (isWatched ? (
          <div className="text-center text-2xl">
            This event is being tracked. Waiting for data for event {eventid}...
            Check back later!
          </div>
        ) : (
          <div className="text-center text-2xl">
            Now Tracking event {eventid}...
          </div>
        ))}
      <FooterBar />
    </div>
  );
};

export default Event;
