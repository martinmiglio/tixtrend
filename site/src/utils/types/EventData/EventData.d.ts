import { PriceData } from "../PriceData/PriceData";

export type EventData = {
  id: string;
  name: string;
  location: string;
  date: Date;
  // imageURL: string;
  imageData: EventImageData[];
  priceHistory?: PriceData[];
};

export type EventImageData = {
  url: string;
  ratio: string; // ratio is string enum (16_9, 3_2, or 4_3)
  width: number;
  height: number;
  fallback: boolean;
  attribution?: string;
};
