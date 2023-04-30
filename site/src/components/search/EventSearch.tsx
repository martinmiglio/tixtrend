// EventSearch.tsx
/* this component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow.
This component will display EventSearchBar and EventInfoItem components. */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { EventData } from "@utils/types/EventData";
import * as analytics from "@utils/analytics";
import LoadingDots from "@components/page/LoadingDots";

const EventSearchBar = dynamic(
  () => import("@components/search/EventSearchBar")
);
const EventInfoItem = dynamic(() => import("@components/EventInfoItem"));

const EventSearch = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);

  const searchEvents = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length === 0) {
      setEventsData([]);
      return;
    }
    setLoading(true);
    analytics.event({ action: "search", params: { searchTerm } });
    searchTerm = encodeURIComponent(searchTerm);

    const response = await fetch(`/api/find-event?keyword=${searchTerm}`);
    if (!response.ok) {
      console.error("Something went wrong fetching events");
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

  return (
    <div className="w-full">
      <EventSearchBar onSearch={searchEvents} />
      {!eventsData || eventsData.length === 0 ? (
        loading ? (
          <div className="h-screen flex justify-center items-center">
            <LoadingDots dotSize={8} dotSeparation={6} />
          </div>
        ) : (
          <></>
        )
      ) : (
        eventsData.map((eventData) => (
          <div
            className="my-2 shadow-lg rounded-md hover:shadow-xl"
            key={eventData.id}
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
