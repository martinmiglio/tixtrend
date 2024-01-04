"use client";

import EventInfoItem from "@/components/event/EventInfoItem";
import { EventData } from "@/lib/tm/events";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const localStorageSavedEvents = JSON.parse(
      localStorage.getItem("savedEvents") ?? "[]",
    );

    Promise.all(
      localStorageSavedEvents.map(async (event: EventData) => {
        const { id } = event;
        const res = await fetch(`/api/get-event?event_id=${id}`);
        return await res.json();
      }),
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
    <div className="inline-flex w-full flex-col items-center justify-center">
      <div className="lg:text-center">
        <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">
          Saved Events
        </h2>
      </div>
      {savedEvents.length === 0 ? (
        <p className="py-20 text-lg font-medium leading-6 opacity-50">
          You have no saved events.
        </p>
      ) : (
        <div className="flex w-full flex-col items-center justify-center">
          {savedEvents.map((event: EventData) => (
            <Link
              className="my-5 w-full rounded-md p-5 shadow-xl"
              href={`/event/${event.id}`}
              key={event.id}
            >
              <EventInfoItem eventData={event} showSaveButton={true} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
