// SaveEventButton.tsx
/* a button which saves an event to the user's saved events list */
/* currently functions with localStorage */

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartCirclePlus,
  faHeartCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import { event as analyticsEvent } from "@utils/analytics";
import { EventData } from "@utils/types/EventData";
import PopupNotification from "@components/page/PopupNotification";

const SaveEventButton = ({ event }: { event: EventData }) => {
  const [saved, setSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    setSaved(
      savedEvents.some((savedEvent: EventData) => savedEvent.id === event.id)
    );
  }, []);

  const saveEvent = () => {
    let savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    if (saved) {
      savedEvents = savedEvents.filter(
        (savedEvent: EventData) => savedEvent.id !== event.id
      );
    } else {
      savedEvents.push(event);
    }
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
    analyticsEvent({
      action: saved ? "unsave" : "save",
      params: { savedEventData: event },
    });
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
        className={`btn btn-primary btn-sm mt-5 sm:mt-0`}
        onClick={handleClick}
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
