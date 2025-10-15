import EventInfoItem from "@/components/event/EventInfoItem";
import { getEvent } from "@/domain/events/get-event";
import type { EventData } from "@/lib/tm/events";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/saved-events/")({
  head: () => ({
    meta: [
      { title: "Saved Events" },
      {
        name: "description",
        content: "View and track your saved events and ticket prices",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [savedEvents, setSavedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const localStorageSavedEvents = JSON.parse(
      localStorage.getItem("savedEvents") ?? "[]",
    );

    Promise.all(
      localStorageSavedEvents.map(async (event: EventData) => {
        const { id } = event;
        return await getEvent({ data: { event_id: id } });
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
              to="/event/$eventid"
              params={{ eventid: event.id }}
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
