import { PriceData } from "../PriceData/PriceData";

export type EventData = {
  id: string;
  name: string;
  location: string;
  date: Date;
  imageURL: string;
  priceHistory?: PriceData[];
};
