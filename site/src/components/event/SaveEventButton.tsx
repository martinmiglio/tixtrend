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

const SaveEventButton = ({ event }: { event: EventData }) => {
  const popupDuration = 2000;

  const [saved, setSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupOpacity, setPopupOpacity] = useState(0);

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

  useEffect(() => {
    if (showPopup) {
      setPopupOpacity(1);
      setTimeout(() => setPopupOpacity(0), 0.8 * popupDuration);
      setTimeout(() => {
        setShowPopup(false);
      }, popupDuration);
    }
  }, [showPopup]);

  return (
    <>
      <button
        type="button"
        className={`btn btn-primary btn-sm mt-5 sm:mt-0`}
        onClick={saveEvent}
      >
        <FontAwesomeIcon
          icon={saved ? faHeartCircleCheck : faHeartCirclePlus}
          height={25}
          width={25}
        />
      </button>
      {showPopup && (
        <div className="absolute top-0 right-0">
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 rounded-lg shadow-lg p-4"
            style={{
              opacity: popupOpacity,
              transition: `opacity ${popupDuration * 0.2}ms`,
            }}
          >
            <p className="text-gray-800">
              {saved
                ? "Event has been saved to your list!"
                : "Event has been removed from your list!"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveEventButton;
