import { ScaleTime } from "d3-scale";
import { useMemo } from "react";

type AxisBottomProps = {
  xScale: ScaleTime<number, number>;
  pixelsPerTick: number;
};

const TICK_LENGTH = 6;
const COLOR = "rgb(229 231 235)";
const MAX_LABEL_WIDTH = 45;

export const AxisBottom = ({ xScale, pixelsPerTick }: AxisBottomProps) => {
  const range = xScale.range();
  pixelsPerTick = Math.max(pixelsPerTick, MAX_LABEL_WIDTH);

  const ticks = useMemo(() => {
    const width = range[1] - range[0];
    const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

    const ticks = xScale.ticks(numberOfTicksTarget);

    return ticks.map((value, index) => {
      let offset = xScale(value);
      return {
        value,
        xOffset: offset,
        fill: COLOR,
      };
    });
  }, [xScale]);

  return (
    <>
      {ticks.map(({ value, xOffset, fill }) => (
        <g key={value.valueOf()} transform={`translate(${xOffset}, 0)`}>
          <line y2={TICK_LENGTH} stroke={fill} />
          <text
            key={value.valueOf()}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
              fill: fill,
            }}
          >
            {value.toLocaleDateString(undefined, {
              month: "numeric",
              day: "numeric",
            })}
          </text>
        </g>
      ))}
    </>
  );
};
