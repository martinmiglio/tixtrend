// EventSearch.tsx
/* this component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow.
This component will display EventSearchBar and EventInfoItem components. */

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import BlankEventInfoItem from "@components/event/BlankEventInfoItem";
import { EventData } from "@utils/types/EventData";

const EventSearchBar = dynamic(
  () => import("@components/search/EventSearchBar")
);
const EventInfoItem = dynamic(() => import("@components/event/EventInfoItem"));

const EventSearch = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = async () => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await fetch(
      `/api/find-event?keyword=${encodedSearchTerm}&page=${searchPage}`
    );
    return response.json();
  };

  useEffect(() => {
    setSearchPage(0);
    setEventsData([]);
    if (searchTerm.length > 0) {
      const events = fetchEvents();
      events.then((data) => {
        setEventsData(data);
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchPage > 0) {
      const nextPageEvents = fetchEvents();
      nextPageEvents.then((data) => {
        if (data.length > 0) {
          setHasMore(true);
          // combine and remove duplicates
          const merged = [...eventsData, ...data].filter(
            (d: any, index: number, self: any) =>
              index === self.findIndex((e: any) => e.id === d.id)
          );
          setEventsData(merged);
        } else {
          setHasMore(false);
        }
      });
    }
  }, [searchPage]);

  return (
    <div className="w-full">
      <EventSearchBar onSearch={setSearchTerm} />
      {searchTerm.length > 0 && (
        <InfiniteScroll
          dataLength={eventsData.length}
          next={() => {
            setSearchPage(searchPage + 1);
          }}
          hasMore={hasMore}
          loader={
            <div className="my-2 shadow-lg rounded-md hover:shadow-xl sm:pb-4">
              <BlankEventInfoItem />
            </div>
          }
          endMessage={<p className="text-center">No more events</p>}
        >
          {eventsData.map((eventData, index) => (
            <div
              className="my-2 shadow-lg rounded-md hover:shadow-xl sm:pb-4"
              key={eventData.id}
            >
              <Link href={`/event/${eventData.id}`} passHref>
                <EventInfoItem eventData={eventData} />
              </Link>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default EventSearch;
