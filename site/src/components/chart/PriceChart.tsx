// PriceChart.tsx
/* This component is used to display a price chart for a given event.
This will be used in the event page of the site to display the price chart. */

import React, { useState, useEffect, useRef } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";
import { DataPoint } from "./DataPoint";
import Graph from "./Graph";
import PriceDisplay from "./PriceDisplay";

const PriceChart = ({ priceDataSet }: { priceDataSet: PriceData[] }) => {
  const outerDivRef = useRef<HTMLDivElement>(null);
  const [graphHeight, setGraphHeight] = useState<number>(0);
  const [graphWidth, setGraphWidth] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<PriceData | null>(null);

  useEffect(() => {
    if (outerDivRef.current) {
      setGraphHeight(outerDivRef.current.clientHeight);
      setGraphWidth(outerDivRef.current.clientWidth);
    }
  }, [outerDivRef]);

  const handleCurrentValueChange = (index: number) => {
    setCurrentValue(priceDataSet[index]);
  };
  return (
    <div className="h-full w-full" ref={outerDivRef}>
      <PriceDisplay priceData={currentValue} />
      <Graph
        data={priceDataSet.map((priceData: PriceData): DataPoint => {
          return {
            date: priceData.timestamp.valueOf(),
            value: priceData.min,
          };
        })}
        height={graphHeight}
        width={graphWidth}
        onCurrentValueChange={handleCurrentValueChange}
      />
    </div>
  );
};
export default PriceChart;
