import EventInfoItem from "@/components/event/EventInfoItem";
import { getEvent } from "@/server/event-functions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@tixtrend/ui/components/badge";
import type { EventData } from "@tixtrend/core";
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
      <div className="lg:text-center mb-6">
        <Badge variant="default" className="text-base px-3 py-1">
          Saved Events
        </Badge>
      </div>
      {savedEvents.length === 0 ? (
        <p className="py-20 text-lg font-medium leading-6 text-muted-foreground">
          You have no saved events.
        </p>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          {savedEvents.map((event: EventData) => (
            <Link
              className="w-full"
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
