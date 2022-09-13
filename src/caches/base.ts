import { Options } from "../models/options.ts";
import { Key } from "../models/key.ts";
import { CacheStatistics } from "../models/cacheStatistics.ts";
import { EventEmitter } from "../../deps.ts";

export declare interface BaseCache<V> {
  on(event: "remove", listener: (key: Key, value: V) => void): this;
  on(event: "set", listener: (key: Key, value: V) => void): this;
  on(event: "clear", listener: () => void): this;
  on(event: "expired", listener: (key: Key, value: V) => void): this;
  on(event: string, listener: Function): this;
}

export abstract class BaseCache<V> extends EventEmitter {
  /**
   * Maximum number of entries in the cache
   */
  readonly capacity: number;

  /**
   *  Maximum time to live in ms
   */
  readonly stdTTL?: number;

  /**
   * True if the cache emits an event when a key gets added
   */
  readonly setEvent?: boolean;

  /**
   * True if the cache emits an event when the cache gets cleared
   */
  readonly clearEvent?: boolean;

  /**
   * True if the cache emits an event when a key expires
   */
  readonly expiredEvent?: boolean;

  /**
   * True if the cache emits an event when a key gets removed
   */
  readonly removeEvent?: boolean;

  protected _stats: CacheStatistics = {
    hits: 0,
    misses: 0,
  };

  constructor(options: Options) {
    super();
    this.capacity = options.capacity;
    this.stdTTL = options.stdTTL;
    this.setEvent = options.setEvent;
    this.clearEvent = options.clearEvent;
    this.expiredEvent = options.expiredEvent;
    this.removeEvent = options.removeEvent;
  }

  abstract remove(key: Key): void;
  abstract get(key: Key): V | undefined;
  abstract set(key: Key, value: V, ttl?: number): void;
  abstract peek(key: Key): V | undefined;
  abstract has(key: Key): boolean;
  abstract clear(): void;
  abstract forEach(
    callback: (item: { key: Key; value: V }, index: number) => void,
  ): void;

  /**
   * Cache statistics containing amount of keys, total hits and total
   * misses
   */
  get stats(): CacheStatistics {
    return this.stats;
  }

  /**
   * Returns the value for a given key while removing this key from the cache.
   * Equal to calling _get_ and _remove_.
   *
   * @param key The entries key (will be removed from the cache)
   * @returns The value of given key or undefined if the key is unknown
   */
  take(key: Key): V | undefined {
    const value = this.get(key);
    this.remove(key);
    return value;
  }

  /**
   * Adds a TTL to given key. Does however __not__ override any existing TTLs.
   *
   * @param key The key to set a TTL for
   * @param ttl Time to live in milliseconds
   */
  setTTL(key: Key, ttl: number) {
    this.applyTTL(key, ttl);
  }

  protected applyTTL(key: Key, ttl?: number) {
    if (ttl) {
      setTimeout(() => {
        this.applyExpiredEvent(key, this.peek(key)!);
        this.remove(key);
      }, ttl);
    } else if (this.stdTTL) {
      setTimeout(() => {
        this.applyExpiredEvent(key, this.peek(key)!);
        this.remove(key);
      }, this.stdTTL);
    }
  }

  protected applySetEvent(key: Key, value: V) {
    if (this.setEvent) {
      this.emit("set", key, value);
    }
  }
  protected applyRemoveEvent(key: Key, value: V) {
    if (this.removeEvent) {
      this.emit("remove", key, value);
    }
  }
  protected applyExpiredEvent(key: Key, value: V) {
    if (this.expiredEvent) {
      this.emit("expired", key, value);
    }
  }
  protected applyClearEvent() {
    if (this.clearEvent) {
      this.emit("clear");
    }
  }
}
