//graph-test.tsx
/* a test page for the graph component */
import React from "react";
import { PriceData } from "@utils/types/PriceData/PriceData";

import Graph from "@components/chart/Graph";
import useWindowDimensions from "@components/helpers/WindowDimensions";
import { DataPoint } from "@components/chart/DataPoint";

const createFakeData = (n: number) => {
  const data: PriceData[] = [];
  const min_val = 10;
  const max_val = 15;

  for (let i = 0; i < n; i++) {
    const a = Math.floor(Math.random() * (max_val - min_val + 1) + min_val);
    const b = Math.floor(Math.random() * (max_val - min_val + 1) + min_val);
    const minPrice = Math.min(a, b);
    const maxPrice = Math.max(a, b);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() + i);
    data.push({
      id: i.toString(),
      timestamp,
      min: minPrice,
      max: maxPrice,
      currency: "USD",
    });
  }
  return data;
};

const fakeData = createFakeData(25);

const GraphTest = () => {
  const { height, width } = useWindowDimensions();

  return (
    <div className="w-screen">
      <div className="mx-auto">
        <Graph
          data={fakeData.map((priceData: PriceData): DataPoint => {
            return {
              date: priceData.timestamp.valueOf(),
              value: priceData.min,
            };
          })}
          height={width < 640 ? 0.75 * height : height}
          width={width}
        />
      </div>
    </div>
  );
};

export default GraphTest;
