// PopularEvents.tsx
// This component is used to display the most popular tracked events.

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { EventData } from "@utils/types/EventData";
import EventInfoItem from "./EventInfoItem";

const PopularEvents = ({ eventCount }: { eventCount?: number }) => {
  const [eventsData, setEventData] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/get-popular-events?event_count=${eventCount || 5}`).then(
      (response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            if (data && data.events && data.events.length !== 0) {
              setEventData(data.events);
              setIsLoading(false);
            }
          });
        } else {
          console.error("Something went wrong getting popular events");
        }
      }
    );
  }, [eventCount]);

  if (isLoading) {
    return <></>;
  }

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="text-3xl font-semibold">Popular Events</h1>
      {eventsData.map((eventData) => {
        return (
          <div className="w-full p-5" key={eventData.id}>
            <Link href={`/event/${eventData.id}`}>
              <EventInfoItem eventData={eventData} />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default PopularEvents;
