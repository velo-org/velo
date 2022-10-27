import { Options } from "../../mod.ts";
import { Entry } from "../policy/policy.ts";
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
  /** Returns the static maximum capacity of the cache. */
  readonly capacity: number;

  /** Returns the number of items currently in the cache.  */
  readonly size: number;

  /** Returns all keys stored in the cache. Ordering depends on the policy that
   *  is used; do not expect keys to be ordered in any particular way.
   */
  readonly keys: K[];

  /**
   * Returns all values stored in the cache. Ordering depends on the policy that
   *  is used; do not expect keys to be ordered in any particular way.
   */
  readonly values: V[];

  /** Returns current cache statistics. */
  readonly stats: CacheStatistics;

  /** Returns a {@link VeloEventEmitter} to add listeners for cache events. */
  readonly events: VeloEventEmitter<K, V>;

  /**
   * Returns an {@link Options} objet that contains the configuration that was
   * used to create this cache. This enables to create cache clones with an
   * identical configuration.
   */
  readonly options: Options<K, V>;

  /**
   * Returns the value of an entry with given `key`. If the key is not cached,
   * `undefined` is returned.
   */
  get(key: K): V | undefined;

  /**
   * Maps a `key` to a `value`. If the key already exists in the
   * cache, the value will be replaced by the new value.
   */
  set(key: K, value: V): void;

  /**
   * Performs a {@link set}. Additionally a ttl can be specified to timeout this
   * specific key.
   */
  setWithExpire(key: K, value: V, expire: number): void;

  /**
   * Returns the value of an entry with given `key`. If the key is not cached,
   * `undefined` is returned. This operation does not trigger policy actions and
   * will not affect cache statistics.
   */
  peek(key: K): V | undefined;

  /**
   * Returns `true` if the cache contains `key`, otherwise `false`.
   */
  has(key: K): boolean;

  /**
   * Returns the value associated with a key and removes the key from the cache.
   * Equivalent of calling:
   *
   *      cache.get(key);
   *      cache.remove(key);
   */
  take(key: K): V | undefined;

  /**
   * Removes an entry with `key` from the cache.
   */
  remove(key: K): void;

  /**
   * Discards all entries in the cache and clears internal state. View this as
   * a destructive operation. Depending on the policy, historic data is lost
   * (e.g. LFU frequencies). Not equivalent to calling {@link remove} for all keys.
   */
  reset(): void;

  /**
   * Array-like forEach.
   */
  forEach(callback: (item: Entry<K, V>, index?: number) => void): void;
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
