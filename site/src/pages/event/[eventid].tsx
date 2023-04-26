import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;

  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    if (eventid) {
      fetch(`/api/watch-event?eventid=${eventid}`).then((response) => {
        if (response.status === 409) {
          setIsWatched(true);
        } else if (response.status === 200) {
          setIsWatched(false);
        } else {
          console.error("Something went wrong watching event");
        }
      });
    }
  }, [eventid]);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl font-semibold pb-2">Event</h1>
      <h2 className="text-xl text-gray-300">{eventid}</h2>
      <h2 className="text-xl/2 text-gray-300">
        {isWatched ? "is watched" : "is not watched"}
      </h2>
    </div>
  );
};

export default Event;
