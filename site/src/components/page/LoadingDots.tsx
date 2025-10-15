import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type LoadingDotsProps = {
  dotSize: number;
  dotSeparation: number;
};

const DOT_COUNT = 3;
const ANIM_DURATION = 500;

const uuids = Array.from({ length: DOT_COUNT }, () => uuidv4());

const LoadingDots = ({ dotSize, dotSeparation }: LoadingDotsProps) => {
  const [opacityValues, setOpacityValues] = useState(
    Array.from({ length: DOT_COUNT - 1 }, () => 1).concat([0]),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacityValues((prevValues) => {
        const updatedValues = [...prevValues];
        updatedValues.unshift(updatedValues.pop()!);
        return updatedValues;
      });
    }, ANIM_DURATION);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {opacityValues.map((opacity, index) => (
        <div
          key={uuids[index]}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: "rgb(229 231 235)",
            marginLeft: index === 0 ? 0 : dotSeparation,
            opacity: opacity * 0.7 + 0.3,
            transition: `opacity ${0.9 * ANIM_DURATION}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
