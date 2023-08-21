// EventInfoItem.tsx

/* This component is used to display information about an event.
This will be used in the home page of the site to display the results of the search. */
import SaveEventButton from "./SaveEventButton";
import { EventData } from "@/api/get-event";
import Image from "next/image";

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
    <div className="flex w-full flex-col items-center justify-center sm:flex-row">
      <div className="flex-initial px-0 sm:px-5">
        <Image
          src={imageURL}
          alt={eventData.name}
          width={300}
          height={169}
          className="h-auto rounded-lg shadow-lg"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center px-2 sm:px-0">
          <div className="flex flex-row pb-2">
            <h1 className="flex-1 text-2xl font-semibold">{eventData.name}</h1>
            {showSaveButton && (
              <div className="flex items-center justify-center pl-5">
                <SaveEventButton event={eventData} />
              </div>
            )}
          </div>
          <h2 className="overflow-ellipsis whitespace-nowrap text-xl text-gray-300">
            {formattedDate}
          </h2>
          <h2 className="text-xl/2 overflow-ellipsis whitespace-nowrap text-gray-300">
            {eventData.location}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default EventInfoItem;
