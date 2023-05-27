// saved-events.tsx
/* This page displays the user's saved events. */

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { EventData } from "@utils/types/EventData";
import EventInfoItem from "@components/event/EventInfoItem";
import HeaderBar from "@components/page/HeaderBar";
import FooterBar from "@components/page/FooterBar";
import PageHeader from "@components/page/PageHeader";

const SavedEvents = ({ baseURL }: { baseURL: string }) => {
  const [savedEvents, setSavedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const localStorageSavedEvents = JSON.parse(
      localStorage.getItem("savedEvents") ?? "[]"
    );

    Promise.all(
      localStorageSavedEvents.map(async (event: EventData) => {
        const { id } = event;
        const res = await fetch(`/api/get-event?event_id=${id}`);
        return await res.json();
      })
    )
      .then((data) => {
        setSavedEvents(data);
        localStorage.setItem("savedEvents", JSON.stringify(data));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      <PageHeader
        title="Tix Trend - Saved Events"
        description="Events you have saved on Tix Trend."
        url={baseURL + `/saved-events}`}
      />
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar />
        <div className="w-full inline-flex flex-col justify-center items-center">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Saved Events
            </h2>
          </div>
          {savedEvents.length === 0 ? (
            <p className="py-20 text-lg leading-6 font-medium opacity-50">
              You have no saved events.
            </p>
          ) : (
            <div className="flex flex-col justify-center items-center w-full">
              {savedEvents.map((event: EventData) => (
                <Link
                  className="w-full p-5 shadow-xl rounded-md my-5"
                  href={`/event/${event.id}`}
                  key={event.id}
                >
                  <EventInfoItem eventData={event} showSaveButton={true} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <FooterBar />
      </div>
    </>
  );
};

export default SavedEvents;

export async function getServerSideProps() {
  const baseURL = process.env.SITE_URL;
  return { props: { baseURL } };
}
