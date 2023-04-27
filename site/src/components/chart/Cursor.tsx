import React, { useRef, useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Vector2, useGesture } from "@use-gesture/react";

import useMediaQuery from "@utils/usehooks-ts";

type CursorProps = {
  r: number;
  borderWidth: number;
  borderColor: string;
  parentWidth: number;
  parentHeight: number;
};

const Cursor = ({
  r,
  borderWidth,
  borderColor,
  parentWidth,
  parentHeight,
}: CursorProps) => {
  const radius = r + borderWidth / 2;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [pathElement, setPathElement] = useState<SVGPathElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!cursorRef.current) {
      return;
    }
    const selector = "path#graph_path";
    const graphPath = document.querySelector(selector);
    if (!graphPath) {
      return;
    }
    const pathElement = graphPath.cloneNode(true) as SVGPathElement;
    setPathElement(pathElement);
  }, []);

  const [{ x }, setX] = useSpring(() => ({
    x: -1.25 * parentWidth,
    config: { mass: 1, tension: 300, friction: 30 },
  }));

  const [{ y }, setY] = useSpring(() => ({
    y: -1 * parentHeight,
    config: { tension: 210, friction: 20, precision: 1, clamp: true },
  }));

  const motion = (xy: Vector2) => {
    if (cursorRef.current) {
      const [x, y] = xy;
      const { width: cursorX } = cursorRef.current.getBoundingClientRect();

      if (!pathElement) {
        return;
      }
      const pathPoint = findPathPointByX(pathElement, x);

      if (!pathPoint) {
        return;
      }

      setX({ x: pathPoint.x - cursorX / 2 });
      setY({ y: pathPoint.y - parentHeight * 2 });
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

  const mobileGesture = {
    onDrag: ({ active, xy }: { active: boolean; xy: Vector2 }) => {
      if (active) {
        motion(xy);
      }
    },
  };

  const desktopGesture = {
    onMove: ({ xy }: { xy: Vector2 }) => {
      motion(xy);
    },
  };

  const bind = useGesture(isMobile ? mobileGesture : desktopGesture);

  return (
    <animated.div
      ref={cursorRef}
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "200%",
        height: parentHeight * 2,
        x,
        y,
      }}
      {...bind()}
    >
      {visible && (
        <div
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderColor,
            borderWidth,
            backgroundColor: "white",
          }}
        />
      )}
    </animated.div>
  );
};

export default Cursor;
