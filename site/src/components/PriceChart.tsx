// PriceChart.tsx
/* This component is used to display a price chart for a given event.
This will be used in the event page of the site to display the price chart. */

import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

import { PriceData } from "@utils/types/PriceData/PriceData";

const PriceChart = ({ priceDataSet }: { priceDataSet: PriceData[] }) => {
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

    console.log(priceDataSet);

    return () => {
      setEventDataMinPrice([]);
      setEventDataMaxPrice([]);
      setEventDataDate([]);
    };
  }, [priceDataSet]);

  // sometimes priceHistory is undefined, so we need to check for that

  return (
    <div className="w-screen">
      <Plot
        data={[
          {
            x: eventDataDate,
            y: eventDataMaxPrice,
            type: "scatter",
            mode: "lines",
            marker: { color: "red" },
          },
          {
            x: eventDataDate,
            y: eventDataMinPrice,
            type: "scatter",
            mode: "lines",
            marker: { color: "blue" },
          },
        ]}
        layout={{ width: 720, height: 440, title: "Price Chart" }}
      />
      <table>
        <tbody>
          <tr>
            <th>Date</th>
            <th>Min Price</th>
            <th>Max Price</th>
          </tr>
          {
            // row for each val in eventMinPrice, eventMaxPrice, and eventDate
            eventDataDate.map((date, index) => (
              <tr key={date.toISOString()}>
                <td>{date.toLocaleDateString()}</td>
                <td>{eventDataMinPrice[index]}</td>
                <td>{eventDataMaxPrice[index]}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};
export default PriceChart;
