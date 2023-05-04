import React from "react";

const BlankEventInfoItem = () => {
  const COLOR = "bg-gray-600";

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center w-full">
      <div className="flex-initial px-0 sm:px-5">
        <div
          className={`animate-pulse ${COLOR} h-[169px] w-[300px] rounded-lg shadow-lg`}
        ></div>
      </div>
      <div className="flex-1">
        <div className="flex flex-col justify-center items-center px-2 sm:px-0">
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
