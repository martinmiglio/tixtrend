// EventInfoItem.tsx
/* This component is used to display information about an event.
This will be used in the home page of the site to display the results of the search. */
import React from "react";
import Image from "next/image";
import { EventData } from "@utils/types";

const EventInfoItem = ({ eventData }: { eventData: EventData }) => {
  const formattedDate = new Date(eventData.date).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-row justify-center items-center cursor-pointer hover:shadow-xl transition duration-500 ease-in-out transform hover:-translate-y-1 w-full">
      <div className="flex-initial px-5">
        <Image
          src={eventData.imageURL}
          alt={eventData.name}
          width={300}
          height={300}
          className="rounded-lg shadow-lg"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-2xl">{eventData.name}</h1>
          <h2 className="text-xl">{formattedDate}</h2>

          <h2 className="text-xl">{eventData.location}</h2>
        </div>
      </div>
    </div>
  );
};

export default EventInfoItem;
