//graph-test.tsx
/* a test page for the graph component */
import React, { useEffect, useState } from "react";
import { PriceData } from "@utils/types/PriceData/PriceData";

import Graph, { DataPoint } from "@components/chart/Graph";

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

const GraphTest = () => {
  const fakeData = createFakeData(25);

  return (
    <div className="w-screen">
      <Graph
        data={fakeData.map((priceData: PriceData): DataPoint => {
          return {
            date: priceData.timestamp.valueOf(),
            value: priceData.min,
          };
        })}
      />
    </div>
  );
};

export default GraphTest;
