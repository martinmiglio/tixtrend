// import { useSpring, animated, Interpolation } from "@react-spring/web";
// import { useState, useEffect } from "react";

const NumberScroller = ({ value }: { value: number }) => {
  // const { number } = useSpring({
  //   from: { number: 0.01 },
  //   number: value,
  //   delay: 200,
  //   config: { mass: 1, tension: 20, friction: 7, clamp: true },
  // });

  // const [numberValueString, setNumberValueString] = useState<
  //   string | Interpolation<number, string>
  // >("0.01");

  // useEffect(() => {
  //   const interp = number.to((n: number) => n.toFixed(2));
  //   setNumberValueString(interp);
  // }, [number]);

  // return <animated.div>{numberValueString}</animated.div>;
  return <div>{value.toFixed(2)}</div>; // TODO: replace with animated version
};

export default NumberScroller;
