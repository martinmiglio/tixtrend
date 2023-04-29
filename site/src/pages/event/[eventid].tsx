import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { EventData } from "@utils/types/EventData/EventData";
import useWindowDimensions from "@components/helpers/WindowDimensions";
import PriceChart from "@components/chart/PriceChart";
import EventInfoItem from "@components/EventInfoItem";
import HeaderBar from "@components/page/HeaderBar";
import FooterBar from "@components/page/FooterBar";
import PageHeader from "@components/page/PageHeader";

const Event = ({ baseURL }: { baseURL: string }) => {
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
    return (
      <>
        <PageHeader
          title="Event: Tix Trend"
          description="Track ticket prices over time and never miss a deal again."
          url={baseURL + `event/${eventid}`}
        />
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <HeaderBar noTagline />
          <div className="text-center text-2xl my-10">No Event Data Found</div>
        </div>
      </>
    );
  }

  if (priceDataSet.length > 0) {
    return (
      <>
        <PageHeader
          title={`Tix Trend - ${eventData.name}`}
          description={`Price History for ${eventData.name}`}
          url={baseURL + `event/${eventid}`}
        />
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <HeaderBar noTagline />
          <div className="w-full inline-flex flex-col justify-center items-center">
            <div className="w-full p-5 shadow-xl rounded-md">
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
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Tix Trend - ${eventData.name}`}
        description={`Price History for ${eventData.name}`}
        url={baseURL + `event/${eventid}`}
      />
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar noTagline />
        <div className="w-full p-5 shadow-xl rounded-md">
          <EventInfoItem eventData={eventData} />
        </div>
        {!isLoadingWatched &&
          (isWatched ? (
            <div className="text-center text-2xl my-10">
              This event is being tracked. Waiting for data for event...
            </div>
          ) : (
            <div className="text-center text-2xl my-10">
              Now Tracking event... Check back later for price history!
            </div>
          ))}
        <div className="text-center text-xl my-10 text-gray-400">
          Check back later for price history!
        </div>
        <FooterBar />
      </div>
    </>
  );
};

export default Event;

export async function getStaticProps() {
  const baseURL = process.env.SITE_URL;
  return { props: { baseURL } };
}
