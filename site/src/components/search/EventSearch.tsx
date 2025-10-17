import EventInfoItem from "../event/EventInfoItem";
import EventSearchBar from "./EventSearchBar";
import BlankEventInfoItem from "@/components/event/BlankEventInfoItem";
import type { EventData } from "@/lib/ticketmaster/events";
import { findEvent } from "@/modules/events/find-event";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const EventSearch = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async () => {
    return await findEvent({
      data: { keyword: searchTerm, page: searchPage },
    });
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
            (d, index: number, self) =>
              index === self.findIndex((e) => e.id === d.id),
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
          {eventsData.map((eventData) => (
            <div
              className="my-2 rounded-md shadow-lg hover:shadow-xl sm:pb-4"
              key={eventData.id}
            >
              <Link to={`/event/$eventid`} params={{ eventid: eventData.id }}>
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
