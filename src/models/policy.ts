import { StatCounter } from "./stats.ts";

/**
 * A cache replacement policy
 */
export interface Policy<K, V> {
  /**
   * Maximum number of entries in the cache
   */
  readonly capacity: number;

  /**
   *  Number of keys in the cache
   */
  readonly size: number;

  /**
   * List of keys in the cache
   */
  readonly keys: K[];

  /**
   * List of values in the cache
   */
  readonly values: V[];

  statCounter: StatCounter;

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   */
  set(key: K, value: V): void;

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: K): V | undefined;

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: K): V | undefined;

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: K): void;

  /**
   * Reset the cache
   */
  clear(): void;

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: K): boolean;

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { key: K; value: V }, index: number) => void): void;

  [Symbol.iterator](): IterableIterator<{ key: K; value: V | undefined }>;
}
