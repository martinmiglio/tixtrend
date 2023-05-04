// EventInfoItem.tsx
/* This component is used to display information about an event.
This will be used in the home page of the site to display the results of the search. */
import React from "react";
import Image from "next/image";
import { EventData } from "@utils/types/EventData";
import SaveEventButton from "./SaveEventButton";

const EventInfoItem = ({
  eventData,
  showSaveButton,
}: {
  eventData: EventData;
  showSaveButton?: boolean;
}) => {
  const formattedDate = new Date(eventData.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center w-full">
      <div className="flex-initial px-0 sm:px-5">
        <Image
          src={eventData.imageURL}
          alt={eventData.name}
          width={300}
          height={169}
          className="rounded-lg shadow-lg h-auto"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-end">
          {showSaveButton && <SaveEventButton event={eventData} />}
        </div>
        <div className="flex flex-col justify-center items-center px-2 sm:px-0">
          <h1 className="text-2xl font-semibold pb-2">{eventData.name}</h1>
          <h2 className="text-xl text-gray-300">{formattedDate}</h2>
          <h2 className="text-xl/2 text-gray-300">{eventData.location}</h2>
        </div>
      </div>
    </div>
  );
};

export default EventInfoItem;
