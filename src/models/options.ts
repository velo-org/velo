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

  /**
   * True if the cache emits an event when a key gets added
   */
  setEvent?: boolean;

  /**
   * True if the cache emits an event when the cache gets cleared
   */
  clearEvent?: boolean;

  /**
   * True if the cache emits an event when a key expires
   */
  expiredEvent?: boolean;

  /**
   * True if the cache emits an event when a key is removed
   */
  removeEvent?: boolean;
}
