export interface Options {
  /**
   * Maximum capacity of the cache
   */
  capacity: number;

  /**
   * TTL in milliseconds. If 0, entries will not timeout.
   */
  defaultTTL?: number;

  /**
   * True if the cache should emit events.
   */
  events?: boolean;
}
