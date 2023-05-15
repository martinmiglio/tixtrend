import { scaleLinear, scaleTime } from "d3-scale";
import * as shape from "d3-shape";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

import { DataPoint } from "./DataPoint";
import { AxisBottom } from "./TimeAxis";

const Cursor = dynamic(() => import("./Cursor"), { ssr: false });

interface GraphProps {
  data: DataPoint[];
  height?: number;
  width?: number;
  onCurrentValueChange?: (index: number) => void;
}

const TIME_AXIS_HEIGHT = 25;
const STROKE_WIDTH = 4;

const Graph = ({ data, height, width, onCurrentValueChange }: GraphProps) => {
  const padding = STROKE_WIDTH / 2;

  const graphPathRef = React.useRef<SVGPathElement>(null);
  const outerDivRef = useRef<HTMLDivElement>(null);
  const [graphHeight, setGraphHeight] = useState<number>(height ?? 0);
  const [graphWidth, setGraphWidth] = useState<number>(width ?? 0);
  const [graphPathElement, setGraphPathElement] =
    useState<SVGPathElement | null>(null);

  const handleMouseMove = (point: { x: number; y: number }) => {
    if (!onCurrentValueChange) {
      return;
    }
    let portion = point.x / graphWidth;
    portion = Math.max(0, portion);
    portion = Math.min(1, portion);
    const index = Math.round(portion * (data.length - 1));
    onCurrentValueChange(index);
  };

  const setGraphSize = () => {
    if (outerDivRef.current) {
      setGraphHeight(outerDivRef.current.clientHeight);
      setGraphWidth(outerDivRef.current.clientWidth);
    }
  };

  useEffect(() => {
    setGraphSize();
    window.addEventListener("resize", setGraphSize);
    return () => {
      window.removeEventListener("resize", setGraphSize);
    };
  }, []);

  useEffect(() => {
    if (graphPathRef.current) {
      const pathElement = graphPathRef.current.cloneNode(
        true
      ) as SVGPathElement;
      setGraphPathElement(pathElement);
    }
  }, [graphHeight, graphWidth]);

  const getDomain = (domain: number[]) => [
    Math.min(...domain),
    Math.max(...domain),
  ];

  const scaleX = scaleTime()
    .domain(getDomain(data.map((d) => d.date)))
    .range([0, graphWidth]);

  const scaleY = scaleLinear()
    .domain(getDomain(data.map((d) => d.value)))
    .range([graphHeight - TIME_AXIS_HEIGHT - padding, padding]);

  const graphPath = shape
    .line<DataPoint>()
    .x((p: { date: number }) => scaleX(p.date))
    .y((p: { value: number }) => scaleY(p.value))
    .curve(shape.curveBasis)(data) as string;

  // issues with path: https://github.com/facebook/react/issues/15187
  // Warning: Prop `d` did not match. Server:
  return (
    <div className="h-full w-full" ref={outerDivRef}>
      <div
        style={{
          width: graphWidth,
          height: graphHeight,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg style={{ width: graphWidth, height: graphHeight }}>
          <defs>
            <linearGradient id="gradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#102652" />
              <stop offset="80%" stopColor="#1a253b" stopOpacity="0.5" />
              <stop offset="99%" stopColor="#19202e" stopOpacity="0" />
              <stop offset="100%" stopColor="#1a202c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            // the gradient path
            d={`${graphPath}L ${graphWidth} ${
              graphHeight - TIME_AXIS_HEIGHT
            } L 0 ${graphHeight - TIME_AXIS_HEIGHT}`}
            fill="url(#gradient)"
          />
          <path
            // the graph path
            ref={graphPathRef}
            fill="transparent"
            stroke="#3977e3"
            d={graphPath}
            strokeWidth={STROKE_WIDTH}
          />
          <g transform={`translate(0, ${graphHeight - TIME_AXIS_HEIGHT})`}>
            <AxisBottom
              xScale={scaleX}
              pixelsPerTick={graphWidth / data.length}
            />
          </g>
        </svg>
        <Cursor
          parentWidth={graphWidth}
          parentHeight={graphHeight}
          pathElement={graphPathElement}
          onMouseMove={handleMouseMove}
        />
      </div>
    </div>
  );
};

export default Graph;
