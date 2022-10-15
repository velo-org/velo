import { EventOptions } from "./events.ts";
import { Policy } from "./policy.ts";

export type Key = number | string;

export type LoaderFunction<K, V> = (key: K) => V;

export interface CacheOptions<K, V> {
  capacity: number;
  policy: Policy<K, V>;
  events: boolean;
  eventOptions: EventOptions;
  ttl: number;
  stats: boolean;
}
