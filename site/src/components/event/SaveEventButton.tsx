// SaveEventButton.tsx

/* a button which saves an event to the user's saved events list */

/* currently functions with localStorage */
"use client";

import { EventData } from "@/api/get-event";
import PopupNotification from "@/components/page/PopupNotification";
import {
  faHeartCircleCheck,
  faHeartCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";


const SaveEventButton = ({ event }: { event: EventData }) => {
  const [saved, setSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") ?? "[]");
    setSaved(
      savedEvents.some((savedEvent: EventData) => savedEvent.id === event.id),
    );
  }, []);

  const saveEvent = () => {
    let savedEvents = JSON.parse(localStorage.getItem("savedEvents") ?? "[]");
    if (saved) {
      savedEvents = savedEvents.filter(
        (savedEvent: EventData) => savedEvent.id !== event.id,
      );
    } else {
      savedEvents.push(event);
    }
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
    setSaved(!saved);
    setShowPopup(true);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    saveEvent();
  };

  return (
    <>
      <button
        type="button"
        className={`btn btn-primary btn-sm`}
        onClick={handleClick}
        data-umami-event="save-event-button"
        data-umami-event-action={saved ? "remove" : "add"}
        data-umami-event-id={event.id}
      >
        <FontAwesomeIcon
          icon={saved ? faHeartCircleCheck : faHeartCirclePlus}
          height={22}
          width={22}
        />
      </button>
      <PopupNotification
        isActive={showPopup}
        setIsActiveCallback={setShowPopup}
      >
        <p className="text-gray-800">
          {saved
            ? "Event has been saved to your list!"
            : "Event has been removed from your list!"}
        </p>
      </PopupNotification>
    </>
  );
};

export default SaveEventButton;
