import { EventOptions } from "./events.ts";
import { Policy } from "./policy.ts";

export type Key = number | string;

export type LoaderFunction<K, V> = (key: K) => V;

export interface CacheOptions {
  capacity: number;
  policy: Policy<unknown, unknown> | undefined;
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
