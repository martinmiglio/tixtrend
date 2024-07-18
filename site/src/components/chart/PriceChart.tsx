"use client";

import { DataPoint } from "./DataPoint";
import Graph from "./Graph";
import PriceDisplay from "./PriceDisplay";
import { PriceData } from "@/lib/aws/prices";
import { useState } from "react";

// PriceChart.tsx

/* This component is used to display a price chart for a given event.
This will be used in the event page of the site to display the price chart. */

const PriceChart = ({ priceDataSet }: { priceDataSet: PriceData[] }) => {
  const [currentValue, setCurrentValue] = useState<PriceData | null>(null);

  return (
    <div className="flex h-full min-h-[33vh] w-full flex-col">
      <PriceDisplay priceData={currentValue} />
      <Graph
        data={priceDataSet.map((priceData: PriceData): DataPoint => {
          return {
            date: priceData.timestamp.valueOf(),
            value: priceData.min,
          };
        })}
        handleCurrentIndexChange={(index: number) =>
          setCurrentValue(priceDataSet[index])
        }
      />
    </div>
  );
};
export default PriceChart;
