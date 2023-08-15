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
        <div className="absolute right-0 top-0">
          <div
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-200 p-4 shadow-lg"
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
