// PriceTable.tsx
// This component is used to display a price table for a given event.
import type { PriceData } from "@tixtrend/core";
import { useMemo } from "react";

const PriceTable = ({ priceDataSet }: { priceDataSet: PriceData[] }) => {
  const { minPrices, maxPrices, dates } = useMemo(() => {
    if (!priceDataSet || priceDataSet.length === 0) {
      return { minPrices: [], maxPrices: [], dates: [] };
    }
    return {
      minPrices: priceDataSet.map((price) => price.min),
      maxPrices: priceDataSet.map((price) => price.max),
      dates: priceDataSet.map((price) => new Date(price.timestamp)),
    };
  }, [priceDataSet]);

  return (
    <div className="center-items inline-flex w-full justify-center">
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Min Price</th>
            <th className="px-4 py-2">Max Price</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((date, index) => {
            return (
              <tr key={date.valueOf()}>
                <td className="border px-4 py-2">{date.toDateString()}</td>
                <td className="border px-4 py-2">{minPrices[index]}</td>
                <td className="border px-4 py-2">{maxPrices[index]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
