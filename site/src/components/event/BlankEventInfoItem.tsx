import useMediaQuery from "@utils/usehooks-ts";
import React from "react";

const BlankEventInfoItem = () => {
  const COLOR = "bg-gray-600";

  const isMobile = useMediaQuery("(max-width: 640px)");
  return (
    <div
      className={`flex flex-${
        isMobile ? "col" : "row"
      } justify-center items-center w-full`}
    >
      <div className={`flex-initial ${isMobile ? "" : "px-5"}`}>
        <div
          className={`animate-pulse ${COLOR} h-[169px] w-[300px] rounded-lg shadow-lg`}
        ></div>
      </div>
      <div className="flex-1">
        <div
          className={`flex flex-col justify-center items-center ${
            isMobile ? "px-2" : ""
          }`}
        >
          <div
            className={`animate-pulse ${COLOR}  h-10 w-96 rounded-lg shadow-lg mb-4`}
          ></div>
          <div
            className={`animate-pulse ${COLOR}  h-9 w-56 rounded-lg shadow-lg mb-2`}
          ></div>
          <div
            className={`animate-pulse ${COLOR}  h-6 w-80 rounded-lg shadow-lg`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BlankEventInfoItem;
