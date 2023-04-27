// EventInfoItem.tsx
/* This component is used to display information about an event.
This will be used in the home page of the site to display the results of the search. */
import React from "react";
import Image from "next/image";
import { EventData } from "@utils/types/EventData";
import useMediaQuery from "@utils/usehooks-ts";

const EventInfoItem = ({ eventData }: { eventData: EventData }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const formattedDate = new Date(eventData.date).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`flex flex-${
        isMobile ? "col" : "row"
      } justify-center items-center`}
    >
      <div className={`flex-initial ${isMobile ? "" : "px-5"}`}>
        <Image
          src={eventData.imageURL}
          alt={eventData.name}
          width={300}
          height={300}
          className="rounded-lg shadow-lg h-auto"
        />
      </div>
      <div className="flex-1">
        <div
          className={`flex flex-col justify-center items-center ${
            isMobile ? "px-2" : ""
          }`}
        >
          <h1 className="text-2xl font-semibold pb-2">{eventData.name}</h1>
          <h2 className="text-xl text-gray-300">{formattedDate}</h2>
          <h2 className="text-xl/2 text-gray-300">{eventData.location}</h2>
        </div>
      </div>
    </div>
  );
};

export default EventInfoItem;
