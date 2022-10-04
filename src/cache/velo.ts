import { EventEmitter } from "../../deps.ts";
import { CacheStatistics, Key, VeloOptions } from "../models/cache.ts";
import { EventName, EventOptions, VeloEventEmitter } from "../models/events.ts";
import { Policy, PolicyInternal } from "../models/policy.ts";
import { Inaccessible } from "../utils/error.ts";

export class VeloCache<K extends Key, V> {
  protected _policy: Policy<V, K>;
  private _ttl?: number;
  private _timeouts?: Map<K, number>;
  private _eventOptions?: EventOptions;
  private _eventEmitter?: EventEmitter;
  private _stats?: CacheStatistics;

  constructor(policy: Policy<V, K>, options: VeloOptions) {
    this._policy = policy;

    if (options.enableEvents) {
      this._eventOptions = options.events;
      this._eventEmitter = new EventEmitter();
    }

    if (options.ttl && options.ttl !== 0) {
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

  get policyInternal(): PolicyInternal<K> {
    return this._policy.internalData;
  }

  get stats(): CacheStatistics {
    if (!this._stats) {
      throw new Inaccessible();
    }
    return this._stats;
  }

  get events(): VeloEventEmitter<K, V> {
    if (!this._eventEmitter) {
      throw new Inaccessible();
    }
    return this._eventEmitter;
  }

  private fireEvent(name: EventName, ...args: (K | V)[]) {
    if (this._eventOptions && this._eventOptions[name]) {
      this._eventEmitter?.emit(name, ...args);
    }
  }
}
