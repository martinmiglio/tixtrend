import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { PriceData } from "@utils/types/PriceData/PriceData";
import useWindowDimensions from "@components/helpers/WindowDimensions";
import PriceTable from "@components/chart/PriceTable";
import PriceChart from "@components/chart/PriceChart";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;

  const [loading, setLoading] = useState(true);
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
      fetch(`/api/watch-event?event_id=${eventid}`).then((response) => {
        if (response.status === 409) {
          setLoading(false);
          setIsWatched(true);
          fetchPriceDataSet();
        } else if (response.status === 200) {
          setLoading(false);
          setIsWatched(false);
        } else {
          console.error("Something went wrong watching event");
        }
      });
    }
  }, [eventid]);

  if (loading) {
    return <></>;
  }

  if (priceDataSet.length > 0) {
    return (
      <div className="w-screen inline-flex flex-col justify-center items-center">
        <PriceChart
          priceDataSet={priceDataSet}
          height={windowHeight * 0.5}
          width={windowWidth}
        />
        <PriceTable priceDataSet={priceDataSet} />
      </div>
    );
  }

  return (
    <div className="w-screen">
      {isWatched ? (
        <div className="text-center text-2xl">
          Waiting for data for event {eventid}... Check back later!
        </div>
      ) : (
        <div className="text-center text-2xl">
          Now Tracking event {eventid}...
        </div>
      )}
    </div>
  );
};

export default Event;
