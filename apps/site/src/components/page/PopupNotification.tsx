// PopupNotification.tsx
/* a popup notificaiton which appears in the botttom middle of the screen */
import type React from "react";
import { useRef, useEffect, useCallback } from "react";

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
  const elRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const dismiss = useCallback(() => {
    if (elRef.current) {
      elRef.current.style.opacity = "0";
    }
    setIsActiveCallback?.(false);
  }, [setIsActiveCallback]);

  useEffect(() => {
    if (isActive) {
      if (elRef.current) {
        elRef.current.style.opacity = "1";
      }
      timerRef.current = setTimeout(dismiss, 0.8 * popupDuration);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, dismiss]);

  return (
    <>
      {isActive && (
        <div className="absolute right-0 top-0">
          <div
            ref={elRef}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-200 p-4 shadow-lg"
            style={{
              opacity: 0,
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
