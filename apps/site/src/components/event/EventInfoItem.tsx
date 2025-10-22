import SaveEventButton from "./SaveEventButton";
import type { EventData } from "@tixtrend/core";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@tixtrend/ui/components/card";

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
    return (prev.width ?? 0) > (current.width ?? 0) ? prev : current;
  }).url;

  const formattedDate = new Date(eventData.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex w-full flex-col items-center justify-center sm:flex-row">
        <div className="flex-initial px-0 sm:px-5">
          <img
            src={imageURL}
            alt={eventData.name}
            width={300}
            height={169}
            className="h-auto rounded-lg"
          />
        </div>
        <div className="flex-1">
          <CardHeader>
            <CardTitle className="text-2xl">{eventData.name}</CardTitle>
            {showSaveButton && (
              <CardAction>
                <SaveEventButton event={eventData} />
              </CardAction>
            )}
            <CardDescription className="text-base space-y-1">
              <div className="overflow-ellipsis whitespace-nowrap">
                {formattedDate}
              </div>
              <div className="overflow-ellipsis whitespace-nowrap">
                {eventData.location}
              </div>
            </CardDescription>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
};

export default EventInfoItem;
