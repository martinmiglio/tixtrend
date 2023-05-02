import React, { useState, useEffect } from "react";
import { useSpring, animated, Interpolation } from "@react-spring/web";

const NumberScroller = ({ value }: { value: number }) => {
  const { number } = useSpring({
    from: { number: 0.01 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 7, clamp: true },
  });

  const [numberValueString, setNumberValueString] = useState<
    string | Interpolation<number, string>
  >("0.01");

  useEffect(() => {
    const interp = number.to((n) => n.toFixed(2));
    setNumberValueString(interp);
  }, [number]);

  return <animated.div>{numberValueString}</animated.div>;
};

export default NumberScroller;
