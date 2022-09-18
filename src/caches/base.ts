import { Options } from "../models/options.ts";
import { Key } from "../models/key.ts";
import { CacheStatistics } from "../models/cacheStatistics.ts";
import { EventEmitter } from "../../deps.ts";
import {
  EmptyEventFunction,
  EventFunction,
  KeyValueEventFunction,
} from "../models/events.ts";

export declare interface BaseCache<V, K = string> {
  on(event: "remove", listener: KeyValueEventFunction<V, K>): this;
  on(event: "set", listener: KeyValueEventFunction<V, K>): this;
  on(event: "clear", listener: EmptyEventFunction): this;
  on(event: "expired", listener: KeyValueEventFunction<V, K>): this;
  on(event: string, listener: EventFunction<V, K>): this;
}

export abstract class BaseCache<V, K = string> extends EventEmitter {
  /**
   * Maximum number of entries in the cache
   */
  readonly capacity: number;

  /**
   *  Maximum time to live in ms
   */
  readonly defaultTTL?: number;

  /**
   * True if the cache should emit events
   */
  readonly events?: boolean;

  /**
   * True if the cache emits an event when a key gets removed
   */
  readonly removeEvent?: boolean;

  protected _stats: CacheStatistics = {
    hits: 0,
    misses: 0,
  };

  protected _timeouts: Map<Key, number>;

  constructor(options: Options) {
    super();
    this.capacity = options.capacity;
    this.defaultTTL = options.defaultTTL;
    this.events = options.events;
    this._timeouts = new Map();
  }

  abstract remove(key: Key): void;

  abstract get(key: Key): V | undefined;

  abstract set(key: Key, value: V, ttl?: number): void;

  abstract peek(key: Key): V | undefined;

  abstract has(key: Key): boolean;

  abstract clear(): void;

  abstract forEach(
    callback: (item: { key: Key; value: V }, index: number) => void
  ): void;

  /**
   * Cache statistics containing amount of keys, total hits and total
   * misses
   */
  get stats(): CacheStatistics {
    return this.stats;
  }

  /**
   * The number of keys currently in the cache.
   */
  abstract get size(): number;

  /**
   * Returns the value for a given key while removing this key from the cache.
   * Equal to calling {@link get} and {@link remove}.
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
   * Sets for TTL for given key, overwriting any existing TTL. Use {@link Options.defaultTTL}
   * to set a default TTL.
   *
   * @param key The key to set a TTL for
   * @param ttl Time to live in milliseconds
   */
  setTTL(key: Key, ttl: number) {
    if (this._timeouts.has(key)) {
      clearTimeout(this._timeouts.get(key));
    }
    this.applyTTL(key, ttl);
  }

  protected applyTTL(key: Key, ttl?: number) {
    const time = ttl || this.defaultTTL;

    if (time) {
      const id = setTimeout(() => {
        this.fireExpiredEvent(key, this.peek(key)!);
        this.remove(key);
      }, ttl);
      this._timeouts.set(key, id);
    }
  }

  protected fireSetEvent(key: Key, value: V) {
    if (this.events) {
      this.emit("set", key, value);
    }
  }

  protected fireRemoveEvent(key: Key, value: V) {
    if (this.events) {
      this.emit("remove", key, value);
    }
  }

  protected fireExpiredEvent(key: Key, value: V) {
    if (this.events) {
      this.emit("expired", key, value);
    }
  }

  protected fireClearEvent() {
    if (this.events) {
      this.emit("clear");
    }
  }
}
