export type PriceData = {
  id: string;
  timestamp: Date;
  max: number;
  min: number;
  average?: number;
  currency: string;
};
