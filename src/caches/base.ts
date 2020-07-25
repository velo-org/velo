import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';

export abstract class BaseCache<V> {
  /**
   * Maximum number of entries in the cache
   */
  readonly capacity: number;

  constructor(options: Options) {
    this.capacity = options.capacity;
  }

  abstract remove(key: Key): void;
  abstract get(key: Key): V | undefined;

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
}
