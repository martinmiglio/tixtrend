// PriceTable.tsx
// This component is used to display a price table for a given event.

import React, { useEffect, useState } from "react";

import { PriceData } from "@utils/types/PriceData/PriceData";

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
    <div>
      <table>
        <tbody>
          <tr>
            <th>Date</th>
            <th>Min Price</th>
            <th>Max Price</th>
          </tr>
          {eventDataDate.map((date, index) => {
            return (
              <tr key={date.valueOf()}>
                <td>{date.toDateString()}</td>
                <td>{eventDataMinPrice[index]}</td>
                <td>{eventDataMaxPrice[index]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
