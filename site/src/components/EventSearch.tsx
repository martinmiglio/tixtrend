// EventSearch.tsx
/* this component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow.
This component will display EventSearchBar and EventInfoItem components. */

import React, { useEffect, useState } from "react";
import EventSearchBar from "./EventSearchBar";
import EventInfoItem from "./EventInfoItem";
import { EventData } from "@utils/types";

const EventSearch = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);

  const searchEvents = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length === 0) {
      setEventsData([]);
      return;
    }

    searchTerm = encodeURIComponent(searchTerm);

    const response = await fetch(`/api/find-event?keyword=${searchTerm}`);
    if (!response.ok) {
      console.error("Something went wrong fetching events");
      return;
    }
    const events = await response.json();
    setEventsData(events);
  };

  const onEventClick = (eventData: EventData) => {
    console.log("event clicked", eventData);
  };

  useEffect(() => {
    return () => {
      setEventsData([]);
    };
  }, []);

  return (
    <div className="w-screen">
      <EventSearchBar onSearch={searchEvents} />
      {!eventsData || eventsData.length === 0 ? (
        <></>
      ) : (
        eventsData.map((eventData) => (
          <div className="mb-4" key={eventData.id}>
            <EventInfoItem eventData={eventData} onEventClick={onEventClick} />
          </div>
        ))
      )}
    </div>
  );
};

export default EventSearch;
