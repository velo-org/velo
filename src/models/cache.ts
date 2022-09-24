import { EventOptions } from "./events.ts";

export type Key = number | string;

export interface CacheOptions {
  enableEvents: boolean;
  events: EventOptions;
  ttl: number;
  stats: boolean;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRatio: number;
}
