const BlankEventInfoItem = () => {
  const COLOR = "bg-gray-600";

  return (
    <div className="flex w-full flex-col items-center justify-center sm:flex-row">
      <div className="flex-initial px-0 sm:px-5">
        <div
          className={`animate-pulse ${COLOR} h-[169px] w-[300px] rounded-lg shadow-lg`}
        ></div>
      </div>
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center px-2 sm:px-0">
          <div
            className={`animate-pulse ${COLOR}  mb-2 mt-2 h-10 w-80 rounded-lg shadow-lg sm:mb-4 sm:mt-1 sm:w-96`}
          ></div>
          <div
            className={`animate-pulse ${COLOR}  mb-2 h-9 w-56 rounded-lg shadow-lg`}
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
