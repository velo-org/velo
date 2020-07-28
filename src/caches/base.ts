import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';

export abstract class BaseCache<V> {
  /**
   * Maximum number of entries in the cache
   */
  readonly capacity: number;

  /**
   *  Maximum time to live in ms
   *
   */
  readonly ttl?: number;

  constructor(options: Options) {
    this.capacity = options.capacity;
    this.ttl = options.ttl;
  }

  abstract remove(key: Key): void;
  abstract get(key: Key): V | undefined;
  abstract set(key: Key, value: V): void;
  abstract peek(key: Key): V | undefined;
  abstract has(key: Key): boolean;
  abstract clear(): void;
  abstract forEach(
    callback: (item: { key: Key; value: V }, index: number) => void
  ): void;

  /**
   * Returns the value for a given key while removing this key from the cache.
   * Equal to calling _get_ and _remove_.
   *
   * @param key The entries key (will be removed from the cache)
   * @returns The value of given key or undefined if the key is unknown
   */
  take(key: Key) {
    const value = this.get(key);
    this.remove(key);
    return value;
  }

  checkForTtl(key: Key, ttl?: number) {
    if (ttl) {
      setTimeout(() => {
        this.remove(key);
      }, ttl);
    } else if (this.ttl) {
      setTimeout(() => {
        this.remove(key);
      }, this.ttl);
    }
  }
}
