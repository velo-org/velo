import { Options } from "../../mod.ts";
import { VeloEventEmitter } from "./capabilities/event_capability.ts";
import { CacheStatistics } from "./capabilities/stats_capability.ts";
import { Key } from "./key.ts";

export interface Cache<K extends Key, V> {
  readonly capacity: number;
  readonly size: number;
  readonly keys: K[];
  readonly values: V[];
  readonly stats: CacheStatistics;
  readonly events: VeloEventEmitter<K, V>;
  readonly options: Options<K, V>;

  get(key: K): V | undefined;
  set(key: K, value: V): void;
  setWithExpire(key: K, value: V, expire: number): void;
  peek(key: K): V | undefined;
  has(key: K): boolean;
  take(key: K): V | undefined;
  remove(key: K): void;
  clear(): void;
  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void;
}
