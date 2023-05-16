// EventInfoItem.tsx
/* This component is used to display information about an event.
This will be used in the home page of the site to display the results of the search. */
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
  // filter out images that are not ratio=16_9
  let images = eventData.imageData.filter((image) => image.ratio === "16_9");

  // if there are no 16:9 images, use all images
  if (images.length === 0) {
    images = eventData.imageData;
  }

  // select the largest image
  const imageURL = images.reduce((prev, current) => {
    return prev.width > current.width ? prev : current;
  }).url;

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
          src={imageURL}
          alt={eventData.name}
          width={300}
          height={169}
          className="rounded-lg shadow-lg h-auto"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col justify-center items-center px-2 sm:px-0">
          <div className="flex flex-row pb-2">
            <h1 className="flex-1 text-2xl font-semibold">{eventData.name}</h1>
            {showSaveButton && (
              <div className="pl-5 flex items-center justify-center">
                <SaveEventButton event={eventData} />
              </div>
            )}
          </div>
          <h2 className="text-xl text-gray-300 whitespace-nowrap overflow-ellipsis">
            {formattedDate}
          </h2>
          <h2 className="text-xl/2 text-gray-300 whitespace-nowrap overflow-ellipsis">
            {eventData.location}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default EventInfoItem;
