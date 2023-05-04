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
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    setSavedEvents(savedEvents);
  }, []);

  return (
    <>
      <PageHeader
        title="Tix Trend - Saved Events"
        description="Events you have saved on Tix Trend."
        url={baseURL + `/saved-events}`}
      />
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar noTagline />
        <div className="w-full inline-flex flex-col justify-center items-center">
          <h1 className="text-4xl font-heading text-center pt-5 pb-10">
            Saved Events
          </h1>
          {savedEvents.length === 0 ? (
            <h2 className="text-2xl text-center pb-20">
              You have no saved events.
            </h2>
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
