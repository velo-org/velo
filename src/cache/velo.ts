import { EventEmitter } from "../../deps.ts";
import { Key, LoaderFunction } from "../models/cache.ts";
import { EventName, EventOptions, VeloEventEmitter } from "../models/events.ts";
import { Policy } from "../models/policy.ts";
import { CacheStatistics, StatCounter } from "../models/stats.ts";
import { Velo } from "./builder.ts";
import { VeloCounter } from "./stats/Counter.ts";
import { NoopCounter } from "./stats/noopCounter.ts";

export class VeloCache<K extends Key, V> {
  protected _policy: Policy<K, V>;
  private _ttl?: number;
  private _timeouts?: Map<K, number>;
  private _events?: EventOptions;
  private _eventEmitter?: EventEmitter;
  private _stats: StatCounter;

  constructor(builder: Velo<K, V>) {
    this._policy = builder._policy!;

    if (builder._events) {
      this._events = builder._eventOptions;
      this._eventEmitter = new EventEmitter();
    }

    if (builder._ttl) {
      this._ttl = builder._ttl;
      this._timeouts = new Map();
    }

    if (builder._stats) {
      this._stats = new VeloCounter();
    } else {
      this._stats = new NoopCounter();
    }
    this._policy.statCounter = this._stats;
  }

  get(key: K): V | undefined {
    this.fireEvent("get", key);
    return this._policy.get(key);
  }

  set(key: K, value: V): void {
    if (this._ttl) {
      this.setTTL(key, value);
    }
    this.fireEvent("set", key, value);
    return this._policy.set(key, value);
  }

  setTTL(key: K, value: V) {
    if (!this._ttl) {
      throw new Error();
    }

    if (this._timeouts?.has(key)) {
      const id = this._timeouts.get(key);
      clearTimeout(id);
    }

    const id = setTimeout(() => {
      this._policy.remove(key);
      this.fireEvent("expired", key, value);
    }, this._ttl!);

    this._timeouts?.set(key, id);
  }

  remove(key: K): void {
    this.fireEvent("removed", key);
    return this._policy.remove(key);
  }

  take(key: K): V | undefined {
    const value = this.get(key);
    this.remove(key);
    return value;
  }

  peek(key: K): V | undefined {
    return this._policy.peek(key);
  }

  has(key: K): boolean {
    return this._policy.has(key);
  }

  clear(): void {
    this.fireEvent("clear");
    return this._policy.clear();
  }

  forEach(callback: (item: { key: K; value: V }, index: number) => void): void {
    this._policy.forEach(callback);
  }

  *[Symbol.iterator]() {
    for (const entry of this._policy) {
      yield entry;
    }
  }

  get capacity(): number {
    return this._policy.capacity;
  }

  get size(): number {
    return this._policy.size;
  }

  get keys(): K[] {
    return this._policy.keys;
  }

  get values(): V[] {
    return this._policy.values;
  }

  get stats(): CacheStatistics {
    return this._stats.stats();
  }

  get events(): VeloEventEmitter<K, V> {
    if (!this._eventEmitter) {
      throw new Error();
    }
    return this._eventEmitter;
  }

  private fireEvent(name: EventName, ...args: (K | V)[]) {
    if (this._events && this._events[name]) {
      this._eventEmitter?.emit(name, ...args);
    }
  }
}

export class VeloLoadingCache<K extends Key, V> extends VeloCache<K, V> {
  private _loaderFunction: LoaderFunction<K, V>;
  constructor(builder: Velo<K, V>, loader: LoaderFunction<K, V>) {
    super(builder);
    this._loaderFunction = (k) => {
      try {
        return loader(k);
      } catch (e) {
        throw e;
      }
    };
  }

  get(key: K): V | undefined {
    let value = this._policy.get(key);
    if (!value) {
      value = this._loaderFunction(key);
      this.set(key, value!);
      return value;
    }
    return value;
  }

  refresh(key: K) {
    const value = this._loaderFunction(key);
    this.set(key, value!);
  }
}
