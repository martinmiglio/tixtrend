// EventSearch.tsx
/* this component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow.
This component will display EventSearchBar and EventInfoItem components. */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";

import { EventData } from "@utils/types/EventData";
import * as analytics from "@utils/analytics";
import BlankEventInfoItem from "@components/event/BlankEventInfoItem";

const EventSearchBar = dynamic(
  () => import("@components/search/EventSearchBar")
);
const EventInfoItem = dynamic(() => import("@components/event/EventInfoItem"));

const EventSearch = () => {
  const SEARCH_TIMEOUT = 15; // seconds

  const firstResultUUID = uuidv4();

  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);

  const searchEvents = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length <= 2) {
      setEventsData([]);
      return;
    }
    setLoading(true);
    analytics.event({ action: "search", params: { searchTerm } });
    searchTerm = encodeURIComponent(searchTerm);

    const response = await fetch(`/api/find-event?keyword=${searchTerm}`);
    if (!response.ok) {
      console.error("Something went wrong fetching events");
      setEventsData([]);
      return;
    }
    const events = await response.json();
    setEventsData(events);
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      setEventsData([]);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setDisplayLoading(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, SEARCH_TIMEOUT * 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="w-full">
      <EventSearchBar onSearch={searchEvents} />
      {eventsData.length === 0 ? (
        loading && displayLoading ? (
          <div
            className="my-2 shadow-lg rounded-md hover:shadow-xl sm:pb-4"
            key={firstResultUUID}
          >
            <BlankEventInfoItem />
          </div>
        ) : (
          <></>
        )
      ) : (
        eventsData.map((eventData, index) => (
          <div
            className="my-2 shadow-lg rounded-md hover:shadow-xl sm:pb-4"
            key={index == 0 ? firstResultUUID : eventData.id}
          >
            <Link href={`/event/${eventData.id}`} passHref>
              <EventInfoItem eventData={eventData} />
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default EventSearch;
