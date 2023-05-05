//graph-test.tsx
/* a test page for the graph component */
import { useState } from "react";

import { DataPoint } from "@components/chart/DataPoint";
import Graph from "@components/chart/Graph";
import PriceDisplay from "@components/chart/PriceDisplay";
import useWindowDimensions from "@components/helpers/WindowDimensions";
import { PriceData } from "@utils/types/PriceData/PriceData";

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
  const [currentValue, setCurrentValue] = useState<PriceData | null>(null);

  const handleCurrentValueChange = (index: number) => {
    setCurrentValue(fakeData[index]);
  };

  return (
    <div className="w-screen">
      <div className="mx-auto">
        <PriceDisplay priceData={currentValue} />
        <Graph
          data={fakeData.map((priceData: PriceData): DataPoint => {
            return {
              date: priceData.timestamp.valueOf(),
              value: priceData.min,
            };
          })}
          height={width < 640 ? 0.75 * height : 0.9 * height}
          width={width}
          onCurrentValueChange={handleCurrentValueChange}
        />
      </div>
    </div>
  );
};

export default GraphTest;
