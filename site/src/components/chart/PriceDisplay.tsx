// PriceDisplay.ts
/* this component is responsible for displaying the price with the appropriate currency symbol*/

import { PriceData } from "@utils/types/PriceData/PriceData";
import React from "react";

const CURRENCY_SYMBOLS = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥", // Japanese Yen
};

const PriceDisplay = ({ priceData }: { priceData: PriceData | null }) => {
  const currency =
    priceData && priceData.currency in CURRENCY_SYMBOLS
      ? CURRENCY_SYMBOLS[
          priceData.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS
        ]
      : "$";

  return (
    <div className="flex items-center pt-4">
      <p className="text-3xl font-bold ml-1">
        {currency}
        {priceData ? priceData.min.toFixed(2) : "0.00"}
      </p>
    </div>
  );
};

export default PriceDisplay;
