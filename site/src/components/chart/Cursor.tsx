import { animated, useSpring } from "@react-spring/web";
import { Vector2, useGesture } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";

type CursorProps = {
  parentWidth: number;
  parentHeight: number;
  pathElement: SVGPathElement | null;
  onMouseMove: (point: { x: number; y: number }) => void;
};

const Cursor = ({
  parentWidth,
  parentHeight,
  pathElement,
  onMouseMove,
}: CursorProps) => {
  const CURSOR_RADIUS = 7;

  const cursorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { mass: 1, tension: 300, friction: 30, precision: 1, clamp: true },
  }));

  useEffect(() => {
    if (parentHeight && parentWidth && pathElement) {
      const pathPoint = findPathPointByX(pathElement, parentWidth - 1);
      if (!pathPoint) {
        return;
      }
      onMouseMove({ x: parentWidth - 1, y: pathPoint.y - parentHeight * 2 });
      api.set({
        x: 0,
        y: pathPoint.y - parentHeight * 2,
      });
    }
  }, [pathElement]);

  const cursorAnimation = (xy: Vector2) => {
    if (cursorRef.current) {
      const [x, y] = xy;
      onMouseMove({ x, y });
      const { width: cursorX } = cursorRef.current.getBoundingClientRect();

      if (!pathElement) {
        return;
      }
      const pathPoint = findPathPointByX(pathElement, x);

      if (!pathPoint) {
        return;
      }

      api.start({
        x: pathPoint.x - cursorX / 2 + 1,
        y: pathPoint.y - parentHeight * 2,
      });

      setVisible(true);
    }
  };

  const findPathPointByX = (path: SVGPathElement, x: number) => {
    const pathLength = path.getTotalLength();
    let start = 0;
    let end = pathLength;
    let minDistance = Infinity;
    let minPoint: DOMPoint | null = null;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const point = path.getPointAtLength(mid);
      const distance = Math.abs(point.x - x);
      if (distance < minDistance) {
        minDistance = distance;
        minPoint = point;
      }
      if (point.x < x) {
        start = mid + 1;
      } else if (point.x > x) {
        end = mid - 1;
      } else {
        break;
      }
    }
    return minPoint;
  };

  const bind = useGesture({
    onMove: ({ xy }: { xy: Vector2 }) => {
      cursorAnimation(xy);
    },
    onDrag: ({ active, xy }: { active: boolean; xy: Vector2 }) => {
      if (active) {
        cursorAnimation(xy);
      }
    },
  });

  return (
    <animated.div
      ref={cursorRef}
      style={{
        touchAction: "none",
        userSelect: "none",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "200%",
        height: "200%",
        x,
        y,
      }}
      {...bind()}
    >
      {visible && (
        <>
          <div
            style={{
              width: CURSOR_RADIUS * 1.5,
              height: CURSOR_RADIUS * 1.5,
              borderRadius: CURSOR_RADIUS,
              borderColor: "#1a202c",
              borderWidth: CURSOR_RADIUS / 3,
              backgroundColor: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1,
              height: parentHeight * 2,
              backgroundColor: "#d9e1f2",
              opacity: 0.5,
            }}
          />
        </>
      )}
    </animated.div>
  );
};

export default Cursor;
