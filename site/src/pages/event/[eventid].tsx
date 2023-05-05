import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { EventData } from "@utils/types/EventData/EventData";
import PriceChart from "@components/chart/PriceChart";
import EventInfoItem from "@components/event/EventInfoItem";
import HeaderBar from "@components/page/HeaderBar";
import FooterBar from "@components/page/FooterBar";
import PageHeader from "@components/page/PageHeader";
import LoadingDots from "@components/page/LoadingDots";

const Event = ({ baseURL }: { baseURL: string }) => {
  const router = useRouter();
  const { eventid } = router.query;

  const [loadingEventData, setLoadingEventData] = useState(true);
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
            setLoadingEventData(false);
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

  if (loadingEventData || !eventData) {
    return (
      <>
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <HeaderBar noTagline />
          <div className="h-screen flex justify-center items-center">
            <LoadingDots dotSize={8} dotSeparation={6} />
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
        url={baseURL + `/event/${eventid}`}
      />
      <div className="w-full inline-flex flex-col max-w-screen-xl mx-auto p-4 md:py-8 h-screen">
        <HeaderBar noTagline />
        <div className="flex-grow w-full inline-flex flex-col justify-center items-center ">
          <div className="w-full p-5 shadow-xl rounded-md">
            <EventInfoItem eventData={eventData} showSaveButton={true} />
          </div>
          {!loadingPriceData ? (
            priceDataSet.length === 0 ? (
              <div>
                <div className="text-center text-2xl mt-10">
                  No price history yet, check back later!
                </div>
                <div className="text-center text-xl my-10 text-gray-400 font-thin">
                  Data on new events is updated once a day.
                </div>
              </div>
            ) : (
              <div className="flex-1 w-screen min-h-200">
                <PriceChart priceDataSet={priceDataSet} />
              </div>
            )
          ) : (
            <div className="flex justify-center items-center my-20">
              <LoadingDots dotSize={8} dotSeparation={6} />
            </div>
          )}
        </div>
        <div className="flex-2">
          <FooterBar />
        </div>
      </div>
    </>
  );
};

export default Event;

export async function getServerSideProps() {
  const baseURL = process.env.SITE_URL;
  return { props: { baseURL } };
}
