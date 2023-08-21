// PriceTable.tsx
// This component is used to display a price table for a given event.
import { PriceData } from "@/api/price";
import { useEffect, useState } from "react";

const PriceTable = ({ priceDataSet }: { priceDataSet: PriceData[] }) => {
  const [eventDataMaxPrice, setEventDataMaxPrice] = useState<number[]>([]);
  const [eventDataMinPrice, setEventDataMinPrice] = useState<number[]>([]);
  const [eventDataDate, setEventDataDate] = useState<Date[]>([]);

  useEffect(() => {
    if (!priceDataSet || priceDataSet.length === 0) {
      return;
    }
    const minPrices = priceDataSet.map((price) => price.min);
    const maxPrices = priceDataSet.map((price) => price.max);
    const dates = priceDataSet.map((price) => new Date(price.timestamp));
    setEventDataMinPrice(minPrices);
    setEventDataMaxPrice(maxPrices);
    setEventDataDate(dates);

    return () => {
      setEventDataMinPrice([]);
      setEventDataMaxPrice([]);
      setEventDataDate([]);
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
          {eventDataDate.map((date, index) => {
            return (
              <tr key={date.valueOf()}>
                <td className="border px-4 py-2">{date.toDateString()}</td>
                <td className="border px-4 py-2">{eventDataMinPrice[index]}</td>
                <td className="border px-4 py-2">{eventDataMaxPrice[index]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
