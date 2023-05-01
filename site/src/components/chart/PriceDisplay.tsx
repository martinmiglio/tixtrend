// PriceDisplay.ts
/* this component is responsible for displaying the price with the appropriate currency symbol*/
import React from "react";

import NumberScroller from "@components/page/NumberScroller";
import { PriceData } from "@utils/types/PriceData/PriceData";

const CURRENCY_SYMBOLS = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥", // Japanese Yen
};

const PriceDisplay = ({ priceData }: { priceData: PriceData | null }) => {
  let currency = "";

  if (priceData) {
    currency =
      priceData.currency in CURRENCY_SYMBOLS
        ? CURRENCY_SYMBOLS[
            priceData.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS
          ]
        : priceData.currency.toUpperCase();
  }

  return (
    <div className="flex items-center pt-4">
      <div className="text-3xl font-bold ml-1 flex">
        {currency}
        <NumberScroller value={priceData ? priceData.min : 0.0} />
      </div>
    </div>
  );
};

export default PriceDisplay;
