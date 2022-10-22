import { Options } from "../../mod.ts";
import { FireEventFunction, VeloEventEmitter } from "./capabilities/event_capability.ts";
import { RemoveListener } from "./capabilities/remove_listener_capability.ts";
import { CacheStatistics } from "./capabilities/stats_capability.ts";
import { Key } from "./key.ts";

/**
 * Maps keys to values. Entries are manually added via {@link set} and either
 * evicted by the caching policy or manually removed via {@link remove}.
 *
 * @param K The type of keys
 * @param V The type of values
 */
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

/**
 * Defines internally used methods for cache wrappers to use. Additionally this
 * enables interopability between cache wrappers using these methods.
 */
export interface CacheInternal<K extends Key, V> {
  onRemove?: RemoveListener<K, V>;
  fireEvent?: FireEventFunction<K, V>;
  erase(key: K): void;
}
