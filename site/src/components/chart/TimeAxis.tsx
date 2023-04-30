import { useMemo } from "react";
import { ScaleTime } from "d3-scale";

type AxisBottomProps = {
  xScale: ScaleTime<number, number>;
  pixelsPerTick: number;
};

// tick length
const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, pixelsPerTick }: AxisBottomProps) => {
  const range = xScale.range();

  const ticks = useMemo(() => {
    const width = range[1] - range[0];
    const numberOfTicksTarget = Math.floor(width / pixelsPerTick);
    const ticks = xScale.ticks(numberOfTicksTarget);

    return ticks.map((value, index) => {
      let offset = xScale(value);
      if (index === 0) {
        offset += 20;
      }
      if (index === ticks.length - 1) {
        offset -= 20;
      }

      return {
        value,
        xOffset: offset,
      };
    });
  }, [xScale]);

  return (
    <>
      {ticks.map(({ value, xOffset }) => (
        <g key={value.valueOf()} transform={`translate(${xOffset}, 0)`}>
          <line y2={TICK_LENGTH} stroke="rgb(229 231 235)" />
          <text
            key={value.valueOf()}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
              fill: "rgb(229 231 235)",
            }}
          >
            {value.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </text>
        </g>
      ))}
    </>
  );
};

// if i wanted to prevent the end tick label from being cut off, i could do something like this:
// const lastTick = ticks[ticks.length - 1];
// const lastTickValue = lastTick.value;
// const lastTickOffset = lastTick.xOffset;
// const lastTickLabel = lastTickValue.toLocaleDateString(undefined, {
//   month: "short",
//   day: "numeric",
// });
