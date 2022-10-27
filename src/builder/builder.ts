import { Cache, CacheInternal } from "../cache/cache.ts";
import { BaseCache } from "../cache/base.ts";
import { Key } from "../cache/key.ts";
import { CacheOptions, Options, EventOptions, ExpireOptions } from "../cache/options.ts";
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

/**
 * Builder class for {@link Cache} and {@link LoadingCache}. Allows to add optional
 * functionality to a cache. The following options are available:
 *
 * - size-based eviction ({@link capacity})
 * - multiple cache strategies ({@link policy}, {@link lru}, {@link lfu}, {@link arc}, {@link sc}, {@link tinyLfu})
 * - automated loading of cache values ({@link build}(fn: {@link LoaderFunction}))
 * - time-based expiration of entries ({@link ttl})
 * - listener for cache removals ({@link removalListener})
 * - eventEmitter for cache events ({@link events})
 * - collecting cache hit and miss statistics ({@link stats})
 *
 * All listed features are optional. By default the cache has no functionality.
 */
export class Velo<K extends Key, V> {
  private _options: CacheOptions<K, V> = Options.default<K, V>();

  private constructor() {}

  /**
   * Constructs a new {@link Velo} builder instance with default settings.
   */
  static builder<K1 extends Key, V1>() {
    return new Velo<K1, V1>();
  }

  /**
   * Constructs a new {@link Velo} builder instance with given `options` applied.
   */
  static from<K1 extends Key, V1>(options: Options<K1, V1>) {
    return options.toBuilder();
  }

  /**
   * Specifies the maximum number of entries the cache may contain.
   */
  public capacity(capacity: number) {
    this.requireExpr(capacity >= 0, "Capacity must be >= 0");
    this.requireExpr(this._options.capacity === 0, "Capacity already set");
    this._options.capacity = capacity;
    return this;
  }

  /**
   * Specifies the time-to-live for cache entries. Takes optional
   * {@link ExpireOptions} to specify when to refresh the TTL. By default it
   * is never refreshed.
   */
  public ttl(timeout: number, options?: ExpireOptions) {
    this.requireExpr(timeout > 0, "TTL must be greater than 0");
    this.requireExpr(this._options.ttl === 0, "TTL already set");
    this._options.ttl = timeout;
    if (options) {
      this._options.ttlOptions = options;
    }
    return this;
  }

  /**
   * Enables statistics collection during cache operations.
   */
  public stats() {
    this.requireExpr(!this._options.stats, "Stats already enabled");
    this._options.stats = true;
    return this;
  }

  /**
   * Enables events via an EventEmitter.
   */
  public events(options?: EventOptions) {
    this.requireExpr(!this._options.events, "Events already enabled");
    this._options.events = true;
    if (options) {
      this._options.eventOptions = options;
    }
    return this;
  }

  /**
   * Enables all events names.
   */
  public allEvents() {
    return this.events({
      remove: true,
      expire: true,
      set: true,
      get: true,
      clear: true,
    });
  }

  /**
   * Enables a specific event name.
   */
  public withEvent(name: EventName, active?: boolean) {
    this.requireExpr(this._options.events, "Events are not enabled. Use events() before setEvent()");
    this._options.eventOptions[name] = active ?? true;
    return this;
  }

  /**
   * Registers a {@link RemoveListener} function. For cache removals.
   */
  public removalListener(listener: RemoveListener<K, V>) {
    this._options.removeListener = listener;
    return this;
  }

  /**
   * Sets the caching strategy to the specified policy.
   */
  public policy(policy: Policy<K, V>) {
    this.requireExpr(this._options.capacity !== 0, "Capacity must be set before policy");
    this._options.policy = policy;
    return this;
  }

  /**
   * Short-hand for setting the policy to {@link Arc}
   */
  public arc() {
    return this.policy(new Arc<K, V>(this._options.capacity));
  }

  /**
   * Short-hand for setting the policy to {@link Lru}
   */
  public lru() {
    return this.policy(new Lru<K, V>(this._options.capacity));
  }

  /**
   * Short-hand for setting the policy to {@link SecondChance}
   */
  public sc() {
    return this.policy(new SecondChance<K, V>(this._options.capacity));
  }

  /**
   * Short-hand for setting the policy to {@link Lfu}
   */
  public lfu() {
    return this.policy(new Lfu<K, V>(this._options.capacity));
  }

  /**
   * Short-hand for setting the policy to {@link WindowTinyLfu}
   */
  public tinyLfu() {
    return this.policy(new WindowTinyLfu<K, V>(this._options.capacity));
  }

  /**
   * Builds a {@link Cache} or {@link LoadingCache} instance based on the
   * options specified with this builder.
   */
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

    if (this._options.events) {
      cache = new EventCapability<K, V>(cache, this._options.eventOptions);
    }

    if (this._options.ttl) {
      cache = new ExpireCapability<K, V>(cache, this._options.ttl, this._options.ttlOptions);
    }

    if (this._options.stats) {
      cache = new StatisticsCapability<K, V>(cache, new Counter());
    }

    if (loader) {
      cache = new LoadingCapability<K, V>(cache, loader);
    }

    return cache;
  }

  private requireExpr(expression: boolean, message?: string) {
    if (!expression) {
      throw new Error(message);
    }
  }
}
