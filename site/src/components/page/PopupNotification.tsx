// PopupNotification.tsx
/* a popup notificaiton which appears in the botttom middle of the screen */

import React, { useState, useEffect } from "react";

const PopupNotification = ({
  isActive,
  setIsActiveCallback,
  children,
}: {
  isActive: boolean;
  setIsActiveCallback?: (isActive: boolean) => void;
  children: React.ReactNode;
}) => {
  const popupDuration = 2000;
  const [popupOpacity, setPopupOpacity] = useState(0);

  useEffect(() => {
    if (isActive) {
      setPopupOpacity(1);
      setTimeout(() => {
        setPopupOpacity(0);
        setIsActiveCallback && setIsActiveCallback(false);
      }, 0.8 * popupDuration);
    }
  }, [isActive]);

  return (
    <>
      {isActive && (
        <div className="absolute top-0 right-0">
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 rounded-lg shadow-lg p-4 z-50"
            style={{
              opacity: popupOpacity,
              transition: `opacity ${popupDuration * 0.2}ms`,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupNotification;
