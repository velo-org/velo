export interface Options {
  /**
   * Maximum capacity of the cache
   */
  capacity: number;

  /**
   * Optional Standard TTL in milliseconds. If set this will be used as fallback
   * if keys are set without a specified ttl.
   */
  stdTTL?: number;
}
