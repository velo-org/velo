import { VeloCache } from "../cache/velo.ts";
import { CacheOptions, Options } from "../cache/options.ts";
import { Key } from "../cache/key.ts";
import { Policy } from "../policy/policy.ts";
import { LRU, SC, ARC, LFU, WindowTinyLfu } from "../policy/index.ts";
import { Cache } from "../cache/cache.ts";
import { StatisticsCapability } from "../cache/capability/stats/stats_capability.ts";
import { VeloCounter } from "../cache/capability/stats/counter.ts";
import { LoaderFunction, LoadingCache, LoadingCapability } from "../cache/capability/loading/loading_capability.ts";
import { ExpireCapability } from "../cache/capability/expire/expire_capability.ts";
import { EventName, EventOptions } from "../cache/capability/events/events.ts";
import { EventCapability } from "../cache/capability/events/event_capability.ts";
import { CapabilityRecord } from "../cache/capability/record.ts";

export class Velo<K extends Key, V> {
  private _options: CacheOptions<K, V> = Options.default<K, V>();
  private _capabilities: CapabilityRecord<K, V> = new CapabilityRecord<K, V>();

  private constructor() {}

  static builder<K1 extends Key, V1>() {
    return new Velo<K1, V1>();
  }

  static from<K1 extends Key, V1>(options: Options<K1, V1>) {
    return options.toBuilder();
  }

  public capacity(capacity: number) {
    this.requireExpr(capacity >= 0, "Capacity must be >= 0");
    this.requireExpr(this._options.capacity === 0, "Capacity already set");
    this._options.capacity = capacity;
    return this;
  }

  public ttl(timeout: number) {
    this.requireExpr(timeout > 0, "TTL must be greater than 0");
    this.requireExpr(this._options.ttl === 0, "TTL already set");
    this._options.ttl = timeout;
    return this;
  }

  public stats() {
    this.requireExpr(!this._options.stats, "Stats already enabled");
    this._options.stats = true;
    return this;
  }

  public events(options?: EventOptions) {
    this.requireExpr(!this._options.events, "Events already enabled");
    this._options.events = true;
    if (options) {
      this._options.eventOptions = options;
    }
    return this;
  }

  public allEvents() {
    return this.events({
      remove: true,
      expire: true,
      set: true,
      get: true,
      clear: true,
    });
  }

  public setEvent(name: EventName, active?: boolean) {
    this.requireExpr(this._options.events, "Events are not enabled. Use events() before setEvent()");
    this._options.eventOptions[name] = active ?? true;
    return this;
  }

  public policy(policy: Policy<K, V>) {
    this.requireExpr(this._options.capacity !== 0, "Capacity must be set before policy");
    this._options.policy = policy;
    return this;
  }

  public arc() {
    return this.policy(new ARC<K, V>(this._options.capacity));
  }

  public lru() {
    return this.policy(new LRU<K, V>(this._options.capacity));
  }

  public sc() {
    return this.policy(new SC<K, V>(this._options.capacity));
  }

  public lfu() {
    return this.policy(new LFU<K, V>(this._options.capacity));
  }

  public tinyLfu() {
    return this.policy(new WindowTinyLfu<K, V>(this._options.capacity));
  }

  public build(): Cache<K, V>;
  public build(loader: LoaderFunction<K, V>): LoadingCache<K, V>;
  public build(loader?: LoaderFunction<K, V>): Cache<K, V> | LoadingCache<K, V> {
    let cache: Cache<K, V> = new VeloCache(this._options);

    if (loader) {
      const loading = new LoadingCapability<K, V>(cache, loader);
      this._capabilities.set("loading", loading);
      cache = loading;
    }

    if (this._options.events) {
      const events = new EventCapability<K, V>(cache, this._options.eventOptions);
      this._capabilities.set("events", events);
      cache = events;
    }

    if (this._options.ttl) {
      const ttl = new ExpireCapability<K, V>(cache, this._options.ttl);
      this._capabilities.set("events", ttl);
      cache = ttl;
    }

    if (this._options.stats) {
      cache = new StatisticsCapability<K, V>(cache, new VeloCounter());
    }

    this._capabilities.initAll();
    return cache;
  }

  private requireExpr(expression: boolean, message?: string) {
    if (!expression) {
      throw new Error(message);
    }
  }
}
