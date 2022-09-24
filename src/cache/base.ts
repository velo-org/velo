import { EventEmitter } from "../../deps.ts";
import { CacheOptions, CacheStatistics, Key } from "../models/cache.ts";
import { EventName, EventOptions } from "../models/events.ts";
import { Policy, PolicyInternal } from "../models/policy.ts";
import { Inaccessible } from "../utils/error.ts";

export class VeloCache<K extends Key, V> {
  private _policy: Policy<V, K>;
  private _ttl?: number;
  private _timeouts?: Map<K, number>;
  private _eventOptions?: EventOptions;
  private _eventEmitter?: EventEmitter;
  private _stats?: CacheStatistics;

  readonly capacity: number;
  readonly size: number;
  readonly keys: K[];
  readonly values: V[];
  readonly policyInternal: PolicyInternal<K>;

  constructor(policy: Policy<V, K>, options: CacheOptions) {
    this._policy = policy;

    if (options.enableEvents) {
      this._eventOptions = options.events;
      this._eventEmitter = new EventEmitter();
    }

    if (options.ttl !== 0) {
      this._ttl = options.ttl;
      this._timeouts = new Map();
    }

    if (options.stats) {
      this._stats = {
        hits: 0,
        misses: 0,
        hitRatio: NaN,
      };
    }

    this.capacity = this._policy.capacity;
    this.size = this._policy.size;
    this.keys = this._policy.keys;
    this.values = this._policy.values;
    this.policyInternal = this._policy.internalData;
  }

  get(key: K): V | undefined {
    this.fireEvent("get", key);
    return this._policy.get(key);
  }

  set(key: K, value: V): void {
    if (this._ttl && this._ttl !== 0) {
      this.setTTL(key, value);
    }
    this.fireEvent("set", key, value);
    return this._policy.set(key, value);
  }

  setTTL(key: K, value: V) {
    if (!this._ttl) {
      throw new Inaccessible();
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

  get stats(): CacheStatistics {
    if (!this._stats) {
      throw new Inaccessible();
    }
    return this._stats;
  }

  get events(): EventEmitter {
    if (!this._eventEmitter) {
      throw new Inaccessible();
    }

    return this._eventEmitter;
  }

  private fireEvent(name: EventName, ...args: (K | V)[]) {
    if (!this._eventOptions) {
      throw new Inaccessible();
    }
    if (this._eventOptions[name]) {
      this._eventEmitter?.emit(name, args);
    }
  }
}
