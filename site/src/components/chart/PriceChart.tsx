// PriceChart.tsx
/* This component is used to display a price chart for a given event.
This will be used in the event page of the site to display the price chart. */

import React, { useState } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { DataPoint } from "./DataPoint";
import Graph from "./Graph";
import PriceDisplay from "./PriceDisplay";

const PriceChart = ({
  priceDataSet,
  height,
  width,
}: {
  priceDataSet: PriceData[];
  height: number;
  width: number;
}) => {
  const [currentValue, setCurrentValue] = useState<PriceData | null>(null);

  const handleCurrentValueChange = (index: number) => {
    setCurrentValue(priceDataSet[index]);
  };
  return (
    <div>
      <PriceDisplay priceData={currentValue} />
      <Graph
        data={priceDataSet.map((priceData: PriceData): DataPoint => {
          return {
            date: priceData.timestamp.valueOf(),
            value: priceData.min,
          };
        })}
        height={height}
        width={width}
        onCurrentValueChange={handleCurrentValueChange}
      />
    </div>
  );
};
export default PriceChart;
