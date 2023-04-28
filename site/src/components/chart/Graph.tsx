import React from "react";
import { scaleTime, scaleLinear } from "d3-scale";
import * as shape from "d3-shape";

import Cursor from "./Cursor";

export interface DataPoint {
  date: number;
  value: number;
}

interface GraphProps {
  data: DataPoint[];
}

const Graph = ({ data }: GraphProps) => {
  const width = 640;
  const φ = (1 + Math.sqrt(5)) / 2;
  const height = (1 - 1 / φ) * width;
  const strokeWidth = 4;
  const padding = strokeWidth / 2;

  const getDomain = (domain: number[]) => [
    Math.min(...domain),
    Math.max(...domain),
  ];

  const scaleX = scaleTime()
    .domain(getDomain(data.map((d) => d.date)))
    .range([0, width]);

  const scaleY = scaleLinear()
    .domain(getDomain(data.map((d) => d.value)))
    .range([height - padding, padding]);

  const graphPath = shape
    .line<DataPoint>()
    .x((p: { date: number }) => scaleX(p.date))
    .y((p: { value: number }) => scaleY(p.value))
    .curve(shape.curveBasis)(data) as string;

  // issues with path: https://github.com/facebook/react/issues/15187
  // Warning: Prop `d` did not match. Server:
  return (
    <div style={{ width, height, position: "relative", overflow: "hidden" }}>
      <svg style={{ width, height }}>
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
          d={`${graphPath}L ${width} ${height} L 0 ${height}`}
          fill="url(#gradient)"
        />
        <path
          // the graph path
          id="graph_path"
          fill="transparent"
          stroke="#3977e3"
          d={graphPath}
          strokeWidth={strokeWidth}
        />
      </svg>
      <Cursor parentWidth={width} parentHeight={height} />
    </div>
  );
};

export default Graph;
