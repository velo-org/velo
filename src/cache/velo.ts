import { EventEmitter } from "../../deps.ts";
import { CacheOptions, Key, LoaderFunction } from "../models/cache.ts";
import { EventName, EventOptions, VeloEventEmitter } from "../models/events.ts";
import { Policy } from "../models/policy.ts";
import { CacheStatistics, StatCounter } from "../models/stats.ts";
import { Options } from "./options.ts";
import { VeloCounter } from "./stats/counter.ts";
import { NoopCounter } from "./stats/noopCounter.ts";

export class VeloCache<K extends Key, V> {
  protected _policy: Policy<K, V>;
  protected _stats: StatCounter;
  private _ttl?: number;
  private _timeouts?: Map<K, number>;
  private _events?: EventOptions;
  private _eventEmitter?: EventEmitter;

  readonly options: Options<K, V>;

  constructor(options: CacheOptions<K, V>) {
    this.options = new Options(options);
    this._policy = options.policy;

    if (options.events) {
      this._events = options.eventOptions;
      this._eventEmitter = new EventEmitter();
    }

    if (options.ttl) {
      this._ttl = options.ttl;
      this._timeouts = new Map();
    }

    if (options.stats) {
      this._stats = new VeloCounter();
    } else {
      this._stats = new NoopCounter();
    }
    this._policy.statCounter = this._stats;
  }

  /**
   * Gets the value for a given key
   *
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: K): V | undefined {
    const value = this._policy.get(key);
    this.fireEvent("get", key, value);
    return value;
  }

  /**
   * Inserts a new entry into the cache
   */
  set(key: K, value: V): void {
    if (this._ttl) {
      this.setTTL(key, value);
    }
    this._policy.set(key, value);
    this.fireEvent("set", key, value);
  }

  /**
   * Removes the cache entry with given key
   */
  remove(key: K): void {
    this._policy.remove(key);
    this.fireEvent("remove", key);
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
    return this._policy.peek(key);
  }

  /**
   * Checks if a given key is in the cache
   */
  has(key: K): boolean {
    return this._policy.has(key);
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this._policy.clear();
    this.fireEvent("clear");
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   */
  forEach(
    callback: (item: { key: K; value: V }, index?: number) => void
  ): void {
    this._policy.forEach(callback);
  }

  *[Symbol.iterator]() {
    for (const entry of this._policy) {
      yield entry;
    }
  }

  /**
   * Maximum number of entries in the cache
   */
  get capacity(): number {
    return this._policy.capacity;
  }

  /**
   *  Number of entries in the cache
   */
  get size(): number {
    return this._policy.size;
  }

  /**
   * List of keys in the cache
   */
  get keys(): K[] {
    return this._policy.keys;
  }

  /**
   * List of values in the cache
   */
  get values(): V[] {
    return this._policy.values;
  }

  /**
   * Statistics about the cache
   */
  get stats(): CacheStatistics {
    return this._stats.stats();
  }

  /**
   * Cache event emitter
   */
  get events() {
    if (!this._eventEmitter) {
      throw new Error("Events are not enabled.");
    }
    return this._eventEmitter as VeloEventEmitter<K, V>;
  }

  protected fireEvent(name: EventName, ...args: (K | V | undefined)[]) {
    if (this._events && this._events[name]) {
      this._eventEmitter?.emit(name, ...args);
    }
  }

  private setTTL(key: K, value: V) {
    if (!this._ttl) {
      throw new Error();
    }

    if (this._timeouts?.has(key)) {
      const id = this._timeouts.get(key);
      clearTimeout(id);
    }

    const id = setTimeout(() => {
      this._policy.remove(key);
      this.fireEvent("expire", key, value);
    }, this._ttl!);

    this._timeouts?.set(key, id);
  }
}

export class VeloLoadingCache<K extends Key, V> extends VeloCache<K, V> {
  private _loaderFunction: LoaderFunction<K, V>;

  constructor(options: CacheOptions<K, V>, loader: LoaderFunction<K, V>) {
    super(options);
    this._loaderFunction = (k) => {
      this.fireEvent("load", k);
      try {
        const value = loader(k);
        this._stats.recordLoadingSuccess();
        this.fireEvent("loaded", k, value);
        return value;
      } catch (e) {
        this._stats.recordLoadingFail();
        throw e;
      }
    };
  }

  get(key: K): V {
    let value = super.get(key);
    if (value === undefined) {
      value = this._loaderFunction(key);
      this.set(key, value);
    }
    return value;
  }

  /**
   * Runs the loader function for a given key and sets the value
   */
  refresh(key: K) {
    const value = this._loaderFunction(key);
    this.set(key, value);
  }
}
