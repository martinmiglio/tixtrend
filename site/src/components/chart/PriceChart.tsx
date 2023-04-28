// PriceChart.tsx
/* This component is used to display a price chart for a given event.
This will be used in the event page of the site to display the price chart. */

import React from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { DataPoint } from "./DataPoint";
import Graph from "./Graph";

const PriceChart = ({
  priceDataSet,
  height,
  width,
}: {
  priceDataSet: PriceData[];
  height: number;
  width: number;
}) => {
  return (
    <Graph
      data={priceDataSet.map((priceData: PriceData): DataPoint => {
        console.log(priceData.timestamp, priceData.min);
        return {
          date: priceData.timestamp.valueOf(),
          value: priceData.min,
        };
      })}
      height={height}
      width={width}
    />
  );
};
export default PriceChart;
