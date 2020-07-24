import { Key } from './key.ts';

export interface Cache<V> {
  /**
   * Maximum number of entries in the cache
   */
  capacity: number;

  /**
   * Current number of entries in the cache
   */
  size: number;

  /**
   * List of keys in the cache
   */
  keys: Array<Key>;

  /**
   * List of values in the cache
   */
  values: Array<V>;

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   */
  set(key: Key, value: V): void;

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key): V | undefined;

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key): void;

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
  has(key: Key): boolean;

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key): V | undefined;
}
