import { Cache, CacheInternal } from "../cache/cache.ts";
import { BaseCache } from "../cache/base.ts";
import { Key } from "../cache/key.ts";
import { CacheOptions, Options, EventOptions } from "../cache/options.ts";
import { PolicyCapability } from "../cache/capabilities/policy_capability.ts";
import { EventName, EventCapability } from "../cache/capabilities/event_capability.ts";
import { ExpireCapability } from "../cache/capabilities/expire_capability.ts";
import { LoaderFunction, LoadingCache, LoadingCapability } from "../cache/capabilities/loading_capability.ts";
import { ExtractOptionsCapability } from "../cache/capabilities/extract_options_capability.ts";
import { RemoveListener, RemoveListenerCapability } from "../cache/capabilities/remove_listener_capability.ts";
import { StatisticsCapability } from "../cache/capabilities/stats_capability.ts";
import { Counter } from "../cache/capabilities/counter.ts";
import { Policy } from "../policy/policy.ts";
import { Arc } from "../policy/arc.ts";
import { Lfu } from "../policy/lfu.ts";
import { Lru } from "../policy/lru.ts";
import { SecondChance } from "../policy/sc.ts";
import { WindowTinyLfu } from "../policy/tiny_lfu/w_tiny_lfu.ts";

export class Velo<K extends Key, V> {
  private _options: CacheOptions<K, V> = Options.default<K, V>();

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

  public withEvent(name: EventName, active?: boolean) {
    this.requireExpr(this._options.events, "Events are not enabled. Use events() before setEvent()");
    this._options.eventOptions[name] = active ?? true;
    return this;
  }

  public removalListener(listener: RemoveListener<K, V>) {
    this._options.removeListener = listener;
    return this;
  }

  public policy(policy: Policy<K, V>) {
    this.requireExpr(this._options.capacity !== 0, "Capacity must be set before policy");
    this._options.policy = policy;
    return this;
  }

  public arc() {
    return this.policy(new Arc<K, V>(this._options.capacity));
  }

  public lru() {
    return this.policy(new Lru<K, V>(this._options.capacity));
  }

  public sc() {
    return this.policy(new SecondChance<K, V>(this._options.capacity));
  }

  public lfu() {
    return this.policy(new Lfu<K, V>(this._options.capacity));
  }

  public tinyLfu() {
    return this.policy(new WindowTinyLfu<K, V>(this._options.capacity));
  }

  public build(): Cache<K, V>;
  public build(loader: LoaderFunction<K, V>): LoadingCache<K, V>;
  public build(loader?: LoaderFunction<K, V>): Cache<K, V> | LoadingCache<K, V> {
    let cache: Cache<K, V> & CacheInternal<K, V> = new BaseCache();

    cache = new ExtractOptionsCapability<K, V>(cache, this._options);

    if (this._options.removeListener) {
      cache = new RemoveListenerCapability<K, V>(cache, this._options.removeListener);
      this._options.policy!.onEvict = this._options.removeListener;
    }

    if (this._options.policy) {
      cache = new PolicyCapability<K, V>(cache, this._options.policy);
    }

    if (loader) {
      cache = new LoadingCapability<K, V>(cache, loader);
    }

    if (this._options.events) {
      cache = new EventCapability<K, V>(cache, this._options.eventOptions);
    }

    if (this._options.ttl) {
      cache = new ExpireCapability<K, V>(cache, this._options.ttl);
    }

    if (this._options.stats) {
      cache = new StatisticsCapability<K, V>(cache, new Counter());
    }

    return cache;
  }

  private requireExpr(expression: boolean, message?: string) {
    if (!expression) {
      throw new Error(message);
    }
  }
}