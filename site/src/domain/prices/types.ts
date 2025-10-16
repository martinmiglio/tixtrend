export type PriceData = {
  id: string;
  timestamp: Date;
  max: number;
  min: number;
  average?: number;
  currency: string;
};

export type EventPriceData = {
  event_id: string;
  timestamp: number;
  currency: string;
  min: number;
  max: number;
  ttl: number;
};
