"use client";

import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import { EventData } from "@/lib/tm/events";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const EventSearchBar = dynamic(
  () => import("@/components/search/EventSearchBar"),
);
const EventInfoItem = dynamic(() => import("@/components/event/EventInfoItem"));

const EventSearch = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async () => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await fetch(
      `/api/find-event?keyword=${encodedSearchTerm}&page=${searchPage}`,
    );
    return response.json();
  }, [searchTerm, searchPage]);

  useEffect(() => {
    setSearchPage(0);
    setEventsData([]);
    if (searchTerm.length > 0) {
      const events = fetchEvents();
      events.then((data) => {
        setEventsData(data);
      });
    }
  }, [fetchEvents, searchTerm]);

  useEffect(() => {
    if (searchPage > 0) {
      const nextPageEvents = fetchEvents();
      nextPageEvents.then((data) => {
        if (data.length > 0) {
          setHasMore(true);
          // combine and remove duplicates
          const merged = [...eventsData, ...data].filter(
            (d: any, index: number, self: any) =>
              index === self.findIndex((e: any) => e.id === d.id),
          );
          setEventsData(merged);
        } else {
          setHasMore(false);
        }
      });
    }
  }, [eventsData, fetchEvents, searchPage]);

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
            <div className="my-2 rounded-md shadow-lg hover:shadow-xl sm:pb-4">
              <BlankEventInfoItem />
            </div>
          }
          endMessage={<p className="text-center">No more events</p>}
        >
          {eventsData.map((eventData, index) => (
            <div
              className="my-2 rounded-md shadow-lg hover:shadow-xl sm:pb-4"
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
