import { EventEmitter } from "../../deps.ts";
import { Policy } from "../policy/policy.ts";
import { Key } from "./key.ts";

import { CacheOptions, Options } from "./options.ts";
import { Cache } from "./cache.ts";
import { CacheStatistics } from "./capability/stats/stats.ts";

export class VeloCache<K extends Key, V> implements Cache<K, V> {
  private policy: Policy<K, V>;
  readonly options: Options<K, V>;

  constructor(options: CacheOptions<K, V>) {
    this.options = new Options(options);
    if (!this.options.policy) {
      throw new Error("No policy specified.");
    }
    this.policy = options.policy!;
  }

  /**
   * Gets the value for a given key
   *
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: K): V | undefined {
    const value = this.policy.get(key);
    return value;
  }

  /**
   * Inserts a new entry into the cache
   */
  set(key: K, value: V): void {
    this.policy.set(key, value);
  }

  /**
   * Removes the cache entry with given key
   */
  remove(key: K): void {
    this.policy.remove(key);
  }

  /**
   * Equivalent of calling {@link get} and {@link remove}.
   */
  take(key: K): V | undefined {
    const value = this.get(key);
    this.remove(key);
    return value;
  }

  /**
   * Get the value to a key without manipulating the cache and cache statistics
   */
  peek(key: K): V | undefined {
    return this.policy.peek(key);
  }

  /**
   * Checks if a given key is in the cache
   */
  has(key: K): boolean {
    return this.policy.has(key);
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this.policy.clear();
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   */
  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void {
    this.policy.forEach(callback);
  }

  /**
   * Maximum number of entries in the cache
   */
  get capacity(): number {
    return this.policy.capacity;
  }

  /**
   *  Number of entries in the cache
   */
  get size(): number {
    return this.policy.size;
  }

  /**
   * List of keys in the cache
   */
  get keys(): K[] {
    return this.policy.keys;
  }

  /**
   * List of values in the cache
   */
  get values(): V[] {
    return this.policy.values;
  }

  /**
   * Statistics about the cache
   */
  get stats(): CacheStatistics {
    throw new Error("Statistics are not enabled for this cache.");
  }

  /**
   * Cache event emitter
   */
  get events(): EventEmitter {
    throw new Error("Events are not enabled for this cache.");
  }
}
