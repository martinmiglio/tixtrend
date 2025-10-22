import type { EventData } from "@tixtrend/core";
import { Button } from "@tixtrend/ui/components/button";
import { toast } from "@tixtrend/ui/lib/toast";
import { Heart } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

const SaveEventButton = ({ event }: { event: EventData }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") ?? "[]");
    setSaved(
      savedEvents.some((savedEvent: EventData) => savedEvent.id === event.id),
    );
  }, [event.id]);

  const saveEvent = () => {
    let savedEvents = JSON.parse(localStorage.getItem("savedEvents") ?? "[]");
    if (saved) {
      savedEvents = savedEvents.filter(
        (savedEvent: EventData) => savedEvent.id !== event.id,
      );
      toast.success("Event removed from your list!");
    } else {
      savedEvents.push(event);
      toast.success("Event saved to your list!");
    }
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
    setSaved(!saved);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    saveEvent();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      data-umami-event="save-event-button"
      data-umami-event-action={saved ? "remove" : "add"}
      data-umami-event-id={event.id}
    >
      <Heart className={saved ? "fill-red-500 text-red-500" : ""} />
    </Button>
  );
};

export default SaveEventButton;
